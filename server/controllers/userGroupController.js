import UserGroup from '../models/UserGroup.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Get all user groups
 * GET /api/usergroups
 * Access: SuperAdmin, Admin
 */
export const getUserGroups = async (req, res, next) => {
  try {
    const userGroups = await UserGroup.find()
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive')
      .sort({ created: -1 });

    res.status(200).json({
      success: true,
      count: userGroups.length,
      data: userGroups
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user group by ID
 * GET /api/usergroups/:id
 * Access: SuperAdmin, Admin
 */
export const getUserGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user group ID format'
      });
    }

    const userGroup = await UserGroup.findById(id)
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive');

    if (!userGroup) {
      return res.status(404).json({
        success: false,
        message: 'User group not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userGroup
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user group
 * POST /api/usergroups
 * Access: SuperAdmin only
 */
export const createUserGroup = async (req, res, next) => {
  try {
    const { name, description, admins, users, isActive } = req.body;
    const creatorUsername = req.user?.username || 'system';

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Validate admins array - ensure they are actual admin users
    if (admins && admins.length > 0) {
      const adminUsers = await User.find({
        _id: { $in: admins },
        role: { $in: ['admin', 'superadmin'] }
      });

      if (adminUsers.length !== admins.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more admin IDs are invalid or users are not admins'
        });
      }
    }

    // Validate users array - ensure they exist
    if (users && users.length > 0) {
      const userCount = await User.countDocuments({
        _id: { $in: users }
      });

      if (userCount !== users.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more user IDs are invalid'
        });
      }
    }

    // Create user group
    const userGroup = await UserGroup.create({
      name,
      description,
      admins: admins || [],
      users: users || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: creatorUsername,
      updatedBy: creatorUsername,
      created: new Date()
    });

    // Populate the response
    const populatedGroup = await UserGroup.findById(userGroup._id)
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive');

    res.status(201).json({
      success: true,
      data: populatedGroup,
      message: 'User group created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user group with this name already exists'
      });
    }
    next(error);
  }
};

/**
 * Update user group
 * PUT /api/usergroups/:id
 * Access: SuperAdmin, Admin (admins can only add/remove users)
 */
export const updateUserGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, admins, users, isActive } = req.body;
    const updaterUsername = req.user?.username || 'system';
    const userRole = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user group ID format'
      });
    }

    const userGroup = await UserGroup.findById(id);

    if (!userGroup) {
      return res.status(404).json({
        success: false,
        message: 'User group not found'
      });
    }

    // If user is admin (not superadmin), check if they're a group admin
    if (userRole === 'admin') {
      const isGroupAdmin = userGroup.isGroupAdmin(req.user._id);
      
      if (!isGroupAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You must be a group admin to update this group'
        });
      }

      // Admins can only update users array
      if (users !== undefined) {
        // Validate users array
        if (users.length > 0) {
          const userCount = await User.countDocuments({
            _id: { $in: users }
          });

          if (userCount !== users.length) {
            return res.status(400).json({
              success: false,
              message: 'One or more user IDs are invalid'
            });
          }
        }
        userGroup.users = users;
      }

      // Admins cannot modify name, description, admins, or isActive
      if (name || description || admins || isActive !== undefined) {
        return res.status(403).json({
          success: false,
          message: 'Admins can only add/remove users from the group'
        });
      }
    } else {
      // SuperAdmin can update everything
      if (name) userGroup.name = name;
      if (description) userGroup.description = description;
      if (isActive !== undefined) userGroup.isActive = isActive;

      // Validate and update admins
      if (admins !== undefined) {
        if (admins.length > 0) {
          const adminUsers = await User.find({
            _id: { $in: admins },
            role: { $in: ['admin', 'superadmin'] }
          });

          if (adminUsers.length !== admins.length) {
            return res.status(400).json({
              success: false,
              message: 'One or more admin IDs are invalid or users are not admins'
            });
          }
        }
        userGroup.admins = admins;
      }

      // Validate and update users
      if (users !== undefined) {
        if (users.length > 0) {
          const userCount = await User.countDocuments({
            _id: { $in: users }
          });

          if (userCount !== users.length) {
            return res.status(400).json({
              success: false,
              message: 'One or more user IDs are invalid'
            });
          }
        }
        userGroup.users = users;
      }
    }

    userGroup.updatedBy = updaterUsername;
    await userGroup.save();

    // Populate the response
    const populatedGroup = await UserGroup.findById(userGroup._id)
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive');

    res.status(200).json({
      success: true,
      data: populatedGroup,
      message: 'User group updated successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user group with this name already exists'
      });
    }
    next(error);
  }
};

/**
 * Delete user group
 * DELETE /api/usergroups/:id
 * Access: SuperAdmin only
 */
export const deleteUserGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user group ID format'
      });
    }

    const userGroup = await UserGroup.findById(id);

    if (!userGroup) {
      return res.status(404).json({
        success: false,
        message: 'User group not found'
      });
    }

    await UserGroup.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User group deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add users to a user group
 * POST /api/usergroups/:id/users
 * Access: SuperAdmin, Group Admins
 */
export const addUsersToGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const updaterUsername = req.user?.username || 'system';
    const userRole = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user group ID format'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required'
      });
    }

    const userGroup = await UserGroup.findById(id);

    if (!userGroup) {
      return res.status(404).json({
        success: false,
        message: 'User group not found'
      });
    }

    // Check authorization for admins
    if (userRole === 'admin' && !userGroup.isGroupAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a group admin to add users'
      });
    }

    // Validate user IDs
    const validUsers = await User.find({
      _id: { $in: userIds }
    });

    if (validUsers.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more user IDs are invalid'
      });
    }

    // Add users (avoid duplicates)
    const existingUserIds = userGroup.users.map(u => u.toString());
    const newUserIds = userIds.filter(uid => !existingUserIds.includes(uid.toString()));
    
    userGroup.users.push(...newUserIds);
    userGroup.updatedBy = updaterUsername;
    await userGroup.save();

    const populatedGroup = await UserGroup.findById(userGroup._id)
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive');

    res.status(200).json({
      success: true,
      data: populatedGroup,
      message: `${newUserIds.length} user(s) added to group successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove users from a user group
 * DELETE /api/usergroups/:id/users
 * Access: SuperAdmin, Group Admins
 */
export const removeUsersFromGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const updaterUsername = req.user?.username || 'system';
    const userRole = req.user?.role || (req.user?.isAdmin ? 'admin' : 'user');

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user group ID format'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required'
      });
    }

    const userGroup = await UserGroup.findById(id);

    if (!userGroup) {
      return res.status(404).json({
        success: false,
        message: 'User group not found'
      });
    }

    // Check authorization for admins
    if (userRole === 'admin' && !userGroup.isGroupAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You must be a group admin to remove users'
      });
    }

    // Remove users
    userGroup.users = userGroup.users.filter(
      userId => !userIds.includes(userId.toString())
    );
    
    userGroup.updatedBy = updaterUsername;
    await userGroup.save();

    const populatedGroup = await UserGroup.findById(userGroup._id)
      .populate('admins', 'username role isActive')
      .populate('users', 'username role isActive');

    res.status(200).json({
      success: true,
      data: populatedGroup,
      message: 'Users removed from group successfully'
    });
  } catch (error) {
    next(error);
  }
};

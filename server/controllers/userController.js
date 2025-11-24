import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ created: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          created: user.created,
          createdBy: user.createdBy,
          updated: user.updated,
          updatedBy: user.updatedBy
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        created: user.created,
        createdBy: user.createdBy,
        updated: user.updated,
        updatedBy: user.updatedBy
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      role: role || 'user',
      isActive: true,
      created: new Date(),
      createdBy: req.user?.username || 'system',
      updated: null,
      updatedBy: null
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        created: user.created,
        createdBy: user.createdBy,
        updated: user.updated,
        updatedBy: user.updatedBy
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { username, password, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (username) user.username = username;
    if (password) user.password = password;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    
    // Update system fields - preserve created/createdBy, update updated/updatedBy
    user.updated = new Date();
    user.updatedBy = req.user?.username || 'system';

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        created: user.created,
        createdBy: user.createdBy,
        updated: user.updated,
        updatedBy: user.updatedBy
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

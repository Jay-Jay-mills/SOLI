import User from '../models/User.js';

/**
 * User Service
 * Handles user management business logic
 */
class UserService {
  /**
   * Get all users with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {object} Users and pagination info
   */
  async getUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ created: -1 });

    const total = await User.countDocuments();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Create new user
   * @param {object} userData - User data
   * @param {string} creatorId - ID of user creating this user
   * @returns {object} Created user
   */
  async createUser(userData, creatorId) {
    const { username, password, isAdmin, isSOLI, isActive } = userData;

    // Validate input
    if (!username || !password) {
      throw new Error('Please provide username and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create user
    const user = await User.create({
      username,
      password,
      isAdmin: isAdmin || false,
      isSOLI: isSOLI || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: creatorId || 'system',
      updatedBy: creatorId || 'system'
    });

    // Remove password from output
    user.password = undefined;

    return user;
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @param {string} updaterId - ID of user performing the update
   * @returns {object} Updated user
   */
  async updateUser(userId, updateData, updaterId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Update allowed fields
    const allowedUpdates = ['username', 'password', 'isAdmin', 'isSOLI', 'isActive'];
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    // Set updatedBy
    user.updatedBy = updaterId || 'system';

    await user.save();

    // Remove password from output
    user.password = undefined;

    return user;
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @param {string} requesterId - ID of user requesting deletion
   * @returns {object} Deletion result
   */
  async deleteUser(userId, requesterId) {
    // Prevent self-deletion
    if (userId === requesterId) {
      const error = new Error('You cannot delete your own account');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndDelete(userId);

    return { message: 'User deleted successfully' };
  }

  /**
   * Format user data for response
   * @param {object} user - User object
   * @returns {object} Formatted user data
   */
  formatUserResponse(user) {
    return {
      id: user._id,
      username: user.username,
      email: user.username + '@example.com',
      firstName: user.username,
      lastName: 'User',
      role: user.isAdmin ? 'admin' : 'user',
      status: user.isActive ? 'active' : 'inactive',
      isSOLI: user.isSOLI,
      isActive: user.isActive,
      created: user.created,
      createdBy: user.createdBy,
      updated: user.updated,
      updatedBy: user.updatedBy
    };
  }
}

export default new UserService();

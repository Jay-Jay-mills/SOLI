import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Auth Service
 * Handles authentication business logic
 */
class AuthService {
  /**
   * Generate JWT Access Token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1h'
    });
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {object} User and token
   */
  async login(username, password) {
    // Validate input
    if (!username || !password) {
      throw new Error('Please provide username and password');
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is inactive. Please contact administrator.');
      error.statusCode = 403;
      throw error;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const accessToken = this.generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    return {
      user,
      accessToken,
      expiresIn: 3600
    };
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User
   */
  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
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
      isAdmin: user.isAdmin,
      isSOLI: user.isSOLI,
      isActive: user.isActive,
      created: user.created,
      createdBy: user.createdBy,
      updated: user.updated,
      updatedBy: user.updatedBy
    };
  }
}

export default new AuthService();

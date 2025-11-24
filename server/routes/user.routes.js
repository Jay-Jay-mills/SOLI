import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all users - superadmin and admin only
router.get('/', authorize('superadmin', 'admin'), getUsers);

// Create user - superadmin only
router.post('/', authorize('superadmin'), createUser);

// Get user by ID - superadmin and admin only
router.get('/:id', authorize('superadmin', 'admin'), getUser);

// Update user - superadmin only
router.put('/:id', authorize('superadmin'), updateUser);

// Delete user - superadmin only
router.delete('/:id', authorize('superadmin'), deleteUser);

export default router;

import express from 'express';
import {
  getUserGroups,
  getUserGroupById,
  createUserGroup,
  updateUserGroup,
  deleteUserGroup,
  addUsersToGroup,
  removeUsersFromGroup
} from '../controllers/userGroupController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all user groups - SuperAdmin and Admin
router.get('/', authorize('superadmin', 'admin'), getUserGroups);

// Create user group - SuperAdmin only
router.post('/', authorize('superadmin'), createUserGroup);

// Get user group by ID - SuperAdmin and Admin
router.get('/:id', authorize('superadmin', 'admin'), getUserGroupById);

// Update user group - SuperAdmin and Admin (with restrictions for admin)
router.put('/:id', authorize('superadmin', 'admin'), updateUserGroup);

// Delete user group - SuperAdmin only
router.delete('/:id', authorize('superadmin'), deleteUserGroup);

// Add users to group - SuperAdmin and Group Admins
router.post('/:id/users', authorize('superadmin', 'admin'), addUsersToGroup);

// Remove users from group - SuperAdmin and Group Admins
router.delete('/:id/users', authorize('superadmin', 'admin'), removeUsersFromGroup);

export default router;

import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByStatus,
  getDeletedProjects,
  getDeletedProjectById,
  restoreProject,
  permanentlyDeleteProject
} from '../controllers/projectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project routes
router.get('/', getProjects);
router.get('/deleted', getDeletedProjects);
router.get('/deleted/:id', getDeletedProjectById);
router.get('/status/:status', getProjectsByStatus);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.put('/:id/restore', restoreProject);
router.delete('/:id', deleteProject);
router.delete('/:id/permanent', permanentlyDeleteProject);

export default router;

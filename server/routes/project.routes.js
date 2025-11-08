import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByStatus
} from '../controllers/projectController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Project routes
router.get('/', getProjects);
router.get('/status/:status', getProjectsByStatus);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;

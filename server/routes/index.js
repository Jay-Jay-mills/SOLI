import express from 'express';

const router = express.Router();

// Import individual route modules
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import formRoutes from './form.routes.js';
import projectRoutes from './project.routes.js';
import fileRoutes from './file.routes.js';

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/forms', formRoutes);
router.use('/projects', projectRoutes);
router.use('/files', fileRoutes);

export default router;

import express from 'express';

const router = express.Router();

// Import individual route modules
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import formRoutes from './form.routes.js';

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/forms', formRoutes);

export default router;

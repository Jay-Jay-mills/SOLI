import express from 'express';
import { downloadFile, getFileInfo } from '../controllers/fileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// File routes
router.get('/download/:filename', downloadFile);
router.get('/info/:filename', getFileInfo);

export default router;

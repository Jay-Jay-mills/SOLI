import express from 'express';
import {
  createForm,
  getFormByProjectId,
  getFormById,
  updateForm,
  deleteForm,
  submitFormData,
  getFormSubmissions,
  getSubmissionsByProjectId,
  getSubmission,
  updateSubmission,
  deleteSubmission
} from '../controllers/formController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Form routes
router.post('/', createForm);
router.get('/project/:projectId', getFormByProjectId);
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

// Submission routes
router.post('/:id/submissions', submitFormData);
router.get('/:id/submissions', getFormSubmissions);
router.get('/project/:projectId/submissions', getSubmissionsByProjectId);
router.get('/submissions/:id', getSubmission);
router.put('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);

export default router;

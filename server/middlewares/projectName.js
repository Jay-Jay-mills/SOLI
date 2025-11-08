import Form from '../models/Form.js';
import Project from '../models/Project.js';
import Submission from '../models/Submission.js';
import mongoose from 'mongoose';

/**
 * Middleware to inject project name into request body before file upload
 * This ensures files are uploaded to the correct project folder
 */
export const injectProjectName = async (req, res, next) => {
  try {
    let projectId;

    // For form submissions - get project from form
    if (req.params.id && req.path.includes('/submissions')) {
      const formId = req.params.id;
      
      if (mongoose.Types.ObjectId.isValid(formId)) {
        const form = await Form.findById(formId);
        if (form) {
          projectId = form.projectId;
        }
      }
    }

    // For submission updates - get project from submission
    if (req.params.id && req.path.includes('/submissions/')) {
      const submissionId = req.params.id;
      
      if (mongoose.Types.ObjectId.isValid(submissionId)) {
        const submission = await Submission.findById(submissionId);
        if (submission) {
          projectId = submission.projectId;
        }
      }
    }

    // Get project name and inject into request body
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId);
      if (project) {
        req.body.projectName = project.name;
      }
    }

    next();
  } catch (error) {
    console.error('Error in injectProjectName middleware:', error);
    // Continue anyway - don't block the request
    next();
  }
};

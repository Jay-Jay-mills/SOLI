import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sanitizeFolderName } from '../utils/fileManager.js';
import Form from '../models/Form.js';
import Project from '../models/Project.js';
import Submission from '../models/Submission.js';
import mongoose from 'mongoose';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Get project name from request parameters
 */
const getProjectName = async (req) => {
  try {
    let projectId;

    // For form submissions - get project from form
    if (req.params.id && req.originalUrl.includes('/submissions')) {
      const formId = req.params.id;
      
      if (mongoose.Types.ObjectId.isValid(formId)) {
        const form = await Form.findById(formId);
        if (form && form.projectId) {
          projectId = form.projectId;
        }
      }
    }

    // For submission updates - get project from submission  
    if (req.params.id && req.originalUrl.includes('/submissions/')) {
      const submissionId = req.params.id;
      
      if (mongoose.Types.ObjectId.isValid(submissionId)) {
        const submission = await Submission.findById(submissionId);
        if (submission && submission.projectId) {
          projectId = submission.projectId;
        }
      }
    }

    // Get project name
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const project = await Project.findById(projectId);
      if (project) {
        return project.name;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting project name:', error);
    return null;
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      // Get project name dynamically
      const projectName = await getProjectName(req);
      
      let projectFolder = uploadDir;
      
      if (projectName) {
        const sanitizedName = sanitizeFolderName(projectName);
        projectFolder = path.join(uploadDir, sanitizedName);
        
        // Create project folder if it doesn't exist
        if (!fs.existsSync(projectFolder)) {
          fs.mkdirSync(projectFolder, { recursive: true });
          console.log(`📁 Created project folder: ${projectFolder}`);
        }
      }
      
      cb(null, projectFolder);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(null, uploadDir); // Fallback to default uploads folder
    }
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, images, TXT, and ZIP files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

export default upload;

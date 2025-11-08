import Form from '../models/Form.js';
import Submission from '../models/Submission.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';

/**
 * Create a new form for a project
 * POST /api/forms
 */
export const createForm = async (req, res, next) => {
  try {
    const { projectId, name, description, fields } = req.body;
    const userId = req.user?.username || 'system';

    // Validate required fields
    if (!projectId || !name || !fields || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, name, and at least one field are required'
      });
    }

    // Create form
    const form = await Form.create({
      projectId,
      name,
      description,
      fields,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      data: form,
      message: 'Form created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form by project ID
 * GET /api/forms/project/:projectId
 */
export const getFormByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const form = await Form.findOne({ projectId, isActive: true });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'No active form found for this project'
      });
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get form by ID
 * GET /api/forms/:id
 */
export const getFormById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID format'
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update form
 * PUT /api/forms/:id
 */
export const updateForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, fields } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID format'
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Update fields
    if (name) form.name = name;
    if (description !== undefined) form.description = description;
    if (fields) form.fields = fields;
    form.updated = Date.now();

    await form.save();

    res.status(200).json({
      success: true,
      data: form,
      message: 'Form updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete form
 * DELETE /api/forms/:id
 */
export const deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID format'
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Soft delete - set isActive to false
    form.isActive = false;
    await form.save();

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit form data
 * POST /api/forms/:id/submissions
 */
export const submitFormData = async (req, res, next) => {
  try {
    const { id: formId } = req.params;
    const userId = req.user?.username || 'system';
    const userIsSOLI = req.user?.isSOLI || false;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID format'
      });
    }

    // Validate form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Get project for folder path
    const project = await Project.findById(form.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Parse data from request body
    let data;
    try {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Auto-populate system fields for SOLI users
    if (userIsSOLI) {
      data.isDeleted = data.isDeleted || 'false';
      data.created = new Date().toISOString();
      data.createdBy = userId;
      data.updated = null;
      data.updatedBy = null;
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('📎 Processing uploaded files:', req.files.length);
      
      // Group files by field name
      const filesByField = {};
      req.files.forEach(file => {
        console.log('📁 File uploaded:', {
          fieldname: file.fieldname,
          filename: file.filename,
          originalname: file.originalname,
          path: file.path
        });
        
        // Use the fieldname directly (no need to remove array notation with upload.any())
        const fieldName = file.fieldname;
        if (!filesByField[fieldName]) {
          filesByField[fieldName] = [];
        }
        filesByField[fieldName].push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });

      // Add file info to data
      Object.keys(filesByField).forEach(fieldName => {
        data[fieldName] = filesByField[fieldName];
        console.log(`✅ Added files to field '${fieldName}':`, data[fieldName]);
      });
    }

    // Create submission
    const submission = await Submission.create({
      formId,
      projectId: form.projectId,
      data,
      submittedBy: userId
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Submission created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all submissions for a form
 * GET /api/forms/:id/submissions
 */
export const getFormSubmissions = async (req, res, next) => {
  try {
    const { id: formId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form ID format'
      });
    }

    const submissions = await Submission.find({ formId })
      .sort({ submitted: -1 });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get submissions by project ID
 * GET /api/forms/project/:projectId/submissions
 */
export const getSubmissionsByProjectId = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const submissions = await Submission.find({ projectId })
      .sort({ submitted: -1 });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single submission
 * GET /api/forms/submissions/:id
 */
export const getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format'
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update submission
 * PUT /api/forms/submissions/:id
 */
export const updateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.username || 'system';
    const userIsSOLI = req.user?.isSOLI || false;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format'
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Parse data from request body
    let data;
    try {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format'
      });
    }

    // Auto-update system fields for SOLI users
    if (userIsSOLI) {
      // Preserve original created and createdBy
      data.created = submission.data.created;
      data.createdBy = submission.data.createdBy;
      // Update the updated fields
      data.updated = new Date().toISOString();
      data.updatedBy = userId;
      // Preserve or update isDeleted
      data.isDeleted = data.isDeleted || submission.data.isDeleted || 'false';
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      console.log('📎 Processing uploaded files for update:', req.files.length);
      
      // Group files by field name
      const filesByField = {};
      req.files.forEach(file => {
        console.log('📁 File uploaded:', {
          fieldname: file.fieldname,
          filename: file.filename,
          originalname: file.originalname,
          path: file.path
        });
        
        // Use the fieldname directly
        const fieldName = file.fieldname;
        if (!filesByField[fieldName]) {
          filesByField[fieldName] = [];
        }
        filesByField[fieldName].push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });

      // Add file info to data
      Object.keys(filesByField).forEach(fieldName => {
        data[fieldName] = filesByField[fieldName];
        console.log(`✅ Updated files for field '${fieldName}':`, data[fieldName]);
      });
    }

    submission.data = data;
    submission.submitted = Date.now();
    await submission.save();

    res.status(200).json({
      success: true,
      data: submission,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete submission
 * DELETE /api/forms/submissions/:id
 */
export const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format'
      });
    }

    const submission = await Submission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

import Project from '../models/Project.js';
import mongoose from 'mongoose';
import { createProjectFolder, renameProjectFolder, deleteProjectFolder } from '../utils/fileManager.js';

/**
 * Get all projects (filtered by user's isSoli status)
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    // Get all projects (no filtering by isSOLI)
    const projects = await Project.find({
      isDeleted: false
    })
      .populate('admins', 'firstName lastName email username')
      .populate('users', 'firstName lastName email username')
      .sort({ created: -1 });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    })
      .populate('admins', 'firstName lastName email username')
      .populate('users', 'firstName lastName email username');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new project
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const { name, description, status, admins, users } = req.body;
    const userId = req.user?.username || 'system';
    const userIsSOLI = req.user?.isSOLI || false;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Create project with user's SOLI status
    const project = await Project.create({
      name,
      description,
      status: status || 'active',
      admins: admins || [],
      users: users || [],
      isSoli: userIsSOLI,
      isDeleted: false,
      createdBy: userId,
      created: new Date()
    });

    // Create project-specific folder
    const folderResult = createProjectFolder(name);
    if (!folderResult.success) {
      console.error('Failed to create project folder:', folderResult.error);
      // Continue anyway - folder creation is not critical
    }

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, admins, users } = req.body;
    const userId = req.user?.username || 'system';

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Track old name for folder renaming
    const oldName = project.name;
    const nameChanged = name && name !== oldName;

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (admins) project.admins = admins;
    if (users) project.users = users;
    project.updated = new Date();
    project.updatedBy = userId;

    await project.save();

    // Rename project folder if name changed
    if (nameChanged) {
      const renameResult = renameProjectFolder(oldName, name);
      if (!renameResult.success) {
        console.error('Failed to rename project folder:', renameResult.error);
        // Continue anyway - folder rename is not critical
      }
    }

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project (soft delete)
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.username || 'system';

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format'
      });
    }

    const project = await Project.findOne({
      _id: id,
      isDeleted: false
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Store project name for folder deletion
    const projectName = project.name;

    // Soft delete - keep data in database
    project.isDeleted = true;
    project.updated = new Date();
    project.updatedBy = userId;
    await project.save();

    // Permanently delete project folder and all files
    const deleteResult = deleteProjectFolder(projectName);
    if (!deleteResult.success) {
      console.error('Failed to delete project folder:', deleteResult.error);
      // Continue anyway - data is soft deleted in DB
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get projects by status
 * GET /api/projects/status/:status
 */
export const getProjectsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    const projects = await Project.find({
      status,
      isDeleted: false
    }).sort({ created: -1 });

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

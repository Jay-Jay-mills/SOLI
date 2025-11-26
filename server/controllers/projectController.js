import { projectService } from '../services/index.js';

/**
 * Get all projects (filtered by user role)
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const userRole = req.user?.role;

    const projects = await projectService.getAllProjects(userId, userRole);

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
    const project = await projectService.getProjectById(id);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Create new project
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const userId = req.user?.username || 'system';
    const project = await projectService.createProject(req.body, userId);

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    if (error.message === 'Name and description are required') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
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
    const userId = req.user?.username || 'system';

    const project = await projectService.updateProject(id, req.body, userId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
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

    await projectService.deleteProject(id, userId);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
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
    const projects = await projectService.getProjectsByStatus(status);

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deleted projects (super admin only)
 * GET /api/projects/deleted
 */
export const getDeletedProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getDeletedProjects();

    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deleted project by ID (super admin only)
 * GET /api/projects/deleted/:id
 */
export const getDeletedProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectService.getDeletedProjectById(id);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Restore deleted project (super admin only)
 * PUT /api/projects/:id/restore
 */
export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.username || 'system';

    const project = await projectService.restoreProject(id, userId);

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project restored successfully'
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Permanently delete project (super admin only)
 * DELETE /api/projects/:id/permanent
 */
export const permanentlyDeleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    await projectService.permanentlyDeleteProject(id);

    res.status(200).json({
      success: true,
      message: 'Project permanently deleted'
    });
  } catch (error) {
    if (error.message === 'Invalid project ID format') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

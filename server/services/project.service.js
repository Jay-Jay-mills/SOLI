import Project from '../models/Project.js';
import mongoose from 'mongoose';
import { createProjectFolder, renameProjectFolder, deleteProjectFolder } from '../utils/fileManager.js';

/**
 * Get all projects with role-based filtering
 */
export const getAllProjects = async (userId, userRole) => {
    console.log('getAllProjects called with:', { userId, userRole });

    let query = { isDeleted: false };

    // If not SUPERADMIN, filter to only show projects where user is admin or member
    // Make role check case-insensitive
    if (userRole?.toUpperCase() !== 'SUPERADMIN') {
        query.$and = [
            { isDeleted: false },
            {
                $or: [
                    { admins: userId },
                    { users: userId }
                ]
            }
        ];
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    const projects = await Project.find(query)
        .populate('admins', 'firstName lastName email username')
        .populate('users', 'firstName lastName email username')
        .sort({ created: -1 });

    console.log('Found projects:', projects.length);

    return projects;
};

/**
 * Get single project by ID
 */
export const getProjectById = async (projectId) => {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    const project = await Project.findOne({
        _id: projectId,
        isDeleted: false
    })
        .populate('admins', 'firstName lastName email username')
        .populate('users', 'firstName lastName email username');

    if (!project) {
        throw new Error('Project not found');
    }

    return project;
};

/**
 * Create new project
 */
export const createProject = async (projectData, createdBy) => {
    const { name, description, status, admins, users } = projectData;

    // Validate required fields
    if (!name || !description) {
        throw new Error('Name and description are required');
    }

    // Create project
    const project = await Project.create({
        name,
        description,
        status: status || 'active',
        admins: admins || [],
        users: users || [],
        isDeleted: false,
        createdBy,
        created: new Date()
    });

    // Create project-specific folder
    const folderResult = createProjectFolder(name);
    if (!folderResult.success) {
        console.error('Failed to create project folder:', folderResult.error);
        // Continue anyway - folder creation is not critical
    }

    return project;
};

/**
 * Update existing project
 */
export const updateProject = async (projectId, updateData, updatedBy) => {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    const project = await Project.findOne({
        _id: projectId,
        isDeleted: false
    });

    if (!project) {
        throw new Error('Project not found');
    }

    const { name, description, status, admins, users } = updateData;

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
    project.updatedBy = updatedBy;

    await project.save();

    // Rename project folder if name changed
    if (nameChanged) {
        const renameResult = renameProjectFolder(oldName, name);
        if (!renameResult.success) {
            console.error('Failed to rename project folder:', renameResult.error);
            // Continue anyway - folder rename is not critical
        }
    }

    return project;
};

/**
 * Delete project (soft delete)
 */
export const deleteProject = async (projectId, deletedBy) => {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    const project = await Project.findOne({
        _id: projectId,
        isDeleted: false
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Store project name for folder deletion
    const projectName = project.name;

    // Soft delete - keep data in database
    project.isDeleted = true;
    project.updated = new Date();
    project.updatedBy = deletedBy;
    await project.save();

    // Permanently delete project folder and all files
    const deleteResult = deleteProjectFolder(projectName);
    if (!deleteResult.success) {
        console.error('Failed to delete project folder:', deleteResult.error);
        // Continue anyway - data is soft deleted in DB
    }

    return { success: true };
};

/**
 * Get projects by status
 */
export const getProjectsByStatus = async (status) => {
    const projects = await Project.find({
        status,
        isDeleted: false
    }).sort({ created: -1 });

    return projects;
};

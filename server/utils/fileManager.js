import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = process.env.UPLOAD_PATH || './uploads';

/**
 * Sanitize folder name to remove invalid characters
 */
export const sanitizeFolderName = (name) => {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
};

/**
 * Create a project-specific folder
 */
export const createProjectFolder = (projectName) => {
  const folderName = sanitizeFolderName(projectName);
  const projectPath = path.join(uploadDir, folderName);
  
  try {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
      console.log(`📁 Created project folder: ${projectPath}`);
    }
    return { success: true, path: projectPath, folderName };
  } catch (error) {
    console.error(`Error creating project folder: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Rename a project folder
 */
export const renameProjectFolder = (oldName, newName) => {
  const oldFolderName = sanitizeFolderName(oldName);
  const newFolderName = sanitizeFolderName(newName);
  const oldPath = path.join(uploadDir, oldFolderName);
  const newPath = path.join(uploadDir, newFolderName);
  
  try {
    // If old folder doesn't exist, create the new one
    if (!fs.existsSync(oldPath)) {
      return createProjectFolder(newName);
    }
    
    // If old and new names are the same, do nothing
    if (oldFolderName === newFolderName) {
      return { success: true, path: oldPath, folderName: oldFolderName };
    }
    
    // If new folder already exists, merge folders
    if (fs.existsSync(newPath)) {
      // Move all files from old to new
      const files = fs.readdirSync(oldPath);
      files.forEach(file => {
        const oldFilePath = path.join(oldPath, file);
        const newFilePath = path.join(newPath, file);
        fs.renameSync(oldFilePath, newFilePath);
      });
      // Remove old folder
      fs.rmdirSync(oldPath);
      console.log(`📁 Merged and removed old folder: ${oldPath}`);
    } else {
      // Rename folder
      fs.renameSync(oldPath, newPath);
      console.log(`📁 Renamed folder: ${oldPath} -> ${newPath}`);
    }
    
    return { success: true, path: newPath, folderName: newFolderName };
  } catch (error) {
    console.error(`Error renaming project folder: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a project folder and all its contents
 */
export const deleteProjectFolder = (projectName) => {
  const folderName = sanitizeFolderName(projectName);
  const projectPath = path.join(uploadDir, folderName);
  
  try {
    if (fs.existsSync(projectPath)) {
      // Remove folder and all contents recursively
      fs.rmSync(projectPath, { recursive: true, force: true });
      console.log(`🗑️  Deleted project folder: ${projectPath}`);
      return { success: true, message: 'Folder deleted successfully' };
    }
    return { success: true, message: 'Folder does not exist' };
  } catch (error) {
    console.error(`Error deleting project folder: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Get project folder path
 */
export const getProjectFolderPath = (projectName) => {
  const folderName = sanitizeFolderName(projectName);
  return path.join(uploadDir, folderName);
};

/**
 * List files in a project folder
 */
export const listProjectFiles = (projectName) => {
  const folderName = sanitizeFolderName(projectName);
  const projectPath = path.join(uploadDir, folderName);
  
  try {
    if (!fs.existsSync(projectPath)) {
      return { success: true, files: [] };
    }
    
    const files = fs.readdirSync(projectPath).map(filename => {
      const filePath = path.join(projectPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });
    
    return { success: true, files };
  } catch (error) {
    console.error(`Error listing project files: ${error.message}`);
    return { success: false, error: error.message };
  }
};

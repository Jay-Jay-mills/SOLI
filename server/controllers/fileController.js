import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = process.env.UPLOAD_PATH || './uploads';

/**
 * Download a file
 * GET /api/files/download/:filename
 */
export const downloadFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Prevent directory traversal attacks
    const safePath = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, '..', uploadDir, safePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Send file
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

/**
 * Get file info
 * GET /api/files/info/:filename
 */
export const getFileInfo = async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Prevent directory traversal attacks
    const safePath = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(__dirname, '..', uploadDir, safePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        filename: path.basename(filePath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      }
    });
  } catch (error) {
    next(error);
  }
};

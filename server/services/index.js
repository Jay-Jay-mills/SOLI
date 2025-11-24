/**
 * Services Index
 * Centralizes all service exports
 */

import * as authService from './auth.service.js';
import * as userService from './user.service.js';
import * as projectService from './project.service.js';

export {
    authService,
    userService,
    projectService
};

import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user.routes.js';
import { protect, authorize } from '../../middlewares/auth.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import '../setup.js';

// Create Express app with middleware
const app = express();
app.use(express.json());

// Mount routes (they already have protect and authorize inside them)
app.use('/api/users', userRoutes);

// Helper function to create auth token
const createAuthToken = (user) => {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('User API', () => {
  let adminUser;
  let authToken;

  beforeEach(async () => {
    // Create an admin user for authentication with unique username
    // Using Math.random to ensure uniqueness even within same millisecond
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    adminUser = await User.create({
      username: `admin-${uniqueId}`,
      password: 'Admin@1234',
      isAdmin: true,
      isSOLI: false,
      isActive: true,
      created: new Date(),
      createdBy: 'system',
    });

    authToken = createAuthToken(adminUser);
  });

  describe('GET /api/users', () => {
    it('should get all users when authenticated as admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        username: 'testuser',
        password: 'Test@1234',
        isAdmin: false,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).toHaveProperty('isAdmin', false);
    });

    it('should fail with duplicate username', async () => {
      const newUser = {
        username: adminUser.username, // Use existing admin username
        password: 'Test@1234',
        isAdmin: false,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should inherit isSOLI from creator', async () => {
      const newUser = {
        username: 'testuser',
        password: 'Test@1234',
        isAdmin: false,
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('isSOLI', adminUser.isSOLI);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const user = await User.create({
        username: 'updateuser',
        password: 'Test@1234',
        isAdmin: false,
        isSOLI: false,
        isActive: true,
        created: new Date(),
        createdBy: adminUser.username,
      });

      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isActive', false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const user = await User.create({
        username: 'deleteuser',
        password: 'Test@1234',
        isAdmin: false,
        isSOLI: false,
        isActive: true,
        created: new Date(),
        createdBy: adminUser.username,
      });

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify user is deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });
});

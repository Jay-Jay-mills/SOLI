import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.routes.js';
import User from '../../models/User.js';
import '../setup.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  let testUsername;
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user with unique username
      // Using Math.random to ensure uniqueness even within same millisecond
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      testUsername = `testadmin-${uniqueId}`;
      
      await User.create({
        username: testUsername,
        password: 'Test@1234',
        isAdmin: true,
        isSOLI: false,
        isActive: true,
        created: new Date(),
        createdBy: 'system',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'Test@1234',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('expiresIn', 3600);
    });

    it('should fail with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'Test@1234',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});

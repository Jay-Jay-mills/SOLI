import request from 'supertest';
import express from 'express';
import customerRoutes from '../../routes/customer.routes.js';
import { protect } from '../../middlewares/auth.js';
import Customer from '../../models/Customer.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import '../setup.js';

// Create Express app with middleware
const app = express();
app.use(express.json());

// Mount routes (they already have protect inside them)
app.use('/api/customers', customerRoutes);

// Helper function to create auth token
const createAuthToken = (user) => {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('Customer API', () => {
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
      isSOLI: true,
      isActive: true,
      created: new Date(),
      createdBy: 'system',
    });

    authToken = createAuthToken(adminUser);
  });

  describe('GET /api/customers', () => {
    it('should get all active customers', async () => {
      // Create test customers
      await Customer.create({
        name: 'Customer 1',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      await Customer.create({
        name: 'Customer 2',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not return deleted customers', async () => {
      await Customer.create({
        name: 'Active Customer',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      await Customer.create({
        name: 'Deleted Customer',
        isActive: true,
        isDeleted: true,
        created: new Date(),
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Active Customer');
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'Test Customer',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Customer');
      expect(response.body.isActive).toBe(true);
      expect(response.body.isDeleted).toBe(false);
    });

    it('should default isActive to true', async () => {
      const newCustomer = {
        name: 'Test Customer 2',
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer);

      expect(response.status).toBe(201);
      expect(response.body.isActive).toBe(true);
    });

    it('should fail with duplicate customer name', async () => {
      await Customer.create({
        name: 'Duplicate Customer',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      const newCustomer = {
        name: 'Duplicate Customer',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const customer = await Customer.create({
        name: 'Update Customer',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .put(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Customer Name',
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Customer Name');
      expect(response.body.isActive).toBe(false);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should soft delete a customer', async () => {
      const customer = await Customer.create({
        name: 'Delete Customer',
        isActive: true,
        isDeleted: false,
        created: new Date(),
        createdBy: adminUser._id,
      });

      const response = await request(app)
        .delete(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify customer is soft deleted
      const deletedCustomer = await Customer.findById(customer._id);
      expect(deletedCustomer.isDeleted).toBe(true);
    });
  });
});

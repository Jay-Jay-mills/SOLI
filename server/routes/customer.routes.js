import express from 'express';
import {
  getCustomers,
  getActiveCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all customers with pagination
router.get('/', getCustomers);

// Get active customers (for dropdowns)
router.get('/active', getActiveCustomers);

// Get customer by ID
router.get('/:id', getCustomerById);

// Create new customer
router.post('/', createCustomer);

// Update customer
router.put('/:id', updateCustomer);

// Delete customer (soft delete)
router.delete('/:id', deleteCustomer);

export default router;

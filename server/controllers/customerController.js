import Customer from '../models/Customer.js';

// Get all customers with pagination and filters
export const getCustomers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, search, isActive } = req.query;
    const query = { isDeleted: false };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Add isActive filter
    if (typeof isActive !== 'undefined') {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ created: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query),
    ]);

    res.json({
      data: customers,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

// Get active customers only (for dropdowns)
export const getActiveCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ 
      isDeleted: false, 
      isActive: true 
    })
      .select('name')
      .sort({ name: 1 });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching active customers:', error);
    res.status(500).json({ message: 'Error fetching active customers', error: error.message });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if customer with same name already exists
    const existingCustomer = await Customer.findOne({ 
      name, 
      isDeleted: false 
    });

    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this name already exists' });
    }

    const customer = new Customer({
      name,
      isActive: isActive !== undefined ? isActive : true, // Default to true
      // System fields - auto-populated
      isDeleted: false,
      created: new Date(),
      createdBy: userId,
      updated: null,
      updatedBy: null,
    });

    await customer.save();

    const populatedCustomer = await Customer.findById(customer._id)
      .populate('createdBy', 'username');

    res.status(201).json(populatedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const userId = req.user?.userId || req.user?._id;

    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if new name conflicts with existing customer
    if (name && name !== customer.name) {
      const existingCustomer = await Customer.findOne({ 
        name, 
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this name already exists' });
      }
    }

    // Update user-editable fields
    if (name) customer.name = name;
    if (typeof isActive !== 'undefined') customer.isActive = isActive;
    
    // Update system fields - preserve created/createdBy, update updated/updatedBy
    customer.updated = new Date();
    customer.updatedBy = userId;

    await customer.save();

    const updatedCustomer = await Customer.findById(customer._id)
      .populate('createdBy', 'username firstName lastName')
      .populate('updatedBy', 'username firstName lastName');

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

// Delete customer (soft delete)
export const deleteCustomer = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Soft delete - set isDeleted to true, update system fields
    customer.isDeleted = true;
    customer.updated = new Date();
    customer.updatedBy = userId;

    await customer.save();

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

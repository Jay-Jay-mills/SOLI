import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

// Connect to test database before all tests
beforeAll(async () => {
  try {
    const mongoURI = process.env.MONGO_URI_TEST;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI_TEST is not defined');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('🧪 Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    process.exit(1);
  }
}, 10000); // Timeout for this specific hook

// Disconnect from test database after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 Test database disconnected');
  } catch (error) {
    console.error('❌ Error closing test database:', error.message);
  }
}, 10000); // Timeout for this specific hook

// Clear all collections before each test
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
      } catch (error) {
        // Ignore errors for collections that don't exist
        if (error.code !== 26) { // NamespaceNotFound
          console.error(`Error clearing collection ${key}:`, error.message);
        }
      }
    }
  }
}, 10000); // Timeout for this specific hook

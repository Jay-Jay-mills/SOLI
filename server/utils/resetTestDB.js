import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resetTestDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI_TEST;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI_TEST is not defined in environment variables');
    }

    console.log('🧪 Connecting to test database...');
    const conn = await mongoose.connect(mongoURI);
    const dbName = conn.connection.db.databaseName;
    
    console.log(`📦 Connected to database: ${dbName}`);
    console.log('⚠️  WARNING: This will delete all data in the test database!');
    console.log('🗑️  Dropping test database...');
    
    await conn.connection.db.dropDatabase();
    
    console.log('✅ Test database has been reset successfully!');
    console.log('💡 You can now run: npm run seed:test to create a new admin user');
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error resetting test database: ${error.message}`);
    process.exit(1);
  }
};

resetTestDatabase();

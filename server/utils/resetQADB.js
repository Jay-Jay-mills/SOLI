import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load QA environment variables
dotenv.config({ path: '.env.qa' });

const resetQADB = async () => {
  try {
    // Set NODE_ENV to qa
    process.env.NODE_ENV = 'qa';
    
    const mongoURI = process.env.MONGO_URI_QA;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI_QA is not defined in .env.qa file');
    }

    console.log('🔬 Connecting to QA database...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to: ${dbName}`);

    // Drop the entire database
    await mongoose.connection.dropDatabase();
    
    console.log('🗑️  QA database has been completely reset!');
    console.log('💡 You can now run "npm run seed:qa" to create an admin user');

    await mongoose.connection.close();
    console.log('👋 Disconnected from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting QA database:', error.message);
    process.exit(1);
  }
};

resetQADB();

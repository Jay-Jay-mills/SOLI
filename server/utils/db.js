import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Choose database URI based on NODE_ENV
    const isTestEnv = process.env.NODE_ENV === 'test';
    const isQAEnv = process.env.NODE_ENV === 'qa';
    
    let mongoURI;
    let envLabel;
    
    if (isTestEnv) {
      mongoURI = process.env.MONGO_URI_TEST;
      envLabel = '🧪 TEST';
    } else if (isQAEnv) {
      mongoURI = process.env.MONGO_URI_QA;
      envLabel = '🔬 QA';
    } else {
      mongoURI = process.env.MONGO_URI;
      envLabel = '🚀 DEV';
    }
    
    if (!mongoURI) {
      const envVarName = isTestEnv ? 'MONGO_URI_TEST' : isQAEnv ? 'MONGO_URI_QA' : 'MONGO_URI';
      throw new Error(`${envVarName} is not defined in environment variables`);
    }

    const conn = await mongoose.connect(mongoURI, {
      // Connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    const dbName = conn.connection.db.databaseName;
    console.log(`✅ ${envLabel} MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${dbName}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;

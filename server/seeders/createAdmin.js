import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const createAdminUsers = async () => {
  try {
    await connectDB();

    const adminsToCreate = [
      {
        username: 'SuperAdmin',
        password: 'superadmin123',
        role: 'superadmin',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    console.log('Creating admin users...\n');

    for (const adminData of adminsToCreate) {
      // Check if admin user already exists
      const adminExists = await User.findOne({ username: adminData.username });

      if (adminExists) {
        console.log(`⚠️  ${adminData.username} already exists`);
        console.log(`   Username: ${adminExists.username}`);
        console.log(`   Role: ${adminExists.role}`);
        console.log(`   Is Active: ${adminExists.isActive}\n`);
        continue;
      }

      // Create admin user
      const admin = await User.create(adminData);

      console.log(`✅ ${adminData.username} created successfully!`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Username: ${adminData.username}`);
      console.log(`Password: ${adminData.password}`);
      console.log(`Role: ${adminData.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('⚠️  Please change the passwords after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error creating admin users: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
createAdminUsers();

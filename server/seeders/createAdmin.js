require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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
        username: 'SOLIAdmin',
        password: 'soli123',
        isAdmin: true,
        isSOLI: true,
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        username: 'GRIRAdmin',
        password: 'grir123',
        isAdmin: true,
        isSOLI: false,
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
        console.log(`   Is Admin: ${adminExists.isAdmin}`);
        console.log(`   Is SOLI: ${adminExists.isSOLI}`);
        console.log(`   Is Active: ${adminExists.isActive}\n`);
        continue;
      }

      // Create admin user
      const admin = await User.create(adminData);

      console.log(`✅ ${adminData.username} created successfully!`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Username: ${adminData.username}`);
      console.log(`Password: ${adminData.password}`);
      console.log(`Is SOLI: ${adminData.isSOLI}`);
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

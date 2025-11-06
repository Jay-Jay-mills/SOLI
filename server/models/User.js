import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username must not exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  isAdmin: {
    type: Boolean,
    required: [true, 'isAdmin is required'],
    default: false
  },
  isSOLI: {
    type: Boolean,
    required: [true, 'isSOLI is required'],
    default: false
  },
  isActive: {
    type: Boolean,
    required: [true, 'isActive is required'],
    default: true
  },
  created: {
    type: Date,
    required: [true, 'Created date is required'],
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required'],
    default: 'system'
  },
  updated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: false // We're managing created/updated manually
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Update the 'updated' timestamp on every save
  this.updated = new Date();
  
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);

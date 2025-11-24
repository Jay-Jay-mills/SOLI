import mongoose from 'mongoose';

const userGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Group name must be at least 3 characters'],
    maxlength: [100, 'Group name must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters']
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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

// Update the 'updated' timestamp before saving
userGroupSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

// Method to check if a user is an admin of this group
userGroupSchema.methods.isGroupAdmin = function(userId) {
  return this.admins.some(adminId => adminId.toString() === userId.toString());
};

// Method to check if a user is a member of this group
userGroupSchema.methods.isGroupMember = function(userId) {
  return this.users.some(memberId => memberId.toString() === userId.toString());
};

export default mongoose.model('UserGroup', userGroupSchema);

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  status: {
    type: String,
    required: [true, 'Project status is required'],
    enum: {
      values: ['active', 'inactive', 'completed'],
      message: 'Status must be either active, inactive, or completed'
    },
    default: 'active'
  },
  isSoli: {
    type: Boolean,
    required: [true, 'isSoli is required'],
    default: false
  },
  isDeleted: {
    type: Boolean,
    required: [true, 'isDeleted is required'],
    default: false
  },
  created: {
    type: Date,
    required: [true, 'Created date is required'],
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required']
  },
  updated: {
    type: Date,
    default: null
  },
  updatedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: false,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for faster queries
projectSchema.index({ isSoli: 1, isDeleted: 1, created: -1 });
projectSchema.index({ status: 1, isDeleted: 1 });
projectSchema.index({ createdBy: 1, isDeleted: 1 });

// Pre-save middleware to update timestamps
projectSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    this.updated = new Date();
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;

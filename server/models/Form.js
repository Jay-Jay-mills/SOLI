import mongoose from 'mongoose';

const formFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  label: {
    type: String,
    required: [true, 'Field label is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Field type is required'],
    enum: ['text', 'number', 'date', 'file', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio']
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String
  },
  order: {
    type: Number,
    required: [true, 'Field order is required']
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const formSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Form name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fields: {
    type: [formFieldSchema],
    required: [true, 'Form fields are required'],
    validate: {
      validator: function(fields) {
        return fields && fields.length > 0;
      },
      message: 'Form must have at least one field'
    }
  },
  createdBy: {
    type: String,
    required: [true, 'createdBy is required']
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created', updatedAt: 'updated' },
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

// Index for faster queries
formSchema.index({ projectId: 1, isActive: 1 });

// Ensure only one active form per project
formSchema.pre('save', async function(next) {
  if (this.isNew && this.isActive) {
    // Deactivate other forms for this project
    await this.constructor.updateMany(
      { projectId: this.projectId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const Form = mongoose.model('Form', formSchema);

export default Form;

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: [true, 'Form ID is required'],
    index: true
  },
  projectId: {
    type: String,
    required: [true, 'Project ID is required'],
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Submission data is required']
  },
  files: [{
    fieldId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    }
  }],
  submittedBy: {
    type: String,
    required: [true, 'submittedBy is required']
  },
  submitted: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'submitted', updatedAt: false },
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
submissionSchema.index({ formId: 1, submitted: -1 });
submissionSchema.index({ projectId: 1, submitted: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

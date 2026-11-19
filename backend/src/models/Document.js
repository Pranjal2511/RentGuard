import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['lease', 'condition_report', 'receipt', 'invoice', 'other'],
      default: 'lease',
      index: true,
    },
    fileType: {
      type: String,
      default: 'pdf',
    },
    storageKey: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    size: {
      type: String,
      default: '1.0 MB',
    },
    fileSizeBytes: {
      type: Number,
      default: 0,
    },
    checksum: {
      type: String,
      default: '',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.model('Document', documentSchema);


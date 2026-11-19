import mongoose from 'mongoose';

const photoSubSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

const evidenceSchema = new mongoose.Schema(
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
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConditionReport',
      default: null,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['move-in', 'move-out', 'MOVE_IN', 'MOVE_OUT'],
      default: 'move-in',
      index: true,
    },
    component: {
      type: String,
      default: 'general',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      default: 'good',
    },
    notes: {
      type: String,
      default: '',
    },
    photos: {
      type: [photoSubSchema],
      default: [],
    },
    confirmationStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'flagged'],
      default: 'pending',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ propertyId: 1, roomId: 1, type: 1 });

export const Evidence = mongoose.model('Evidence', evidenceSchema);


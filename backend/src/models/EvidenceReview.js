import mongoose from 'mongoose';

const evidenceReviewSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Evidence',
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decision: {
      type: String,
      enum: ['CONFIRMED', 'FLAGGED', 'confirmed', 'rejected', 'flagged'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const EvidenceReview = mongoose.model('EvidenceReview', evidenceReviewSchema);


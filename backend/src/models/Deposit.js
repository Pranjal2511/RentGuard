import mongoose from 'mongoose';

const deductionSubSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'disputed', 'agreed', 'settled', 'rejected'],
      default: 'pending',
    },
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

const depositSchema = new mongoose.Schema(
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
    totalDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    deductions: {
      type: [deductionSubSchema],
      default: [],
    },
    totalDeducted: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['held', 'disputed', 'settled', 'refunded'],
      default: 'held',
    },
  },
  {
    timestamps: true,
  }
);

depositSchema.methods.recalculate = function () {
  this.totalDeducted = this.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  this.refundAmount = Math.max(0, this.totalDeposit - this.totalDeducted);
  return this;
};

export const Deposit = mongoose.model('Deposit', depositSchema);


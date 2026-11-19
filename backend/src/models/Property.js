import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Property address is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'Bengaluru',
    },
    state: {
      type: String,
      trim: true,
      default: 'Karnataka',
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    propertyType: {
      type: String,
      default: '2BHK Apartment',
    },
    floor: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    managerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'vacant', 'maintenance', 'archived'],
      default: 'active',
      index: true,
    },
    monthlyRent: {
      type: Number,
      default: 0,
    },
    deposit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Property = mongoose.model('Property', propertySchema);


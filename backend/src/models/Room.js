import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'hallway', 'other'],
      default: 'other',
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ propertyId: 1, order: 1 });

export const Room = mongoose.model('Room', roomSchema);


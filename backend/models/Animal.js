import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['dog', 'cat', 'rabbit', 'hamster']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  lastFed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Animal = mongoose.model('Animal', animalSchema);

export default Animal; 
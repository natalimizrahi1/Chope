import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., cat, dog, dragon
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastFed: { type: Date, default: Date.now },
});

export default mongoose.model('Animal', animalSchema); 
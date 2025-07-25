import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  reward: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: String,
    default: "custom",
    enum: ["household", "education", "kitchen", "health", "fitness", "creative", "music", "nature", "custom"],
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;

import mongoose from "mongoose";

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["dog", "cat", "rabbit", "hamster"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
    required: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  experience: {
    type: Number,
    default: 0,
  },
  stats: {
    hunger: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    happiness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    energy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  accessories: [
    {
      type: {
        type: String,
        required: true,
        enum: ["hat", "collar", "toy", "bed", "food"],
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      equipped: {
        type: Boolean,
        default: false,
      },
    },
  ],
  lastFed: {
    type: Date,
    default: Date.now,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
  lastSlept: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add method to calculate experience needed for next level
animalSchema.methods.getNextLevelExp = function () {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

// Add method to check if animal can level up
animalSchema.methods.canLevelUp = function () {
  return this.experience >= this.getNextLevelExp();
};

// Add method to level up
animalSchema.methods.levelUp = function () {
  if (this.canLevelUp()) {
    this.level += 1;
    this.experience = 0;
    // Reset stats to 0 for new level
    this.stats.hunger = 0;
    this.stats.happiness = 0;
    this.stats.energy = 0;
    return true;
  }
  return false;
};

// Add method to update stats over time
animalSchema.methods.updateStats = function () {
  const now = new Date();
  const hoursSinceLastFed = (now - this.lastFed) / (1000 * 60 * 60);
  const hoursSinceLastPlayed = (now - this.lastPlayed) / (1000 * 60 * 60);
  const hoursSinceLastSlept = (now - this.lastSlept) / (1000 * 60 * 60);

  // Decrease stats based on time passed
  this.stats.hunger = Math.max(0, this.stats.hunger - hoursSinceLastFed * 5);
  this.stats.happiness = Math.max(0, this.stats.happiness - hoursSinceLastPlayed * 3);
  this.stats.energy = Math.max(0, this.stats.energy - hoursSinceLastSlept * 4);

  return this;
};

const Animal = mongoose.model("Animal", animalSchema);

export default Animal;

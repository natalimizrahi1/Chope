import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true,
  },
  coins: {
    type: Number,
    default: 0,
  },
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
  },
  petState: {
    name: {
      type: String,
      default: "Benny",
    },
    type: {
      type: String,
      default: "Cute Pet",
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 0,
    },
    stats: {
      hunger: {
        type: Number,
        default: 0,
      },
      happiness: {
        type: Number,
        default: 0,
      },
      energy: {
        type: Number,
        default: 0,
      },
    },
    accessories: [
      {
        id: String,
        name: String,
        image: String,
        type: String,
        price: Number,
        quantity: Number,
        slot: String,
      },
    ],
    scale: {
      type: Number,
      default: 0.7,
    },
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  purchasedItems: [
    {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: ["food", "toy", "energy", "accessory"],
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      purchasedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
childSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to add items to inventory
childSchema.methods.addItems = function (items) {
  items.forEach(item => {
    const existingItem = this.purchasedItems.find(purchased => purchased.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.purchasedItems.push({
        id: item.id,
        name: item.name,
        image: item.image,
        type: item.type,
        price: item.price,
        quantity: 1,
      });
    }
  });
};

// Method to use an item
childSchema.methods.useItem = function (itemId) {
  const item = this.purchasedItems.find(purchased => purchased.id === itemId);
  if (!item) {
    return { success: false, message: "Item not found in inventory" };
  }
  if (item.quantity <= 0) {
    return { success: false, message: "No more of this item available" };
  }

  item.quantity -= 1;

  if (item.quantity === 0 && item.type !== "accessory") {
    this.purchasedItems = this.purchasedItems.filter(purchased => purchased.id !== itemId);
  }

  return {
    success: true,
    message: `${item.name} used successfully`,
    itemType: item.type,
    itemName: item.name,
    itemImage: item.image,
    itemPrice: item.price,
  };
};

// Method to remove an item
childSchema.methods.removeItem = function (itemId) {
  const itemIndex = this.purchasedItems.findIndex(purchased => purchased.id === itemId);
  if (itemIndex === -1) {
    return { success: false, message: "Item not found in inventory" };
  }

  const item = this.purchasedItems[itemIndex];
  this.purchasedItems.splice(itemIndex, 1);

  return { success: true, message: `${item.name} removed from inventory` };
};

// Method to compare password
childSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update pet state
childSchema.methods.updatePetState = function (newPetState) {
  this.petState = {
    ...this.petState,
    ...newPetState,
  };
  return this.save();
};

// Method to get pet state
childSchema.methods.getPetState = function () {
  return this.petState;
};

const Child = mongoose.model("Child", childSchema);

export default Child;

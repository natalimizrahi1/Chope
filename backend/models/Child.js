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
    accessories: {
      type: [
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
          },
          price: {
            type: Number,
            default: 0,
          },
          quantity: {
            type: Number,
            default: 1,
          },
          slot: {
            type: String,
            default: "body",
          },
          purchasedAt: {
            type: mongoose.Schema.Types.Mixed, // Allow both Date and String
            default: Date.now,
          },
        },
      ],
      default: [],
    },
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

  // Keep accessories with quantity 0 in inventory for later return
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
childSchema.methods.updatePetState = async function (newPetState) {
  try {
    const processedAccessories = Array.isArray(newPetState.accessories)
      ? newPetState.accessories.map(accessory => {
          // Safely handle purchasedAt field
          let purchasedAtDate;
          try {
            if (accessory.purchasedAt) {
              if (typeof accessory.purchasedAt === "string") {
                purchasedAtDate = new Date(accessory.purchasedAt);
              } else if (accessory.purchasedAt instanceof Date) {
                purchasedAtDate = accessory.purchasedAt;
              } else {
                // Fallback to current date
                purchasedAtDate = new Date();
              }
            } else {
              purchasedAtDate = new Date();
            }
          } catch (error) {
            console.error("Error processing purchasedAt in updatePetState:", error);
            purchasedAtDate = new Date();
          }

          return {
            id: accessory.id || "",
            name: accessory.name || "",
            image: accessory.imageUrl || accessory.image || "",
            type: accessory.type || "accessory",
            price: accessory.price || 0,
            quantity: accessory.quantity || 1,
            slot: accessory.slot || "body",
            purchasedAt: purchasedAtDate,
          };
        })
      : [];

    this.petState = {
      name: newPetState.name || this.petState.name,
      type: newPetState.type || this.petState.type,
      level: newPetState.level || this.petState.level,
      xp: newPetState.xp || this.petState.xp,
      stats: newPetState.stats || this.petState.stats,
      accessories: processedAccessories,
      scale: newPetState.scale || this.petState.scale,
    };

    return await this.save();
  } catch (err) {
    console.error("❌ Error in updatePetState:", err);
    throw err; // מועבר לרספונס מהראוטר
  }
};

// Method to get pet state
childSchema.methods.getPetState = function () {
  // Ensure accessories is always an array of objects
  const processedAccessories = Array.isArray(this.petState.accessories)
    ? this.petState.accessories.map(accessory => {
        // Safely handle purchasedAt field
        let purchasedAtString;
        try {
          if (accessory.purchasedAt) {
            if (typeof accessory.purchasedAt === "string") {
              purchasedAtString = accessory.purchasedAt;
            } else if (accessory.purchasedAt instanceof Date) {
              purchasedAtString = accessory.purchasedAt.toISOString();
            } else if (accessory.purchasedAt.toISOString) {
              // Handle case where it might be a Date-like object
              purchasedAtString = accessory.purchasedAt.toISOString();
            } else {
              // Fallback to current date
              purchasedAtString = new Date().toISOString();
            }
          } else {
            purchasedAtString = new Date().toISOString();
          }
        } catch (error) {
          console.error("Error processing purchasedAt:", error);
          purchasedAtString = new Date().toISOString();
        }

        return {
          id: accessory.id || "",
          name: accessory.name || "",
          image: accessory.image || "",
          type: accessory.type || "accessory",
          price: accessory.price || 0,
          quantity: accessory.quantity || 1,
          slot: accessory.slot || "body",
          purchasedAt: purchasedAtString,
        };
      })
    : [];

  return {
    name: this.petState.name || "Benny",
    type: this.petState.type || "Cute Pet",
    level: this.petState.level || 1,
    xp: this.petState.xp || 0,
    stats: this.petState.stats || { hunger: 0, happiness: 0, energy: 0 },
    accessories: processedAccessories,
    scale: this.petState.scale || 0.7,
  };
};

const Child = mongoose.model("Child", childSchema);

export default Child;

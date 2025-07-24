const mongoose = require("mongoose");

const kitchenOrderSchema = new mongoose.Schema(
  {
    kotNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    spaceName: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        note: {
          type: String, // optional kitchen note
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "preparing", "ready"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("KitchenOrder", kitchenOrderSchema);

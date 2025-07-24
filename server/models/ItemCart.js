const mongoose = require("mongoose");

const itemCartSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        quantity: Number,
        sentToKitchen: {
          type: Boolean,
          default: false,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        sentQuantity: {
          type: Number,
          default: 0, // ✅ New field
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("ItemCart", itemCartSchema);

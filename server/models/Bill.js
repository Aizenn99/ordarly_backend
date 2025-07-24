const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNumber: {
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
    items: [
      {
        itemName: { type: String, required: true },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },

    // 🆕 Added this
    taxBreakdown: [
      {
        name: { type: String, required: true },
        value: { type: Number, required: true },
        unit: { type: String, enum: ["PERCENTAGE", "AMOUNT"], required: true },
        amount: { type: Number, required: true },
      },
    ],

    discount: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    packagingFee: { type: Number, default: 0 },
    roundOff: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "CREDIT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },
    createdBy: { type: String },
    settings: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        value: { type: Number, required: true },
        unit: {
          type: String,
          enum: ["PERCENTAGE", "AMOUNT"],
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

module.exports = mongoose.model("Bill", billSchema);

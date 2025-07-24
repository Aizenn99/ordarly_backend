const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "TAX",
      "DELIVERY",
      "DISCOUNT",
      "ROUNDOFF",
      "SERVICE_CHARGE",
      "PACKAGE",
      "PAYMENT",
      "RECEIPT"
    ],
  },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, enum: ["PERCENTAGE", "AMOUNT"], default: "PERCENTAGE" },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Setting", settingSchema);

const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    imageURL: {
      type: String,
      default: null,
    },
    title: String,
    description: String,
    category: String,
    subcategory: String,
    price: Number,
  },
  {
    timestamps: true,
  }
);




//create different models for each schema


module.exports = mongoose.model("MenuItem", MenuItemSchema);

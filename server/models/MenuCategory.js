const mongoose = require("mongoose");

const MenuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("MenuCategory", MenuCategorySchema);

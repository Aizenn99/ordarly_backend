const mongoose = require("mongoose");
const SubCatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubCat", SubCatSchema);
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    
  },
  spaces: {
    type: String,
    required: true,
  },
});

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;

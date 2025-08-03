const tableModel = require("../../models/tables");
const spacesModel = require("../../models/spaces");
const mongoose = require("mongoose");

const addtable = async (req, res) => {
  try {
    const { tableName, capacity, status, spaces } = req.body;
    const newTable = new tableModel({
      tableName,
      capacity,
      status,
      spaces,
    });
    await newTable.save();
    res.status(200).json({
      success: true,
      message: "Table added successfully!",
      data: newTable,
    });
  } catch (error) {
    console.error("Error adding table:", error);
    res.status(500).json({ success: false, message: "Error adding table" });
  }
};

const fetchAllTables = async (req, res) => {
  try {
    const data = await tableModel.find();
    res.status(200).json({
      success: true,
      message: "Tables fetched successfully!",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
    });
  }
};
const changeTableStatus = async (req, res) => {
  try {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid table ID" });
    }

    const { status } = req.body;

    const updatedTable = await tableModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    // 🔥 Emit socket event
    const io = req.app.get("io");
    io.emit("table-status-changed", updatedTable);

    res.status(200).json({ success: true, data: updatedTable });
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ success: false, message: "Error updating table" });
  }
};
const editTable = async (req, res) => {
  try {
    const id = req.params.id.trim();
    console.log("🛠 Updating Table:", id, "with data:", req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid table ID" });
    }

    const updatedTable = await tableModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    res.status(200).json({
      success: true,
      message: "Table updated successfully!",
      data: updatedTable,
    });
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ success: false, message: "Error updating table" });
  }
};


const deleteTable = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedTable = await tableModel.findByIdAndDelete(id);
    if (!deletedTable) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }
    res.status(200).json({
      success: true,
      message: "Table deleted successfully!",
      data: deletedTable,
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({ success: false, message: "Error deleting table" });
  }
};

const addSpaces = async (req, res) => {
  try {
    const { SpaceName } = req.body;
    const newSpace = new spacesModel({
      SpaceName,
    });
    await newSpace.save();
    res.status(200).json({
      success: true,
      message: "Space added successfully!",
      data: newSpace,
    });
  } catch (error) {
    console.error("Error adding space:", error);
    res.status(500).json({ success: false, message: "Error adding space" });
  }
};

const fetchSpaces = async (req, res) => {
  try {
    const data = await spacesModel.find();
    res.status(200).json({
      success: true,
      message: "Spaces fetched successfully!",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching spaces",
    });
  }
};

module.exports = {
  addtable,
  addSpaces,
  fetchSpaces,
  fetchAllTables,
  editTable,
  deleteTable,
  changeTableStatus,
};

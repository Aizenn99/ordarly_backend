const Setting = require("../../models/taxsettings");

// ➕ Add a new setting
exports.addSetting = async (req, res) => {
  try {
    const { type, name, value, unit } = req.body;

    if (!type || !name || value === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const setting = new Setting({ type, name, value, unit });
    await setting.save();

    res.status(201).json({ message: "Setting added", data: setting }); // ✅ FIXED
  } catch (error) {
    console.error("❌ Error adding setting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔍 Get all settings by type
exports.getSettingsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const settings = await Setting.find({ type });

    res.status(200).json({ data: settings }); // ✅ FIXED
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✏️ Update a setting
exports.updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, unit, isActive } = req.body;

    const updated = await Setting.findByIdAndUpdate(
      id,
      { name, value, unit, isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json({ message: "Setting updated", data: updated }); // ✅ FIXED
  } catch (error) {
    console.error("❌ Error updating setting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ❌ Delete a setting
exports.deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Setting.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.status(200).json({ message: "Setting deleted", data: deleted }); // ✅ FIXED
  } catch (error) {
    console.error("❌ Error deleting setting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const express = require("express");
const router = express.Router();
const {
  getSettingsByType,
  addSetting,
  updateSetting,
  deleteSetting,
} = require("../../controllers/admin/settings");

// ✅ Get settings by type (e.g., /api/settings/tax)
router.get("/fetch-settings/:type", getSettingsByType);

// ✅ Add new setting
router.post("/add-setting", addSetting);

// ✅ Update a setting by ID
router.put("/update-setting/:id", updateSetting);

// ✅ Delete a setting by ID
router.delete("/delete-setting/:id", deleteSetting);

module.exports = router;

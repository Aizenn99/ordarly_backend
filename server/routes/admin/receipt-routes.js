// routes/admin/settings.js
const express = require("express");
const router = express.Router();
const receipt = require("../../controllers/admin/receiptSetting-con");

router.get("/", receipt.getReceiptSetting);

router.post("/", receipt.createReceiptSetting);

router.put("/", receipt.updateReceiptSetting);

router.delete("/:field", receipt.deleteReceiptField);

module.exports = router;

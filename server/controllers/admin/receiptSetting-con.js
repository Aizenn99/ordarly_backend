// controllers/admin/receiptSettings.js
const ReceiptSetting = require('../../models/recepitSettings');

// 🔍 Fetch (or create) the one-and-only receipt settings doc
exports.getReceiptSetting = async (req, res) => {
  try {
    let settings = await ReceiptSetting.findOne();
    if (!settings) {
      settings = await ReceiptSetting.create({
        header: '',
        businessNumber: '',
        address: '',
        footer: ''
      });
    }
    res.status(200).json({ data: settings });
  } catch (error) {
    console.error('❌ Error fetching receipt settings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ✏️ Create only if none exists (otherwise ask client to use PUT)
exports.createReceiptSetting = async (req, res) => {
  try {
    if (await ReceiptSetting.findOne()) {
      return res
        .status(400)
        .json({ message: 'Already exists—use PUT to update instead.' });
    }
    const { header, businessNumber, address, footer } = req.body;
    const created = await ReceiptSetting.create({
      header, businessNumber, address, footer
    });
    res.status(201).json({ message: 'Receipt settings created', data: created });
  } catch (err) {
    console.error('❌ Error creating receipt settings:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ✏️ Update all fields of the receipt settings (upsert)
exports.updateReceiptSetting = async (req, res) => {
  try {
    const { header, businessNumber, address, footer, isActive } = req.body;
    if (
      header === undefined ||
      businessNumber === undefined ||
      address === undefined ||
      footer === undefined
    ) {
      return res.status(400).json({ message: 'Missing one of required fields' });
    }

    const updated = await ReceiptSetting.findOneAndUpdate(
      {}, // singleton filter
      { header, businessNumber, address, footer, isActive },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Receipt settings saved', data: updated });
  } catch (error) {
    console.error('❌ Error updating receipt settings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🗑️ Clear a single field on the one‐and‐only receipt doc
exports.deleteReceiptField = async (req, res) => {
  try {
    const { field } = req.params;
    const allowed = ['header','businessNumber','address','footer'];
    if (!allowed.includes(field)) {
      return res.status(400).json({ message: 'Invalid field name' });
    }

    const updated = await ReceiptSetting.findOneAndUpdate(
      {},
      { [field]: '' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Receipt settings not found' });
    }

    res.status(200).json({ message: `${field} cleared`, data: updated });
  } catch (err) {
    console.error('❌ Error clearing receipt field:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const Counter = require("../models/counter");
const KitchenOrder = require("../models/KitchenOrder");

// Bill Number Generator
const getNextBillNumber = async () => {

  const counter = await Counter.findOneAndUpdate(
    { name: "billNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return counter.value;
};

// KOT Number Generator
const getNextKOTNumber = async () => {
  const lastOrder = await KitchenOrder.findOne().sort({ kotNumber: -1 });
  return lastOrder ? lastOrder.kotNumber + 1 : 1000;
};

// ✅ Export both
module.exports = {
  getNextBillNumber,
  getNextKOTNumber,
};

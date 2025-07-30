const express = require("express");
const escpos = require("escpos");

// Import USB adapter explicitly
escpos.USB = require("escpos-usb");  

const router = express.Router();

let device;
let printer;

// Try initializing USB printer
try {
  device = new escpos.USB();
  printer = new escpos.Printer(device);
} catch (err) {
  console.error("❌ No USB printer found:", err.message);
}

router.post("/print", (req, res) => {
  const { bill } = req.body;

  if (!printer) {
    return res.status(500).json({ success: false, message: "No printer connected" });
  }

  device.open(() => {
    printer
      .align("ct")
      .text("ORDARLY")
      .text(`Bill #${bill.billNumber}`)
      .text("----------------------------");

    bill.items.forEach(item => {
      printer.text(`${item.itemName} x${item.quantity} - ₹${item.totalPrice}`);
    });

    printer
      .text("----------------------------")
      .text(`TOTAL: ₹${bill.totalAmount}`)
      .text("Thank you! Visit Again!")
      .cut()
      .close();
  });

  res.json({ success: true });
});

module.exports = router;

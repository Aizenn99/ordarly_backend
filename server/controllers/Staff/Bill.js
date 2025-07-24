const Bill = require("../../models/Bill");
const ItemCart = require("../../models/ItemCart");
const MenuItem = require("../../models/menuitem");
const { getNextBillNumber } = require("../../helper/utils");
// 1. Generate Bill
const Setting = require("../../models/taxsettings"); // ✅ fixed import name


// ✅ Generate Bill with itemId for future restore
exports.generateBill = async (req, res) => {
  try {
    const { tableName, spaceName, paymentMethod } = req.body;

    if (!tableName || !spaceName || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const settings = await Setting.find({ isActive: true });

    const getValue = (type) => {
      const setting = settings.find((s) => s.type === type);
      return {
        value: Math.abs(setting?.value || 0),
        unit: setting?.unit || "PERCENTAGE",
      };
    };

    const { value: discountValue, unit: discountUnit } = getValue("DISCOUNT");
    const { value: serviceValue, unit: serviceUnit } = getValue("SERVICE_CHARGE");
    const { value: deliveryFee } = getValue("DELIVERY");
    const { value: packagingFee } = getValue("PACKAGE");

    const cart = await ItemCart.findOne({ tableName }).populate("items.itemId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "No items found for this table" });
    }

    const itemDetails = cart.items.map((item) => ({
      itemId: item.itemId._id,
      itemName: item.itemId.title,
      quantity: item.quantity,
      unitPrice: item.itemId.price,
      totalPrice: item.quantity * item.itemId.price,
      note: item.note || "",
    }));

    const subtotal = itemDetails.reduce((sum, item) => sum + item.totalPrice, 0);

    // 1️⃣ Apply Discount First
    const discount = discountUnit === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : discountValue;

    const discountedSubtotal = subtotal - discount;

    // 2️⃣ Apply Taxes from Settings (Multiple)
    const taxSettings = settings.filter((s) => s.type === "TAX");
    let totalTax = 0;
    const appliedTaxes = [];

    for (const tax of taxSettings) {
      const taxAmount = tax.unit === "PERCENTAGE"
        ? (discountedSubtotal * tax.value) / 100
        : tax.value;

      totalTax += taxAmount;

      appliedTaxes.push({
        name: tax.name,
        value: tax.value,
        unit: tax.unit,
        amount: +taxAmount.toFixed(2),
      });
    }

    // 3️⃣ Service Charge on discounted subtotal
    const serviceCharge = serviceUnit === "PERCENTAGE"
      ? (discountedSubtotal * serviceValue) / 100
      : serviceValue;

    // 4️⃣ Total Calculation
    const amountBeforeRound =
      discountedSubtotal + totalTax + serviceCharge + deliveryFee + packagingFee;

    const roundedTotal = Math.round(amountBeforeRound);
    const roundOff = +(roundedTotal - amountBeforeRound).toFixed(2);
    const totalAmount = roundedTotal;

    // 5️⃣ Save settings snapshot
    const settingsSnapshot = settings.map((s) => ({
      type: s.type,
      name: s.name,
      value: s.value,
      unit: s.unit,
    }));

    // 6️⃣ Create Bill with Retry
    let bill;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      const billNumber = await getNextBillNumber();

      bill = new Bill({
        billNumber,
        tableName,
        spaceName,
        guestCount: cart.guestCount,
        items: itemDetails,
        subtotal,
        discount,
        tax: totalTax,
        taxBreakdown: appliedTaxes,
        serviceCharge,
        deliveryFee,
        packagingFee,
        roundOff,
        totalAmount,
        status: "UNPAID",
        paymentMethod,
        createdBy: req.user?.userName,
        settings: settingsSnapshot,
      });

      try {
        await bill.save();
        break;
      } catch (err) {
        if (err.code === 11000) {
          console.warn(`Duplicate billNumber: ${billNumber}, retrying...`);
        } else {
          throw err;
        }
      }
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({ message: "Could not generate unique bill number" });
    }

    await ItemCart.deleteOne({ tableName });

    const io = req.app.get("io");
    io.emit("new-bill", bill);

    res.status(201).json({
      message: "Bill generated successfully",
      bill,
    });
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// 2. Get Bills Only Created By Logged-In Staff
exports.getAllBills = async (req, res) => {
  try {
    console.log("🔐 Authenticated user in getAllBills:", req.user);

    const userName = req.user?.userName;
    if (!userName) {
      console.warn("❌ No userName found in req.user");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    const bills = await Bill.find({ createdBy: userName }).sort({
      createdAt: -1,
    });

    console.log(`🎯 Found ${bills.length} bills for user: ${userName}`);

    res.status(200).json(bills);
  } catch (error) {
    console.error("❌ Error fetching staff bills:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. Get all bills
exports.getAllBillsAdmin = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching staff bills:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. Get bill by billNumber
exports.getBillByNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await Bill.findOne({ billNumber: parseInt(billNumber) });

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json(bill);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. Mark bill as PAID
exports.markBillAsPaid = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const { paymentMethod } = req.body;

    if (!["CASH", "UPI", "CARD", "CREDIT"].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing payment method" });
    }

    const bill = await Bill.findOneAndUpdate(
      { billNumber: parseInt(billNumber) },
      { status: "PAID", paymentMethod },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const io = req.app.get("io");
    io.emit("bill-paid", bill);
    io.emit("dashboard:update");

    res.status(200).json({ message: "Bill marked as PAID", bill });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 5. Delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const result = await Bill.findOneAndDelete({
      billNumber: parseInt(billNumber),
    });

    if (!result) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({ message: "Bill deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 6. Edit a bill
exports.editBill = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const {
      items, // Array of { itemName, quantity, unitPrice }
      tax = 0,
      discount = 0,
      roundOff = 0,
      deliveryFee = 0,
      packagingFee = 0,
      serviceCharge = 0,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items array is required" });
    }

    const updatedItems = items.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = updatedItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0
    );

    const totalAmount =
      subtotal +
      tax +
      deliveryFee +
      packagingFee +
      serviceCharge -
      discount +
      roundOff;

    const updatedBill = await Bill.findOneAndUpdate(
      { billNumber: parseInt(billNumber) },
      {
        items: updatedItems,
        subtotal,
        tax,
        discount,
        roundOff,
        deliveryFee,
        packagingFee,
        serviceCharge,
        totalAmount,
      },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const io = req.app.get("io");
    io.emit("bill-updated", updatedBill);

    res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    console.error("Error editing bill:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const express = require("express");
const router = express.Router();

const {
  addOrUpdateItemToCart,
  getCartByTable,
  removeItemFromCart,
} = require("../../controllers/Staff/Cart");

const {
  generateBill,
  getAllBills,
  markBillAsPaid,
  getBillByNumber,
  getAllBillsAdmin,
  deleteBill,
  editBill
} = require("../../controllers/Staff/Bill");

const { authMiddleWare } = require("../../controllers/auth/auth-controller");

// ✅ Cart Routes (optional to secure)
router.post("/cart/add-up", addOrUpdateItemToCart);
router.get("/cart/:tableName", getCartByTable);
router.post("/cart/remove-item", removeItemFromCart);

// ✅ Bill Routes (ALL protected)
router.post("/bill/generate", authMiddleWare, generateBill);
router.get("/bills", authMiddleWare, getAllBills); // ✅ Only fetch bills of logged-in staff
router.get("/bills/admin", authMiddleWare, getAllBillsAdmin); // ✅ Admins only
router.patch("/bill/mark-paid/:billNumber", authMiddleWare, markBillAsPaid);
router.get("/bill/:billNumber", authMiddleWare, getBillByNumber);
router.delete("/bill/:billNumber", authMiddleWare, deleteBill);
router.put("bill/edit/:billNumber", authMiddleWare, editBill);


module.exports = router;

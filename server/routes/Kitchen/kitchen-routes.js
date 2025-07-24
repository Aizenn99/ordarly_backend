const express = require("express");
const {
  sendToKitchen,
  getKitchenOrders,
  updateKOTStatus,
  markKOTItemsSent,
} = require("../../controllers/Kitchen/Order");

// 👇 Export a function that takes `io`
module.exports = (io) => {
  const router = express.Router();

  // Attach `req.io = io` before calling controllers that emit events
  router.post("/send", (req, res, next) => {
    req.io = io;
    next();
  }, sendToKitchen);

  router.patch("/:kotNumber/status", (req, res, next) => {
    req.io = io;
    next();
  }, updateKOTStatus);

  // No need to inject io here since they don’t emit events
  router.get("/orders", getKitchenOrders);
  router.patch("/cart/:tableName/kot-sent", markKOTItemsSent);

  return router;
};

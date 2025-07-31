const Bill = require("../../models/Bill");

const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const io = req.app.get("io");

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // ✅ Include the full end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("❌ Invalid date format:", startDate, endDate);
      return res.status(400).json({ error: "Invalid date format" });
    }

    const paidBills = await Bill.find({
      status: "PAID",
      createdAt: { $gte: start, $lte: end },
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let cash = 0;
    let upiCard = 0;

    const dailyRevenueMap = {};
    const itemSalesMap = {};

    paidBills.forEach((bill) => {
      totalRevenue += bill.totalAmount || 0;
      totalOrders += 1;

      const dateKey = bill.createdAt.toISOString().split("T")[0];
      dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + (bill.totalAmount || 0);

      if (bill.paymentMethod === "CASH") {
        cash += bill.totalAmount || 0;
      } else if (["CARD", "UPI"].includes(bill.paymentMethod)) {
        upiCard += bill.totalAmount || 0;
      }

      // ✅ Count item quantities correctly
      if (Array.isArray(bill.items)) {
        bill.items.forEach((item) => {
          if (item?.itemName && item?.quantity) {
            itemSalesMap[item.itemName] = (itemSalesMap[item.itemName] || 0) + item.quantity;
          }
        });
      }
    });

    const revenueTrend = Object.entries(dailyRevenueMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const mostSellingItems = Object.entries(itemSalesMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const metrics = {
      totalRevenue,
      totalOrders,
      paymentBreakdown: { cash, upiCard },
      revenueTrend,
      mostSellingItems,
    };

    return res.status(200).json(metrics);
  } catch (err) {
    console.error("❗ Dashboard stats error:", err);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

module.exports = {
  getDashboardStats,
};

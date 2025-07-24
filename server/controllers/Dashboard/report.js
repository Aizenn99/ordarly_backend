const Bill = require("../../models/Bill");

exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const io = req.app.get("io");

    const start = new Date(startDate);
    const end = new Date(endDate);

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
    let totalSales = 0;
    let totalProfit = 0;

    let cash = 0;
    let upiCard = 0;
    let credit = 0;

    // 📊 Daily revenue map (date => total)
    const dailyRevenueMap = {};

    paidBills.forEach((bill) => {
      totalRevenue += bill.totalAmount || 0;
      totalSales += bill.subtotal || 0;
      totalProfit += bill.charges || 0;
      totalOrders += 1;

      const dateKey = bill.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dailyRevenueMap[dateKey]) {
        dailyRevenueMap[dateKey] = 0;
      }
      dailyRevenueMap[dateKey] += bill.totalAmount || 0;

      if (bill.paymentMethod === "CASH") {
        cash += bill.totalAmount || 0;
      } else if (["CARD", "UPI"].includes(bill.paymentMethod)) {
        upiCard += bill.totalAmount || 0;
      } else if (bill.paymentMethod === "CREDIT") {
        credit += bill.totalAmount || 0;
      }
    });

    // 🟪 Convert to array sorted by date
    const revenueTrend = Object.entries(dailyRevenueMap)
      .map(([date, revenue]) => ({
        date, // format: 'YYYY-MM-DD'
        revenue,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const metrics = {
      totalRevenue,
      totalOrders,
      totalSales,
      totalProfit,
      paymentBreakdown: { cash, upiCard, credit },
      revenueTrend, // ✅ now added
    };

    // Optional: emit update if needed
    // io.emit("dashboard:update", metrics);

    return res.status(200).json(metrics);
  } catch (err) {
    console.error("❗ Dashboard stats error:", err);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const http = require("http");
const socketIO = require("socket.io");

dotenv.config();
const PORT = process.env.PORT || 8000;

// ✅ Create HTTP server and socket.io instance
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["https://ordarlyfrontend-production.up.railway.app","http://localhost:5173", "http://192.168.0.4:5173","http://192.168.137.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

// ✅ Attach io to app so it can be accessed in routes
app.set("io", io);

// ✅ Single socket.io connection handler
io.on("connection", (socket) => {
  const { username } = socket.handshake.query;

  if (username) {
    socket.join(username); // ✅ join the user's private room
    console.log(`✅ ${username} joined their private room`);
  } else {
    console.log(`⚠️ Socket connected without username: ${socket.id}`);
  }

  // ✅ When a client emits kot-ready, send only to the right user
  socket.on("kot-ready", (data) => {
    const targetUser = data?.username;

    if (targetUser) {
      io.to(targetUser).emit("kot-ready", data); // ✅ only to the staff who placed order
      console.log(`📤 kot-ready sent to ${targetUser}`);
    } else {
      console.warn("❌ kot-ready received without username", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});


// ✅ MongoDB Connection
mongoose
  .connect(
    process.env.MONGO_URL ||
      "mongodb+srv://kalriyahet:WQY0wzYGrs8za9al@cluster0.kf7rqts.mongodb.net/"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection failed", err));

// ✅ Middleware setup
app.use(cookieParser());

app.use(
  cors({
    origin: ["https://ordarlyfrontend-production.up.railway.app","http://localhost:5173", "http://192.168.0.4:5173","http://192.168.137.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
const authRoutes = require("./routes/auth/auth-routes");
const adminRoutes = require("./routes/admin/admin-routes");
const staffRoutes = require("./routes/Staff/Staff-routes");
const kitchenRoutes = require("./routes/Kitchen/kitchen-routes")(io); 
const dashboardRoutes = require("./routes/dashboard/reports-routes");
const settingsRoutes = require("./routes/admin/settings-routes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is working and reachable from phone!");
});

// ✅ Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 Server is running on http://192.168.0.4:${PORT}`);
});

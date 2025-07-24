const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");


const registerUser = async (req, res) => {
  const { username, email, password,role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const checkUser = await User.findOne({ email: email.toLowerCase() });

    if (checkUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username ,
      email: email.toLowerCase(),
      password: hashPassword,
      role : role || "staff",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.error("Error in registration:", e);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later",
    });
  }
};

const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role is required in params",
    });
  }

  try {
    const users = await User.find({ role });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ===============================
// ✅ Login User Controller
// ===============================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, checkUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: checkUser._id,
        role: checkUser.role,
        email: checkUser.email.toLowerCase(),
        userName: checkUser.username,
      },
      process.env.JWT_SECRET ||
        "3ace777bd66b16bd9a36ab667e3b7b12d70f6b146ff375c67e210f820e373f3d",
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // ✅ for localhost only
        sameSite: "Lax", // ✅ for localhost
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        success: true,
        message: "Login successful",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          userName: checkUser.username,
          token: token,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// ✅ Logout Controller
// ===============================
const LogoutUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false, // ✅ match how it was set
      sameSite: "Lax", // ✅ match how it was set
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully!",
    });
};


// controllers/authController.js
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user, // Important for Redux `.filter()`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;

  try {
    const updatedData = {};

    if (username) updatedData.username = username;
    if (email) updatedData.email = email.toLowerCase();
    if (role) updatedData.role = role;

    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true, // ✅ ensures schema validation is applied
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};




const authMiddleWare = async (req, res, next) => {
  const token = req.cookies.token;

  console.log("Auth Middleware Cookies:", req.cookies); // 🧪 Debug

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_default_fallback_secret"
    );

    req.user = decoded; // ✅ Properly set user from token payload
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    return res.status(403).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  LogoutUser,
  authMiddleWare,
  getUsersByRole,
  deleteUser ,
  editUser
};

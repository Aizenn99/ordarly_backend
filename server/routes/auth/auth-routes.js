const express = require("express");
const router = express.Router();
const {
  loginUser,
  authMiddleWare,registerUser,LogoutUser,getUsersByRole,deleteUser,editUser
} = require("../../controllers/auth/auth-controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", LogoutUser);
router.put("/edit/:id", editUser); // ✅ Ensure auth middleware is applied
router.delete("/delete/:id", deleteUser);
router.get("/users/role/:role", authMiddleWare, getUsersByRole);
router.get("/check-auth", authMiddleWare, (req, res) => {
  const user = req.user;
  res.status(200).json({ success: true, message: "user found", user });
});

module.exports = router;

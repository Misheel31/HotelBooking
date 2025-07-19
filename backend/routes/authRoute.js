const express = require("express");
const router = express.Router();
const {
  test,
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutUser,
  verifyLoginOTP,
} = require("../controller/authController");
const loginLimiter = require("../middleware/rateLimiter");
const authenticateUser = require("../middleware/userAuthenticate");
const authorizeRoles = require("../middleware/authorizeRole");

// Test route
router.get("/", test);

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);
router.post("/change-password", authenticateUser, changePassword);
router.post("/logout", authenticateUser, logoutUser);
router.post("/verify-login-otp", verifyLoginOTP);

router.get(
  "/admin-only-route",
  authenticateUser,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome admin" });
  }
);

module.exports = router;

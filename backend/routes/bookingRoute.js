const express = require("express");
const {
  createBooking,
  getBookingsByUserId,
  deleteBookingById,
  createCheckoutSession,
  stripeWebhook,
  getAllBookings,
} = require("../controller/bookingController");
const authenticateUser = require("../middleware/userAuthenticate");
const authorizeRoles = require("../middleware/authorizeRole");
const router = express.Router();

router.post("/create", authenticateUser, createBooking);
router.post("/create-checkout-session", createCheckoutSession);
router.post("/webhook", stripeWebhook);
router.get("/", authenticateUser, authorizeRoles("admin"), getAllBookings);
// app.post("/api/booking/webhook", express.raw({ type: "application/json" }), stripeWebhook);
router.get("/:id", getBookingsByUserId);
router.delete("/:id", deleteBookingById);
module.exports = router;

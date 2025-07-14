require("dotenv").config();
const Booking = require("../model/bookingModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const logActivity = require("../utils/activityLogger");

const createBooking = async (req, res) => {
  try {
    const {
      userId,
      hotelRoomId,
      checkInDate,
      checkOutDate,
      guests,
      rooms,
      totalPrice,
    } = req.body;

    if (
      !userId ||
      !hotelRoomId ||
      !checkInDate ||
      !checkOutDate ||
      !guests ||
      !rooms ||
      !totalPrice
    ) {
      return res
        .status(400)
        .json({ message: "All booking fields are required." });
    }

    const booking = new Booking({
      userId,
      hotelRoomId,
      checkInDate,
      checkOutDate,
      guests,
      rooms,
      totalPrice,
    });

    await booking.save();

    //activity log
    await logActivity({
      req,
      userId,
      action: "CREATE_BOOKING",
      details: {
        bookingId: booking._id,
        hotelRoomId,
        checkInDate,
        checkOutDate,
        guests,
        rooms,
        totalPrice,
      },
    });

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBookingsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    const bookings = await Booking.find({ userId }).populate("hotelRoomId");

    // Log activity
    await logActivity({
      req,
      userId,
      action: "VIEW_BOOKINGS",
      details: { count: bookings.length },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    await Booking.findByIdAndDelete(bookingId);
    // Log activity
    await logActivity({
      req,
      userId: req.user ? req.user._id : null,
      action: "DELETE_BOOKING",
      details: { bookingId },
    });

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const { bookingId, totalPrice, title } = req.body;

    if (!bookingId || !totalPrice) {
      return res
        .status(400)
        .json({ message: "Booking ID and total price are required." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title || "Booking Payment",
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/success?session_id=cs_test_a1VUgrmydFOCkdxyuDTUCcLLEDg2LE7AuEfwJXxMkJzaz8EUA9taqWRdOp`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: {
        bookingId: bookingId,
      },
    });

    // Log activity
    await logActivity({
      req,
      userId: req.user ? req.user._id : null,
      action: "CREATE_CHECKOUT_SESSION",
      details: { bookingId, sessionId: session.id, totalPrice },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    try {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "Paid" });
      console.log(`Booking ${bookingId} marked as paid.`);

      // Log activity
      await logActivity({
        req,
        userId: null, 
        action: "PAYMENT_COMPLETED",
        details: { bookingId, sessionId: session.id },
      });
    } catch (err) {
      console.error("Error updating booking payment status:", err);
    }
  }

  res.status(200).send("Webhook received");
};

module.exports = {
  createBooking,
  getBookingsByUserId,
  deleteBookingById,
  createCheckoutSession,
  stripeWebhook,
};

require("dotenv").config();
const Booking = require("../model/bookingModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const logActivity = require("../utils/activityLogger");
const nodemailer = require("nodemailer");

const createBooking = async (req, res) => {
  try {
    const {
      hotelRoomId,
      checkInDate,
      checkOutDate,
      guests,
      rooms,
      totalPrice,
    } = req.body;

    if (
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

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date." });
    }
    if (new Date(checkInDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Check-in date cannot be in the past." });
    }

    const booking = new Booking({
      userId: req.user._id,
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
      userId: req.user._id,
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
    const booking = await Booking.findById(bookingId).populate("userId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.findByIdAndDelete(bookingId);
    // Log activity
    await logActivity({
      req,
      userId: req.user ? req.user._id : null,
      action: "DELETE_BOOKING",
      details: { bookingId },
    });

    if (booking.userId && booking.userId.email) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: '"StayNest Hotel Booking" <' + process.env.EMAIL_USER + ">",
        to: booking.userId.email,
        subject: "Booking Canceled",
        html: `
          <h2>Booking Canceled</h2>
          <p>Hello ${booking.userId.username},</p>
          <p>Your booking (ID: <strong>${booking._id}</strong>) has been successfully canceled.</p>
          <p>We hope to serve you again in the future.</p>
        `,
      });
    }

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
      success_url: `https://localhost:5173/success?session_id=cs_test_a1VUgrmydFOCkdxyuDTUCcLLEDg2LE7AuEfwJXxMkJzaz8EUA9taqWRdOp`,
      cancel_url: `https://localhost:5173/cancel`,
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
    console.log("Webhook received with event:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    try {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: "Paid" });
      const booking = await Booking.findById(bookingId).populate("userId");
      const user = booking?.userId;

      if (user?.email) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          from: `"StayNest Booking" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Booking Confirmed",
          html: `
            <h2>Thanks for booking with StayNest!</h2>
            <p>Hi ${user.username}, your booking is now confirmed.</p>
            <ul>
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>Check‑in:</strong> ${new Date(
                booking.checkInDate
              ).toLocaleDateString()}</li>
              <li><strong>Check‑out:</strong> ${new Date(
                booking.checkOutDate
              ).toLocaleDateString()}</li>
              <li><strong>Total Paid:</strong> $${booking.totalPrice}</li>
            </ul>
            <p>We look forward to hosting you!</p>
          `,
        });
      }
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

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("hotelRoomId");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getBookingsByUserId,
  deleteBookingById,
  createCheckoutSession,
  stripeWebhook,
  getAllBookings,
};

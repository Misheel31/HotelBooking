require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoute = require("./routes/userRoute.js");
const authRoutes = require("./routes/authRoute.js");
const hotelRoute = require("./routes/hotelRoute.js");
const wishlistRoute = require("./routes/wishlistRoute.js");
const bookingRoute = require("./routes/bookingRoute.js");
const activityLogRoute = require("./routes/activityLogRoutes.js");

connectDB();

const app = express();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(helmet());
app.use(cors());

app.post("/api/booking/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
  })
);
// app.set("trust proxy", 1); // or true

app.use("/api/user", userRoute);
app.use("/api/auth", authRoutes);
app.use("/api/hotel", hotelRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/activity-log", activityLogRoute);

// app.use("/hotel_room_images", express.static("hotel_room_images"));
app.use(
  "/hotel_room_images",
  express.static("hotel_room_images", {
    setHeaders: (res, path) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
app.use("/uploads", express.static("uploads"));

const https = require("https");
const fs = require("fs");
const path = require("path");

if (require.main === module && process.env.NODE_ENV !== "test") {
  const options = {
    key: fs.readFileSync(path.resolve(__dirname, "./certs/localhost-key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "./certs/localhost.pem")),
  };

  https.createServer(options, app).listen(3000, "0.0.0.0", () => {
    console.log("HTTPS backend running on https://0.0.0.0:3000");
  });
}

module.exports = app;

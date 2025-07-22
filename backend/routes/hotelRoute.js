const express = require("express");
const {
  createHotelRoom,
  getAllHotelRooms,
  getHotelRoomById,
  updateHotelRoomById,
  deleteHotelRoomById,
  searchHotelRooms,
  getHotelRoomsByLocation,
  getHotelRoomsByPriceRange,
} = require("../controller/hotelRoomController");

const multer = require("multer");
const authenticateUser = require("../middleware/userAuthenticate");
const authorizeRoles = require("../middleware/authorizeRole");
const router = express.Router();

// Multer storage with unique filenames to avoid overwriting
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "hotel_room_images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// File filter to accept only valid image formats
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/avif",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, JPG, and AVIF are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Routes
router.post("/hotel-rooms/create", upload.single("image"), createHotelRoom);

// Search and filter
router.get("/hotel-rooms/search", searchHotelRooms);
router.get("/hotel-rooms/location/:location", getHotelRoomsByLocation);
router.get("/hotel-rooms/by-price-range", getHotelRoomsByPriceRange);

router.get("/hotel-rooms", getAllHotelRooms);
router.get("/hotel-rooms/:id", getHotelRoomById);
router.put("/hotel-rooms/:id", upload.single("image"), updateHotelRoomById);
router.delete(
  "/hotel-rooms/:id",
  authenticateUser,
  authorizeRoles("admin"),
  deleteHotelRoomById
);

// Multer error handler middleware
router.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    (err.message && err.message.includes("Invalid file type"))
  ) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;

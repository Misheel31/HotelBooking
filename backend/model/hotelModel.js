const mongoose = require("mongoose");

const hotelRoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    hotelName: { type: String, required: true },
    location: { type: String, required: true },
    image: [{ type: String, required: true }],
    pricePerNight: { type: Number, required: true },
    available: { type: Boolean, default: true },
    amenities: [String],

    roomTypes: [
      {
        type: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String },
        capacity: { type: Number },
        beds: { type: String },
        bathroomCount: { type: Number },
        maxGuests: { type: Number },
        features: [String],
      },
    ],
  },
  { timestamps: true }
);

const HotelRoom = mongoose.model("HotelRoom", hotelRoomSchema);
module.exports = HotelRoom;

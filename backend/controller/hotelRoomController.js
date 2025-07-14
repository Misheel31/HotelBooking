const HotelRoom = require("../model/hotelModel");

const createHotelRoom = async (req, res) => {
  try {
    let {
      title,
      description,
      hotelName,
      location,
      pricePerNight,
      available,
      amenities,
      roomTypes,
    } = req.body;

    if (typeof roomTypes === "string") {
      try {
        roomTypes = JSON.parse(roomTypes);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for roomTypes" });
      }
    }

    if (typeof amenities === "string") {
      try {
        amenities = JSON.parse(amenities);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for amenities" });
      }
    }

    if (
      !title ||
      !description ||
      !hotelName ||
      !location ||
      !pricePerNight ||
      !Array.isArray(roomTypes) ||
      roomTypes.length === 0
    ) {
      return res.status(400).json({
        error:
          "title, description, hotelName, location, pricePerNight, and at least one roomType are required.",
      });
    }

    const newHotelRoom = new HotelRoom({
      title,
      description,
      hotelName,
      location: location.trim(),
      pricePerNight,
      available: available !== undefined ? available : true,
      amenities,
      roomTypes,
      image: req.file ? req.file.filename : null,
    });

    await newHotelRoom.save();
    res.status(201).json(newHotelRoom);
  } catch (error) {
    console.error("Error creating hotel room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all hotel rooms
const getAllHotelRooms = async (req, res) => {
  try {
    const hotelRooms = await HotelRoom.find();
    if (!hotelRooms.length) {
      return res.status(404).json({ message: "No hotel rooms found" });
    }
    res.status(200).json(hotelRooms);
  } catch (error) {
    console.error("Error fetching all hotel rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get hotel room by ID
const getHotelRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelRoom = await HotelRoom.findById(id);

    if (!hotelRoom) {
      return res.status(404).json({ error: "Hotel room not found" });
    }

    res.status(200).json(hotelRoom);
  } catch (error) {
    console.error("Error fetching hotel room by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateHotelRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      hotelName,
      location,
      pricePerNight,
      available,
      amenities,
      roomTypes,
    } = req.body;

    if (roomTypes && typeof roomTypes === "string") {
      try {
        roomTypes = JSON.parse(roomTypes);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for roomTypes" });
      }
    }

    if (amenities && typeof amenities === "string") {
      try {
        amenities = JSON.parse(amenities);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for amenities" });
      }
    }

    if (
      title === undefined ||
      description === undefined ||
      hotelName === undefined ||
      location === undefined ||
      pricePerNight === undefined
    ) {
      return res.status(400).json({
        error:
          "Title, description, hotelName, location, and pricePerNight are required.",
      });
    }

    const updateData = {
      title,
      description,
      hotelName,
      location: location.trim(),
      pricePerNight,
      available,
      amenities,
    };

    if (roomTypes) {
      updateData.roomTypes = roomTypes;
    }

    if (req.file) {
      updateData.image = req.file.filename;
    }

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedHotelRoom = await HotelRoom.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedHotelRoom) {
      return res.status(404).json({ error: "Hotel room not found" });
    }

    res.status(200).json(updatedHotelRoom);
  } catch (error) {
    console.error("Error updating hotel room by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete hotel room by ID
const deleteHotelRoomById = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim().replace(/^:/, "").replace(/\n$/, "");

    const deletedHotelRoom = await HotelRoom.findByIdAndDelete(id);

    if (!deletedHotelRoom) {
      return res.status(404).json({ error: "Hotel room not found" });
    }

    return res.status(200).json({ message: "Hotel room deleted successfully" });
  } catch (error) {
    console.error("Error deleting hotel room by ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Search hotel rooms by term in title, description, hotelName, or location
const searchHotelRooms = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const regex = new RegExp(searchTerm, "i");
    const hotelRooms = await HotelRoom.find({
      $or: [
        { title: regex },
        { description: regex },
        { hotelName: regex },
        { location: regex },
      ],
    });

    if (!hotelRooms.length) {
      return res.status(404).json({ message: "No matching hotel rooms found" });
    }

    res.status(200).json(hotelRooms);
  } catch (error) {
    console.error("Error searching hotel rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get hotel rooms by location
const getHotelRoomsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    if (!location) {
      return res.status(400).json({ error: "Location parameter is required" });
    }

    const hotelRooms = await HotelRoom.find({ location: location.trim() });

    if (!hotelRooms.length) {
      return res
        .status(404)
        .json({ message: "No hotel rooms found in the specified location" });
    }

    res.status(200).json(hotelRooms);
  } catch (error) {
    console.error("Error fetching hotel rooms by location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get hotel rooms by price range
const getHotelRoomsByPriceRange = async (req, res) => {
  try {
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ message: "Invalid price range values" });
    }

    const hotelRooms = await HotelRoom.find({
      pricePerNight: { $gte: minPrice, $lte: maxPrice },
    });

    if (!hotelRooms.length) {
      return res
        .status(404)
        .json({ message: "No hotel rooms found in the specified price range" });
    }

    res.status(200).json(hotelRooms);
  } catch (error) {
    console.error("Error fetching hotel rooms by price range:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createHotelRoom,
  getAllHotelRooms,
  getHotelRoomById,
  updateHotelRoomById,
  deleteHotelRoomById,
  searchHotelRooms,
  getHotelRoomsByLocation,
  getHotelRoomsByPriceRange,
};

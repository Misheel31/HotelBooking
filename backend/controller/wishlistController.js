const Wishlist = require("../model/wishlistModel");

const addToWishlist = async (req, res) => {
  try {
    const { hotelRoomId } = req.body;
    const userId = req.user._id;
    const existing = await Wishlist.findOne({ userId, hotelRoomId });
    if (existing) {
      return res.status(409).json({ message: "Already in wishlist" });
    }

    const wishlistItem = new Wishlist({
      userId,
      hotelRoomId,
    });

    await wishlistItem.save();
    res.status(201).json(wishlistItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWishlist = await Wishlist.findByIdAndDelete(id);
    if (!deletedWishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }
    res.status(200).json({ message: "Wishlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the wishlist" });
  }
};

const getWishlistByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("Fetching wishlist for userId:", userId);

    const wishlist = await Wishlist.find({ userId }).populate("hotelRoomId");

    if (!wishlist || wishlist.length === 0) {
      return res.status(404).json({ message: "No wishlist items found" });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  removeFromWishlist,
  addToWishlist,
  getWishlistByUserId,
};

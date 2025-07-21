const express = require("express");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlistByUserId,
} = require("../controller/wishlistController");
const authenticateUser = require("../middleware/userAuthenticate");

const router = express.Router();

router.post("/", authenticateUser, addToWishlist);
router.delete("/:id", removeFromWishlist);
router.get("/:id", getWishlistByUserId);

module.exports = router;

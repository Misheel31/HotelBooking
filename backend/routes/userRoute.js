const express = require("express");
const {
  findAll,
  save,
  findById,
  deleteById,
  update,
  uploadImage,
} = require("../controller/userController");

const router = express.Router();

const multer = require("multer");
const authenticateUser = require("../middleware/userAuthenticate");
const authorizeRoles = require("../middleware/authorizeRole");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", findAll);
router.post("/", save);
router.post("/uploadImage", upload.single("image"), uploadImage);
router.get("/:id", findById);
router.delete("/:id", authenticateUser, authorizeRoles("admin"), deleteById);
router.put("/:id", update);

module.exports = router;

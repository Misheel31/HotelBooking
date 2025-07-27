const express = require("express");
const router = express.Router();
const { getActivityLogs } = require("../controller/activityLogController");
const authenticateUser = require("../middleware/userAuthenticate");
const authorizeRoles = require("../middleware/authorizeRole");

router.get("/", authenticateUser, authorizeRoles("admin"), getActivityLogs);

module.exports = router;

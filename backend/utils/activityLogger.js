const ActivityLog = require("../model/activityLog");

const logActivity = async ({ req, userId, action, details }) => {
  try {
    await ActivityLog.create({
      userId: userId || (req.user ? req.user._id : null),
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

module.exports = logActivity;

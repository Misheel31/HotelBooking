const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("ActivityLog", activityLogSchema);

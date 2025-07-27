const ActivityLog = require("../model/activityLog");

const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

module.exports = { getActivityLogs };

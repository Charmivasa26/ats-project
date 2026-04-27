const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  action: { type: String, required: true },
  targetType: {
    type: String,
    enum: ["Candidate", "Job", "Vendor", "Interview", "User"],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);

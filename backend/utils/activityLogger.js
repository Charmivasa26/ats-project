const ActivityLog = require("../models/ActivityLog");

/**
 * Log an activity to the database.
 * @param {ObjectId|null} userId
 * @param {string} action - e.g. "Candidate status changed to Shortlisted"
 * @param {string} targetType - "Candidate" | "Job" | "Vendor" | "Interview"
 * @param {ObjectId|null} targetId
 * @param {object} metadata - any extra data to store
 */
const logActivity = async (
  userId,
  action,
  targetType,
  targetId,
  metadata = {}
) => {
  try {
    await ActivityLog.create({ userId, action, targetType, targetId, metadata });
  } catch (err) {
    // Non-blocking: log errors without breaking the main request
    console.error("Activity log error:", err.message);
  }
};

module.exports = { logActivity };

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ── Existing fields ──────────────────────────────────────────
    title: { type: String, required: true, trim: true },
    skills: { type: String, required: true, trim: true },
    budget: { type: Number, required: true },

    // ── New fields ───────────────────────────────────────────────
    description: { type: String, default: "" },
    department: { type: String, trim: true, default: "" },
    location: { type: String, default: "Remote" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    openingsCount: { type: Number, default: 1, min: 1 },
    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedVendors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    ],
    approvalStatus: {
      type: String,
      enum: ["Draft", "Pending", "Approved", "Assigned", "Closed"],
      default: "Draft",
    },
    // Keep old status field for backward compatibility
    status: {
      type: String,
      default: "Open",
      enum: ["Open", "Closed"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);

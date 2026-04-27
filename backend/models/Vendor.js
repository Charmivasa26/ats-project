const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    // ── Existing fields ──────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },

    // ── New profile fields ───────────────────────────────────────
    phone: { type: String, default: "" },
    profileDetails: { type: String, default: "" },
    website: { type: String, default: "" },
    specializations: [{ type: String }],

    // ── Performance metrics ──────────────────────────────────────
    rating: { type: Number, default: 0, min: 0, max: 5 },
    performanceScore: { type: Number, default: 0 },
    submissionQuality: { type: Number, default: 0 }, // % good submissions
    avgResponseTime: { type: Number, default: 0 }, // hours
    closuresCount: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);

const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    // ── Existing fields ──────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    resumeLink: { type: String, default: "" }, // kept for backward compat
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    // ── Status (expanded enum) ───────────────────────────────────
    status: {
      type: String,
      default: "Applied",
      enum: [
        "Applied",
        "Screened",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
      ],
    },

    // ── New profile fields ───────────────────────────────────────
    phone: { type: String, default: "" },
    experience: { type: Number, default: 0 }, // years
    noticePeriod: { type: Number, default: 0 }, // days
    currentSalary: { type: Number, default: 0 },
    expectedSalary: { type: Number, default: 0 },
    skillsTags: [{ type: String }],
    source: {
      type: String,
      enum: ["Vendor", "Direct", "Referral", "Portal", "Other"],
      default: "Vendor",
    },

    // ── Resume upload ────────────────────────────────────────────
    resumeUrl: { type: String, default: "" }, // local file path from multer

    // ── Internal notes ───────────────────────────────────────────
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Duplicate detection: same email cannot be submitted for same job twice
candidateSchema.index({ email: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Candidate", candidateSchema);

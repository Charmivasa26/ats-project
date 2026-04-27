const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    mode: {
      type: String,
      enum: ["Online", "In-Person", "Phone"],
      default: "Online",
    },
    round: { type: Number, default: 1 },
    feedback: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    decision: {
      type: String,
      enum: ["Pending", "Selected", "Rejected", "On-Hold"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);

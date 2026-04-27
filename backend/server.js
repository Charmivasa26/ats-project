const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads folder ─────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ── API Routes ────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vendors", require("./routes/vendorRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/interviews", require("./routes/interviewRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// ── Health check ──────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "ATS Backend Running ✓" }));

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ── Connect MongoDB & start server ────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
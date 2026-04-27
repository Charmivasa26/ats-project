const express = require("express");
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  assignVendors,
  deleteJob,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

// All job routes require authentication
router.use(protect);

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/", restrictTo("Admin", "HR", "HiringManager"), createJob);
router.put("/:id", restrictTo("Admin", "HR"), updateJob);
router.patch("/:id/status", restrictTo("Admin", "HR"), updateJobStatus);
router.patch("/:id/assign-vendors", restrictTo("Admin", "HR"), assignVendors);
router.delete("/:id", restrictTo("Admin"), deleteJob);

module.exports = router;

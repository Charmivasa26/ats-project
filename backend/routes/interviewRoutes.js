const express = require("express");
const {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getInterviews);
router.get("/:id", getInterviewById);
router.post("/", restrictTo("Admin", "HR"), createInterview);
router.patch("/:id", updateInterview); // any authenticated user can submit feedback
router.delete("/:id", restrictTo("Admin", "HR"), deleteInterview);

module.exports = router;

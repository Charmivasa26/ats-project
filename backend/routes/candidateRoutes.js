const express = require("express");
const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidateStatus,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");
const upload = require("../config/multerConfig");

const router = express.Router();

router.use(protect);

router.get("/", getCandidates);
router.get("/:id", getCandidateById);

// Resume upload via multer — field name: "resume"
router.post(
  "/",
  restrictTo("Admin", "HR", "Vendor"),
  upload.single("resume"),
  createCandidate
);

router.patch(
  "/:id/status",
  restrictTo("Admin", "HR", "HiringManager"),
  updateCandidateStatus
);
router.put("/:id", restrictTo("Admin", "HR"), updateCandidate);
router.delete("/:id", restrictTo("Admin", "HR"), deleteCandidate);

module.exports = router;

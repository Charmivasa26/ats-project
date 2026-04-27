const express = require("express");
const { getAdminStats, getVendorStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get("/stats", restrictTo("Admin", "HR"), getAdminStats);
router.get("/vendor-stats", restrictTo("Vendor"), getVendorStats);

module.exports = router;

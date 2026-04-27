const express = require("express");
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getVendors);
router.get("/:id", getVendorById);
router.post("/", restrictTo("Admin", "HR"), createVendor);
router.put("/:id", restrictTo("Admin", "HR"), updateVendor);
router.delete("/:id", restrictTo("Admin"), deleteVendor);

module.exports = router;

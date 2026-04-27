const Vendor = require("../models/Vendor");
const { logActivity } = require("../utils/activityLogger");

// GET all vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single vendor
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create vendor
const createVendor = async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      profileDetails,
      website,
      specializations,
    } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({ error: "name, company and email are required" });
    }

    const vendor = new Vendor({
      name,
      company,
      email,
      phone,
      profileDetails,
      website,
      specializations: Array.isArray(specializations)
        ? specializations
        : specializations
        ? specializations.split(",").map((s) => s.trim())
        : [],
    });

    await vendor.save();
    await logActivity(req.user._id, `Vendor "${name}" created`, "Vendor", vendor._id);
    res.status(201).json(vendor);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

// PATCH update vendor
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    await logActivity(req.user._id, `Vendor "${vendor.name}" updated`, "Vendor", vendor._id);
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE vendor
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    await logActivity(req.user._id, `Vendor "${vendor.name}" deleted`, "Vendor", vendor._id);
    res.json({ message: "Vendor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVendors, getVendorById, createVendor, updateVendor, deleteVendor };

const Candidate = require("../models/Candidate");
const { logActivity } = require("../utils/activityLogger");

// GET all candidates (filter by jobId, status, vendorId)
const getCandidates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.jobId) filter.jobId = req.query.jobId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;

    // Vendors can only see their own submitted candidates
    if (req.user.role === "Vendor" && req.user.vendorRef) {
      filter.vendorId = req.user.vendorRef;
    }

    const candidates = await Candidate.find(filter)
      .populate("jobId", "title department")
      .populate("vendorId", "name company")
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single candidate
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate("jobId", "title department skills")
      .populate("vendorId", "name company email");
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST submit candidate (with optional resume upload)
const createCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      jobId,
      vendorId,
      phone,
      experience,
      noticePeriod,
      currentSalary,
      expectedSalary,
      skillsTags,
      source,
      notes,
      resumeLink,
    } = req.body;

    if (!name || !email || !jobId) {
      return res.status(400).json({ error: "name, email and jobId are required" });
    }

    // Duplicate detection
    const existing = await Candidate.findOne({ email: email.toLowerCase(), jobId });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Candidate with this email already applied for this job" });
    }

    // Resume file from multer
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : (resumeLink || "");

    const candidate = new Candidate({
      name,
      email,
      jobId,
      vendorId: vendorId || (req.user.role === "Vendor" ? req.user.vendorRef : null),
      phone,
      experience: Number(experience) || 0,
      noticePeriod: Number(noticePeriod) || 0,
      currentSalary: Number(currentSalary) || 0,
      expectedSalary: Number(expectedSalary) || 0,
      skillsTags: Array.isArray(skillsTags)
        ? skillsTags
        : (skillsTags ? skillsTags.split(",").map((s) => s.trim()) : []),
      source: source || "Vendor",
      notes,
      resumeUrl,
      resumeLink,
      status: "Applied",
    });

    await candidate.save();
    await logActivity(
      req.user._id,
      `Candidate "${name}" submitted for job`,
      "Candidate",
      candidate._id
    );

    res.status(201).json(candidate);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Duplicate: same email + job combination exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

// PATCH update candidate status
const updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Applied",
      "Screened",
      "Shortlisted",
      "Interview",
      "Selected",
      "Rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const oldStatus = candidate.status;
    candidate.status = status;
    await candidate.save();

    await logActivity(
      req.user._id,
      `Candidate "${candidate.name}" status: ${oldStatus} → ${status}`,
      "Candidate",
      candidate._id,
      { oldStatus, newStatus: status }
    );

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update candidate (general)
const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE candidate
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    await logActivity(
      req.user._id,
      `Candidate "${candidate.name}" deleted`,
      "Candidate",
      candidate._id
    );
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidateStatus,
  updateCandidate,
  deleteCandidate,
};

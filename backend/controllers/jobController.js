const Job = require("../models/Job");
const { logActivity } = require("../utils/activityLogger");

// GET all jobs
const getJobs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.priority) filter.priority = req.query.priority;

    const jobs = await Job.find(filter)
      .populate("hiringManager", "name email role")
      .populate("assignedVendors", "name company email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single job
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("hiringManager", "name email role")
      .populate("assignedVendors", "name company email");
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create job (starts as Draft)
const createJob = async (req, res) => {
  try {
    const {
      title,
      skills,
      budget,
      description,
      department,
      location,
      priority,
      openingsCount,
      hiringManager,
    } = req.body;

    if (!title || !skills || !budget) {
      return res.status(400).json({ error: "title, skills and budget are required" });
    }

    const job = new Job({
      title,
      skills,
      budget,
      description,
      department,
      location,
      priority,
      openingsCount,
      hiringManager: hiringManager || req.user._id,
      approvalStatus: "Draft",
    });

    await job.save();

    await logActivity(req.user._id, `Job "${title}" created as Draft`, "Job", job._id);

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH update job details
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("hiringManager assignedVendors");

    if (!job) return res.status(404).json({ error: "Job not found" });

    await logActivity(req.user._id, `Job "${job.title}" updated`, "Job", job._id);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH approval workflow: Draft→Pending→Approved→Assigned→Closed
const updateJobStatus = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const validStatuses = ["Draft", "Pending", "Approved", "Assigned", "Closed"];

    if (!validStatuses.includes(approvalStatus)) {
      return res.status(400).json({ error: "Invalid approval status" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const oldStatus = job.approvalStatus;
    job.approvalStatus = approvalStatus;

    // Keep legacy status field in sync
    if (approvalStatus === "Closed") job.status = "Closed";
    else job.status = "Open";

    await job.save();

    await logActivity(
      req.user._id,
      `Job "${job.title}" status changed: ${oldStatus} → ${approvalStatus}`,
      "Job",
      job._id,
      { oldStatus, newStatus: approvalStatus }
    );

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH assign vendors to job
const assignVendors = async (req, res) => {
  try {
    const { vendorIds } = req.body;
    if (!Array.isArray(vendorIds)) {
      return res.status(400).json({ error: "vendorIds must be an array" });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { assignedVendors: vendorIds, approvalStatus: "Assigned" },
      { new: true }
    ).populate("assignedVendors", "name company email");

    if (!job) return res.status(404).json({ error: "Job not found" });

    await logActivity(
      req.user._id,
      `Vendors assigned to job "${job.title}"`,
      "Job",
      job._id,
      { vendorIds }
    );

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    await logActivity(req.user._id, `Job "${job.title}" deleted`, "Job", job._id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  assignVendors,
  deleteJob,
};

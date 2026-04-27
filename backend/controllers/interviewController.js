const Interview = require("../models/Interview");
const { logActivity } = require("../utils/activityLogger");

// GET all interviews (filterable)
const getInterviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.candidateId) filter.candidateId = req.query.candidateId;
    if (req.query.jobId) filter.jobId = req.query.jobId;
    if (req.query.interviewerId) filter.interviewerId = req.query.interviewerId;

    const interviews = await Interview.find(filter)
      .populate("candidateId", "name email status")
      .populate("jobId", "title department")
      .populate("interviewerId", "name email role")
      .sort({ date: 1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET single interview
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidateId", "name email phone")
      .populate("jobId", "title department")
      .populate("interviewerId", "name email");
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST schedule interview
const createInterview = async (req, res) => {
  try {
    const { candidateId, jobId, interviewerId, date, mode, round } = req.body;
    if (!candidateId || !jobId || !interviewerId || !date) {
      return res
        .status(400)
        .json({ error: "candidateId, jobId, interviewerId and date are required" });
    }

    const interview = await Interview.create({
      candidateId,
      jobId,
      interviewerId,
      date,
      mode,
      round,
    });

    await logActivity(
      req.user._id,
      `Interview scheduled for candidate`,
      "Interview",
      interview._id
    );

    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH submit feedback & decision
const updateInterview = async (req, res) => {
  try {
    const { feedback, rating, decision } = req.body;
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { feedback, rating, decision },
      { new: true, runValidators: true }
    );
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    await logActivity(
      req.user._id,
      `Interview feedback submitted — Decision: ${decision}`,
      "Interview",
      interview._id
    );

    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE interview
const deleteInterview = async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
};

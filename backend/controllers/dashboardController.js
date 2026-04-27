const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Vendor = require("../models/Vendor");
const Interview = require("../models/Interview");
const ActivityLog = require("../models/ActivityLog");

// GET /api/dashboard/stats  — Admin / HR
const getAdminStats = async (req, res) => {
  try {
    const [
      totalJobs,
      openJobs,
      totalCandidates,
      selectedCandidates,
      totalVendors,
      totalInterviews,
      recentActivity,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ approvalStatus: { $in: ["Approved", "Assigned"] } }),
      Candidate.countDocuments(),
      Candidate.countDocuments({ status: "Selected" }),
      Vendor.countDocuments(),
      Interview.countDocuments(),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10),
    ]);

    const conversionRate =
      totalCandidates > 0
        ? ((selectedCandidates / totalCandidates) * 100).toFixed(1)
        : 0;

    // Pipeline breakdown
    const pipeline = await Candidate.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Jobs by approval status
    const jobsByStatus = await Job.aggregate([
      { $group: { _id: "$approvalStatus", count: { $sum: 1 } } },
    ]);

    // Vendor performance
    const vendorPerformance = await Vendor.find()
      .select("name company rating performanceScore closuresCount totalSubmissions")
      .sort({ closuresCount: -1 })
      .limit(10);

    res.json({
      overview: {
        totalJobs,
        openJobs,
        totalCandidates,
        selectedCandidates,
        conversionRate: `${conversionRate}%`,
        totalVendors,
        totalInterviews,
      },
      pipeline,
      jobsByStatus,
      vendorPerformance,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dashboard/vendor-stats  — Vendor (own stats)
const getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user.vendorRef;
    if (!vendorId) {
      return res.status(400).json({ error: "No vendor linked to this account" });
    }

    const [totalSubmissions, selected, rejected, inProgress, assignedJobs] =
      await Promise.all([
        Candidate.countDocuments({ vendorId }),
        Candidate.countDocuments({ vendorId, status: "Selected" }),
        Candidate.countDocuments({ vendorId, status: "Rejected" }),
        Candidate.countDocuments({
          vendorId,
          status: { $in: ["Applied", "Screened", "Shortlisted", "Interview"] },
        }),
        Job.find({ assignedVendors: vendorId })
          .select("title department approvalStatus priority openingsCount")
          .limit(10),
      ]);

    const vendor = await Vendor.findById(vendorId).select(
      "name company rating performanceScore closuresCount"
    );

    res.json({
      vendor,
      stats: { totalSubmissions, selected, rejected, inProgress },
      assignedJobs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAdminStats, getVendorStats };

import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../../api";
import toast from "react-hot-toast";

const statusColors = {
  Draft:    "bg-slate-500/20 text-slate-300",
  Pending:  "bg-yellow-500/20 text-yellow-300",
  Approved: "bg-blue-500/20 text-blue-300",
  Assigned: "bg-purple-500/20 text-purple-300",
  Closed:   "bg-red-500/20 text-red-300",
};

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getVendorStats()
      .then((r) => setData(r.data))
      .catch((err) => toast.error(err.response?.data?.error || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { vendor, stats, assignedJobs } = data || {};

  return (
    <div className="space-y-6">
      {/* Vendor profile card */}
      <div className="card border-l-4 border-amber-500">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
            {vendor?.name?.[0]?.toUpperCase() || "V"}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{vendor?.name}</h2>
            <p className="text-slate-400 text-sm">{vendor?.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-400 text-sm">{"★".repeat(Math.round(vendor?.rating || 0))}</span>
              <span className="text-slate-400 text-xs">Rating: {vendor?.rating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Submissions",  value: stats?.totalSubmissions, color: "border-blue-500" },
          { label: "Selected",     value: stats?.selected,         color: "border-emerald-500" },
          { label: "In Progress",  value: stats?.inProgress,       color: "border-purple-500" },
          { label: "Rejected",     value: stats?.rejected,         color: "border-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`card border-l-4 ${color} text-center`}>
            <p className="text-white text-2xl font-bold">{value ?? 0}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Assigned jobs */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Assigned Jobs ({assignedJobs?.length || 0})</h2>
        {assignedJobs?.length ? (
          <div className="space-y-3">
            {assignedJobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div>
                  <p className="text-white font-medium">{job.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{job.department} • {job.openingsCount} opening(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge px-2 py-1 rounded-md text-xs font-semibold ${statusColors[job.approvalStatus]}`}>{job.approvalStatus}</span>
                  <span className={`badge px-2 py-0.5 rounded-md text-xs ${
                    job.priority === "High" ? "bg-red-500/20 text-red-300" :
                    job.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" :
                    "bg-slate-500/20 text-slate-300"
                  }`}>{job.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No jobs assigned to you yet.</p>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;

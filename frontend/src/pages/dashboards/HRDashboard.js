import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../../api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { overview, pipeline } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "💼", label: "Open Jobs",         value: overview?.openJobs,          color: "border-blue-500" },
          { icon: "👥", label: "Total Candidates",  value: overview?.totalCandidates,   color: "border-purple-500" },
          { icon: "✅", label: "Conversion Rate",   value: overview?.conversionRate,    color: "border-emerald-500" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className={`card border-l-4 ${color} flex items-center gap-4`}>
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-slate-400 text-sm">{label}</p>
              <p className="text-white text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/jobs" className="btn-primary">➕ Create Job</Link>
          <Link to="/candidates" className="btn-primary">👤 Add Candidate</Link>
          <Link to="/pipeline" className="btn-secondary">🔀 View Pipeline</Link>
          <Link to="/interviews" className="btn-secondary">📅 Schedule Interview</Link>
        </div>
      </div>

      {/* Pipeline summary */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Pipeline Overview</h2>
        <div className="flex flex-wrap gap-3">
          {pipeline?.map(({ _id, count }) => (
            <div key={_id} className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-slate-400 text-xs mt-1">{_id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

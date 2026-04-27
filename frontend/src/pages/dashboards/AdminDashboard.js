import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../../api";
import toast from "react-hot-toast";

const statusColors = {
  Applied:     "bg-blue-500/20 text-blue-300",
  Screened:    "bg-yellow-500/20 text-yellow-300",
  Shortlisted: "bg-orange-500/20 text-orange-300",
  Interview:   "bg-purple-500/20 text-purple-300",
  Selected:    "bg-emerald-500/20 text-emerald-300",
  Rejected:    "bg-red-500/20 text-red-300",
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={`card flex items-center gap-4 border-l-4 ${color}`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
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

  const { overview, pipeline, jobsByStatus, vendorPerformance, recentActivity } = data || {};

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="💼" label="Total Jobs" value={overview?.totalJobs} sub={`${overview?.openJobs} active`} color="border-blue-500" />
        <StatCard icon="👥" label="Total Candidates" value={overview?.totalCandidates} sub={`${overview?.selectedCandidates} selected`} color="border-emerald-500" />
        <StatCard icon="📈" label="Conversion Rate" value={overview?.conversionRate} sub="candidates → selected" color="border-purple-500" />
        <StatCard icon="🏢" label="Total Vendors" value={overview?.totalVendors} sub={`${overview?.totalInterviews} interviews`} color="border-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline breakdown */}
        <div className="card xl:col-span-1">
          <h2 className="text-white font-semibold mb-4">Candidate Pipeline</h2>
          <div className="space-y-3">
            {pipeline?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between">
                <span className={`badge px-3 py-1 rounded-full text-xs font-semibold ${statusColors[_id] || "bg-slate-600 text-slate-300"}`}>{_id}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-slate-700 rounded-full w-28">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (count / (overview?.totalCandidates || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-slate-300 font-semibold text-sm w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by status */}
        <div className="card xl:col-span-1">
          <h2 className="text-white font-semibold mb-4">Jobs by Status</h2>
          <div className="space-y-3">
            {jobsByStatus?.map(({ _id, count }) => (
              <div key={_id} className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">{_id}</span>
                <span className="bg-blue-500/20 text-blue-300 badge px-2 py-0.5 rounded-md text-xs font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card xl:col-span-1">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity?.map((log) => (
              <div key={log._id} className="flex gap-3 items-start">
                <span className="text-blue-400 mt-0.5 text-sm">●</span>
                <div>
                  <p className="text-slate-200 text-sm leading-snug">{log.action}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!recentActivity?.length && <p className="text-slate-500 text-sm">No recent activity</p>}
          </div>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Vendor Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="table-header">Vendor</th>
                <th className="table-header">Company</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Score</th>
                <th className="table-header">Closures</th>
                <th className="table-header">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {vendorPerformance?.map((v) => (
                <tr key={v._id} className="table-row">
                  <td className="table-cell font-medium">{v.name}</td>
                  <td className="table-cell text-slate-400">{v.company}</td>
                  <td className="table-cell">
                    <span className="text-amber-400">{"★".repeat(Math.round(v.rating))}{"☆".repeat(5 - Math.round(v.rating))}</span>
                  </td>
                  <td className="table-cell">{v.performanceScore}</td>
                  <td className="table-cell">{v.closuresCount}</td>
                  <td className="table-cell">{v.totalSubmissions}</td>
                </tr>
              ))}
              {!vendorPerformance?.length && (
                <tr><td colSpan={6} className="table-cell text-slate-500 text-center py-8">No vendor data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import { jobAPI, vendorAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PRIORITIES  = ["Low", "Medium", "High"];
const STATUSES    = ["Draft", "Pending", "Approved", "Assigned", "Closed"];

const priorityColor = {
  Low:    "bg-slate-500/20 text-slate-300",
  Medium: "bg-yellow-500/20 text-yellow-300",
  High:   "bg-red-500/20 text-red-300",
};
const statusColor = {
  Draft:    "bg-slate-600/40 text-slate-300",
  Pending:  "bg-yellow-500/20 text-yellow-300",
  Approved: "bg-blue-500/20 text-blue-300",
  Assigned: "bg-purple-500/20 text-purple-300",
  Closed:   "bg-red-500/20 text-red-300",
};

const emptyForm = {
  title: "", skills: "", budget: "", description: "",
  department: "", location: "Remote", priority: "Medium", openingsCount: 1,
};

const JobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs]           = useState([]);
  const [vendors, setVendors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [vendorModal, setVendorModal] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]);

  const fetchJobs = () => jobAPI.getAll().then((r) => setJobs(r.data)).catch(() => toast.error("Failed to load jobs"));

  useEffect(() => {
    Promise.all([fetchJobs(), vendorAPI.getAll().then((r) => setVendors(r.data))])
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await jobAPI.create({ ...form, budget: Number(form.budget), openingsCount: Number(form.openingsCount) });
      toast.success("Job created as Draft!");
      setShowForm(false);
      setForm(emptyForm);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, approvalStatus) => {
    try {
      await jobAPI.updateStatus(id, { approvalStatus });
      toast.success(`Status → ${approvalStatus}`);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await jobAPI.delete(id);
      toast.success("Job deleted");
      fetchJobs();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleAssignVendors = async () => {
    try {
      await jobAPI.assignVendors(vendorModal._id, { vendorIds: selectedVendors });
      toast.success("Vendors assigned!");
      setVendorModal(null);
      fetchJobs();
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  const toggleVendor = (id) =>
    setSelectedVendors((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);

  const canManage = ["Admin", "HR"].includes(user?.role);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Job Requisitions</h1>
          <p className="page-sub">{jobs.length} total jobs</p>
        </div>
        {canManage && (
          <button id="create-job-btn" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "➕ New Job"}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <h2 className="text-white font-semibold text-lg mb-5">New Job Requisition</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Job Title *</label>
              <input className="input" placeholder="e.g. Senior Backend Developer" required
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" placeholder="e.g. Engineering"
                value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Remote / Hybrid / On-site"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Required Skills *</label>
              <input className="input" placeholder="e.g. React, Node.js, MongoDB" required
                value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div>
              <label className="label">Budget (₹) *</label>
              <input type="number" className="input" placeholder="e.g. 1200000" required
                value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div>
              <label className="label">Openings</label>
              <input type="number" className="input" min={1} value={form.openingsCount}
                onChange={(e) => setForm({ ...form, openingsCount: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[80px] resize-none" placeholder="Job description..."
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create Job (Draft)"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="table-header">Title</th>
                <th className="table-header">Dept / Location</th>
                <th className="table-header">Skills</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Status</th>
                <th className="table-header">Openings</th>
                <th className="table-header">Budget</th>
                {canManage && <th className="table-header text-right pr-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-white">{job.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="table-cell">
                    <p>{job.department || "—"}</p>
                    <p className="text-slate-400 text-xs">{job.location}</p>
                  </td>
                  <td className="table-cell max-w-[160px]">
                    <p className="truncate text-slate-300">{job.skills}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge px-2 py-0.5 rounded-md text-xs font-semibold ${priorityColor[job.priority]}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="table-cell">
                    {canManage ? (
                      <select
                        value={job.approvalStatus}
                        onChange={(e) => handleStatusChange(job._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusColor[job.approvalStatus]} bg-transparent`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`badge px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor[job.approvalStatus]}`}>
                        {job.approvalStatus}
                      </span>
                    )}
                  </td>
                  <td className="table-cell text-center">{job.openingsCount}</td>
                  <td className="table-cell">₹{Number(job.budget).toLocaleString("en-IN")}</td>
                  {canManage && (
                    <td className="table-cell text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 px-2 py-1 rounded transition-colors"
                          onClick={() => { setVendorModal(job); setSelectedVendors(job.assignedVendors?.map((v) => v._id || v) || []); }}
                        >🏢 Assign</button>
                        <button
                          className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                          onClick={() => handleDelete(job._id)}
                        >🗑</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!jobs.length && (
                <tr><td colSpan={8} className="text-center text-slate-500 py-12">No jobs found. Create your first job requisition.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor assignment modal */}
      {vendorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="text-white font-semibold text-lg mb-1">Assign Vendors</h3>
            <p className="text-slate-400 text-sm mb-4">Job: <span className="text-slate-200">{vendorModal.title}</span></p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {vendors.map((v) => (
                <label key={v._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                  <input type="checkbox" checked={selectedVendors.includes(v._id)}
                    onChange={() => toggleVendor(v._id)}
                    className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500" />
                  <div>
                    <p className="text-white text-sm font-medium">{v.name}</p>
                    <p className="text-slate-400 text-xs">{v.company}</p>
                  </div>
                </label>
              ))}
              {!vendors.length && <p className="text-slate-500 text-sm">No vendors available. Add vendors first.</p>}
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setVendorModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleAssignVendors}>Assign ({selectedVendors.length})</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;

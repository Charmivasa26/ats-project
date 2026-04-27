import React, { useEffect, useState } from "react";
import { candidateAPI, jobAPI, vendorAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUSES = ["Applied","Screened","Shortlisted","Interview","Selected","Rejected"];
const SOURCES  = ["Vendor","Direct","Referral","Portal","Other"];

const statusColor = {
  Applied:     "bg-blue-500/20 text-blue-300",
  Screened:    "bg-yellow-500/20 text-yellow-300",
  Shortlisted: "bg-orange-500/20 text-orange-300",
  Interview:   "bg-purple-500/20 text-purple-300",
  Selected:    "bg-emerald-500/20 text-emerald-300",
  Rejected:    "bg-red-500/20 text-red-300",
};

const emptyForm = {
  name: "", email: "", phone: "", jobId: "", vendorId: "",
  experience: "", noticePeriod: "", currentSalary: "", expectedSalary: "",
  skillsTags: "", source: "Vendor", notes: "",
};

const CandidatesPage = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [vendors, setVendors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJob, setFilterJob]       = useState("");

  const canManage = ["Admin","HR"].includes(user?.role);
  const isVendor  = user?.role === "Vendor";

  const fetchCandidates = () =>
    candidateAPI.getAll({ status: filterStatus || undefined, jobId: filterJob || undefined })
      .then((r) => setCandidates(r.data))
      .catch(() => toast.error("Failed to load candidates"));

  useEffect(() => {
    Promise.all([
      fetchCandidates(),
      jobAPI.getAll().then((r) => setJobs(r.data)),
      vendorAPI.getAll().then((r) => setVendors(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCandidates(); }, [filterStatus, filterJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      if (resumeFile) fd.append("resume", resumeFile);
      await candidateAPI.create(fd);
      toast.success("Candidate submitted!");
      setShowForm(false);
      setForm(emptyForm);
      setResumeFile(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await candidateAPI.updateStatus(id, { status });
      toast.success(`Status → ${status}`);
      fetchCandidates();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    try {
      await candidateAPI.delete(id);
      toast.success("Deleted");
      fetchCandidates();
    } catch { toast.error("Delete failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Candidates</h1>
          <p className="page-sub">{candidates.length} total</p>
        </div>
        {(canManage || isVendor) && (
          <button id="add-candidate-btn" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "➕ Add Candidate"}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-auto min-w-[140px]" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-auto min-w-[180px]" value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
          <option value="">All Jobs</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card">
          <h2 className="text-white font-semibold text-lg mb-5">Submit Candidate</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Job *</label>
              <select className="input" required value={form.jobId}
                onChange={(e) => setForm({ ...form, jobId: e.target.value })}>
                <option value="">Select job</option>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
            {!isVendor && (
              <div>
                <label className="label">Vendor</label>
                <select className="input" value={form.vendorId}
                  onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
                  <option value="">Select vendor</option>
                  {vendors.map((v) => <option key={v._id} value={v._id}>{v.name} — {v.company}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label">Experience (years)</label>
              <input type="number" className="input" min={0} value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div>
              <label className="label">Notice Period (days)</label>
              <input type="number" className="input" min={0} value={form.noticePeriod}
                onChange={(e) => setForm({ ...form, noticePeriod: e.target.value })} />
            </div>
            <div>
              <label className="label">Current CTC (₹)</label>
              <input type="number" className="input" value={form.currentSalary}
                onChange={(e) => setForm({ ...form, currentSalary: e.target.value })} />
            </div>
            <div>
              <label className="label">Expected CTC (₹)</label>
              <input type="number" className="input" value={form.expectedSalary}
                onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} />
            </div>
            <div>
              <label className="label">Source</label>
              <select className="input" value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Skills (comma separated)</label>
              <input className="input" placeholder="React, Node.js, MongoDB" value={form.skillsTags}
                onChange={(e) => setForm({ ...form, skillsTags: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Resume (PDF, max 5MB)</label>
              <input type="file" accept=".pdf"
                className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                onChange={(e) => setResumeFile(e.target.files[0])} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none min-h-[60px]" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Candidate"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Candidates table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="table-header">Candidate</th>
                <th className="table-header">Job</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Exp / Notice</th>
                <th className="table-header">CTC</th>
                <th className="table-header">Skills</th>
                <th className="table-header">Status</th>
                <th className="table-header">Resume</th>
                {(canManage) && <th className="table-header text-right pr-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {candidates.map((c) => (
                <tr key={c._id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-slate-400 text-xs">{c.email}</p>
                    {c.phone && <p className="text-slate-500 text-xs">{c.phone}</p>}
                  </td>
                  <td className="table-cell text-slate-300">{c.jobId?.title || "—"}</td>
                  <td className="table-cell text-slate-400">{c.vendorId?.name || "—"}</td>
                  <td className="table-cell">
                    <p className="text-slate-300">{c.experience}y exp</p>
                    <p className="text-slate-400 text-xs">{c.noticePeriod}d notice</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-slate-300 text-xs">Current: ₹{Number(c.currentSalary).toLocaleString("en-IN")}</p>
                    <p className="text-slate-400 text-xs">Exp: ₹{Number(c.expectedSalary).toLocaleString("en-IN")}</p>
                  </td>
                  <td className="table-cell max-w-[120px]">
                    <div className="flex flex-wrap gap-1">
                      {c.skillsTags?.slice(0, 3).map((s) => (
                        <span key={s} className="bg-slate-600/60 text-slate-300 text-xs px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    {canManage ? (
                      <select value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none bg-transparent ${statusColor[c.status]}`}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`badge px-2 py-0.5 rounded-md text-xs font-semibold ${statusColor[c.status]}`}>{c.status}</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {c.resumeUrl ? (
                      <a href={`http://localhost:5000${c.resumeUrl}`} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline">📄 View</a>
                    ) : c.resumeLink ? (
                      <a href={c.resumeLink} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-xs underline">🔗 Link</a>
                    ) : <span className="text-slate-500 text-xs">—</span>}
                  </td>
                  {canManage && (
                    <td className="table-cell text-right pr-4">
                      <button className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                        onClick={() => handleDelete(c._id)}>🗑</button>
                    </td>
                  )}
                </tr>
              ))}
              {!candidates.length && (
                <tr><td colSpan={9} className="text-center text-slate-500 py-12">No candidates found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;

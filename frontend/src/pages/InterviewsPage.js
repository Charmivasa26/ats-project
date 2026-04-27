import React, { useEffect, useState } from "react";
import { interviewAPI, candidateAPI, jobAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const DECISIONS = ["Pending", "Selected", "Rejected", "On-Hold"];
const MODES     = ["Online", "In-Person", "Phone"];

const decisionColor = {
  Pending:   "bg-yellow-500/20 text-yellow-300",
  Selected:  "bg-emerald-500/20 text-emerald-300",
  Rejected:  "bg-red-500/20 text-red-300",
  "On-Hold": "bg-slate-500/20 text-slate-300",
};

const InterviewsPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews]   = useState([]);
  const [candidates, setCandidates]   = useState([]);
  const [jobs, setJobs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [feedbackId, setFeedbackId]   = useState(null);
  const [feedbackData, setFeedbackData] = useState({ feedback: "", rating: "", decision: "Pending" });
  const [form, setForm]               = useState({ candidateId: "", jobId: "", interviewerId: "", date: "", mode: "Online", round: 1 });
  const [submitting, setSubmitting]   = useState(false);

  const canSchedule = ["Admin","HR"].includes(user?.role);

  const fetchAll = () =>
    interviewAPI.getAll().then((r) => setInterviews(r.data)).catch(() => toast.error("Failed to load interviews"));

  useEffect(() => {
    Promise.all([
      fetchAll(),
      candidateAPI.getAll().then((r) => setCandidates(r.data)),
      jobAPI.getAll().then((r) => setJobs(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await interviewAPI.create({ ...form, interviewerId: user._id });
      toast.success("Interview scheduled!");
      setShowForm(false);
      setForm({ candidateId: "", jobId: "", interviewerId: "", date: "", mode: "Online", round: 1 });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (id) => {
    try {
      await interviewAPI.update(id, { ...feedbackData, rating: Number(feedbackData.rating) || null });
      toast.success("Feedback submitted!");
      setFeedbackId(null);
      fetchAll();
    } catch { toast.error("Update failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Interviews</h1>
          <p className="page-sub">{interviews.length} scheduled</p>
        </div>
        {canSchedule && (
          <button id="schedule-interview-btn" className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "📅 Schedule Interview"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-white font-semibold mb-5">Schedule Interview</h2>
          <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Candidate *</label>
              <select className="input" required value={form.candidateId}
                onChange={(e) => setForm({ ...form, candidateId: e.target.value })}>
                <option value="">Select candidate</option>
                {candidates.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.email}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job *</label>
              <select className="input" required value={form.jobId}
                onChange={(e) => setForm({ ...form, jobId: e.target.value })}>
                <option value="">Select job</option>
                {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date & Time *</label>
              <input type="datetime-local" className="input" required value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Mode</label>
              <select className="input" value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Round #</label>
              <input type="number" className="input" min={1} value={form.round}
                onChange={(e) => setForm({ ...form, round: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interviews list */}
      <div className="space-y-3">
        {interviews.map((iv) => (
          <div key={iv._id} className="card">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold">{iv.candidateId?.name || "—"}</p>
                  <span className="text-slate-500 text-xs">for</span>
                  <p className="text-blue-400 text-sm">{iv.jobId?.title || "—"}</p>
                  <span className={`badge px-2 py-0.5 rounded-md text-xs font-semibold ${decisionColor[iv.decision]}`}>{iv.decision}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>📅 {new Date(iv.date).toLocaleString()}</span>
                  <span>🖥 {iv.mode}</span>
                  <span>🔁 Round {iv.round}</span>
                  <span>👤 Interviewer: {iv.interviewerId?.name || "—"}</span>
                </div>
                {iv.feedback && (
                  <p className="text-slate-300 text-sm mt-1.5 italic">"{iv.feedback}"</p>
                )}
                {iv.rating && (
                  <p className="text-amber-400 text-sm">{"★".repeat(iv.rating)}{"☆".repeat(5 - iv.rating)}</p>
                )}
              </div>
              <button
                className="btn-secondary text-sm shrink-0"
                onClick={() => {
                  setFeedbackId(feedbackId === iv._id ? null : iv._id);
                  setFeedbackData({ feedback: iv.feedback || "", rating: iv.rating || "", decision: iv.decision });
                }}>
                {feedbackId === iv._id ? "✕ Close" : "📝 Feedback"}
              </button>
            </div>

            {feedbackId === iv._id && (
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="label">Feedback</label>
                  <textarea className="input resize-none min-h-[70px]"
                    value={feedbackData.feedback}
                    onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Rating (1–5)</label>
                    <input type="number" className="input" min={1} max={5}
                      value={feedbackData.rating}
                      onChange={(e) => setFeedbackData({ ...feedbackData, rating: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Decision</label>
                    <select className="input" value={feedbackData.decision}
                      onChange={(e) => setFeedbackData({ ...feedbackData, decision: e.target.value })}>
                      {DECISIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button className="btn-primary" onClick={() => handleFeedbackSubmit(iv._id)}>
                    Save Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!interviews.length && (
          <div className="text-center text-slate-500 py-12">No interviews scheduled yet.</div>
        )}
      </div>
    </div>
  );
};

export default InterviewsPage;

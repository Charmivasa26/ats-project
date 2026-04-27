import React, { useEffect, useState } from "react";
import { vendorAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const emptyForm = {
  name: "", company: "", email: "", phone: "",
  profileDetails: "", website: "", specializations: "",
};

const VendorsPage = () => {
  const { user } = useAuth();
  const [vendors, setVendors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const canManage = ["Admin","HR"].includes(user?.role);

  const fetchVendors = () =>
    vendorAPI.getAll().then((r) => setVendors(r.data)).catch(() => toast.error("Failed to load vendors"));

  useEffect(() => { fetchVendors().finally(() => setLoading(false)); }, []);

  const openEdit = (v) => {
    setEditVendor(v);
    setForm({
      name: v.name, company: v.company, email: v.email, phone: v.phone || "",
      profileDetails: v.profileDetails || "", website: v.website || "",
      specializations: v.specializations?.join(", ") || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editVendor) {
        await vendorAPI.update(editVendor._id, form);
        toast.success("Vendor updated!");
      } else {
        await vendorAPI.create(form);
        toast.success("Vendor created!");
      }
      setShowForm(false);
      setEditVendor(null);
      setForm(emptyForm);
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      await vendorAPI.delete(id);
      toast.success("Vendor deleted");
      fetchVendors();
    } catch { toast.error("Delete failed"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-sub">{vendors.length} vendors registered</p>
        </div>
        {canManage && (
          <button id="add-vendor-btn" className="btn-primary" onClick={() => { setShowForm(!showForm); setEditVendor(null); setForm(emptyForm); }}>
            {showForm && !editVendor ? "✕ Cancel" : "➕ Add Vendor"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-white font-semibold text-lg mb-5">{editVendor ? "Edit Vendor" : "Add New Vendor"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name *</label>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Company *</label>
              <input className="input" required value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })} />
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
              <label className="label">Website</label>
              <input className="input" placeholder="https://..." value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div>
              <label className="label">Specializations (comma separated)</label>
              <input className="input" placeholder="React, Python, DevOps" value={form.specializations}
                onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Profile Details</label>
              <textarea className="input resize-none min-h-[70px]" value={form.profileDetails}
                onChange={(e) => setForm({ ...form, profileDetails: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditVendor(null); }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editVendor ? "Update Vendor" : "Create Vendor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vendor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div key={v._id} className="card hover:border-slate-600 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                  {v.company[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{v.name}</p>
                  <p className="text-slate-400 text-xs">{v.company}</p>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-2 py-1 rounded"
                    onClick={() => openEdit(v)}>✏️</button>
                  <button className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-1 rounded"
                    onClick={() => handleDelete(v._id)}>🗑</button>
                </div>
              )}
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>✉️ {v.email}</p>
              {v.phone && <p>📞 {v.phone}</p>}
              {v.website && <p className="truncate">🌐 {v.website}</p>}
            </div>
            {/* Performance metrics */}
            <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-amber-400 text-sm font-bold">{"★".repeat(Math.round(v.rating || 0))}</p>
                <p className="text-slate-500 text-xs">Rating</p>
              </div>
              <div>
                <p className="text-white font-bold">{v.closuresCount}</p>
                <p className="text-slate-500 text-xs">Closures</p>
              </div>
              <div>
                <p className="text-white font-bold">{v.totalSubmissions}</p>
                <p className="text-slate-500 text-xs">Submissions</p>
              </div>
            </div>
            {v.specializations?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {v.specializations.slice(0, 4).map((s) => (
                  <span key={s} className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {!vendors.length && (
          <div className="md:col-span-3 text-center text-slate-500 py-12">No vendors registered yet.</div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;

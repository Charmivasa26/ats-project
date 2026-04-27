import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ROLES = ["Admin", "HR", "Vendor", "HiringManager"];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "HR" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">A</div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 mt-2">Join the ATS platform</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input id="reg-name" type="text" className="input" placeholder="John Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input id="reg-email" type="email" className="input" placeholder="john@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="reg-password" type="password" className="input" placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="label">Role</label>
              <select id="reg-role" className="input"
                value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button id="reg-submit" type="submit" disabled={loading}
              className="btn-success w-full justify-center py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

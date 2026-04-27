import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/25">A</div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your ATS account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input id="login-email" type="email" className="input" placeholder="admin@company.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="login-password" type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button id="login-submit" type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Register
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Demo credentials:</p>
            <p>Register as <span className="text-purple-300">Admin</span> first, then create other users.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

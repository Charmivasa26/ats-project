import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard":  "Dashboard",
  "/jobs":       "Job Requisitions",
  "/candidates": "Candidates",
  "/pipeline":   "Candidate Pipeline",
  "/interviews": "Interviews",
  "/vendors":    "Vendor Management",
};

const roleBg = {
  Admin:         "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  HR:            "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Vendor:        "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  HiringManager: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

const Navbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || "ATS Portal";

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/60 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className={`badge text-xs px-2.5 py-1 rounded-full font-semibold ${roleBg[user?.role]}`}>
          {user?.role}
        </span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="text-slate-300 text-sm font-medium hidden sm:block">{user?.name}</span>
      </div>
    </header>
  );
};

export default Navbar;

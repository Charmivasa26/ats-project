import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/dashboard",    label: "Dashboard",   icon: "📊", roles: ["Admin","HR","Vendor","HiringManager"] },
  { to: "/jobs",         label: "Jobs",         icon: "💼", roles: ["Admin","HR","HiringManager","Vendor"] },
  { to: "/candidates",   label: "Candidates",   icon: "👤", roles: ["Admin","HR","Vendor"] },
  { to: "/pipeline",     label: "Pipeline",     icon: "🔀", roles: ["Admin","HR","HiringManager"] },
  { to: "/interviews",   label: "Interviews",   icon: "📅", roles: ["Admin","HR","HiringManager"] },
  { to: "/vendors",      label: "Vendors",      icon: "🏢", roles: ["Admin","HR"] },
];

const roleBadgeColor = {
  Admin:          "bg-purple-500/20 text-purple-300",
  HR:             "bg-blue-500/20 text-blue-300",
  Vendor:         "bg-amber-500/20 text-amber-300",
  HiringManager:  "bg-emerald-500/20 text-emerald-300",
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const visible = NAV.filter((n) => n.roles.includes(user?.role));

  return (
    <aside className={`h-screen bg-slate-900 border-r border-slate-700/60 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"} fixed top-0 left-0 z-40`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">A</div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">ATS Portal</p>
            <p className="text-slate-400 text-xs truncate">Mekanism Technologies</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-400 hover:text-white transition-colors shrink-0">
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {visible.map(({ to, label, icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
               ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`
            }
            title={label}
          >
            <span className="text-base shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-700/60 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <span className={`badge text-xs ${roleBadgeColor[user?.role]}`}>{user?.role}</span>
            </div>
          )}
          <button onClick={handleLogout} title="Logout"
            className="text-slate-400 hover:text-red-400 transition-colors shrink-0 text-lg">⏻</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"}`}>
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

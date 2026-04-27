import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./dashboards/AdminDashboard";
import HRDashboard from "./dashboards/HRDashboard";
import VendorDashboard from "./dashboards/VendorDashboard";

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === "Admin") return <AdminDashboard />;
  if (user?.role === "HR")    return <HRDashboard />;
  if (user?.role === "Vendor") return <VendorDashboard />;

  // HiringManager fallback
  return <HRDashboard />;
};

export default DashboardPage;

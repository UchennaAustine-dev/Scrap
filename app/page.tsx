"use client";

import { LoginScreen } from "@/components/auth/login-screen";
import { Dashboard } from "@/components/dashboard/dashboard";
import DataExplorer from "@/components/data/data-explorer";
// import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ScraperControl } from "@/components/scraper/scraper-control";
import { UserManagement } from "@/components/user/user-management";
import { getPageTitle } from "@/lib/utils";
import React, { useState } from "react";

import { toast } from "sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab("dashboard");
    toast.success("Login successful! Welcome back.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab("login");
    toast.info("Logged out successfully");
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "data-search":
        return <DataExplorer />;
      case "scraper-control":
        return <ScraperControl />;
      case "user-management":
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar currentPage={activeTab} onPageChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* <Header title={getPageTitle(activeTab)} /> */}

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

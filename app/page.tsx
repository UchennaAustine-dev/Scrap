"use client";

import { LoginScreen } from "@/components/auth/login-screen";
import { Dashboard } from "@/components/dashboard/dashboard";
import DataExplorer from "@/components/data/data-explorer";
// import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ScraperControl } from "@/components/scraper/scraper-control";
import { UserManagement } from "@/components/user/user-management";
import StatusPage from "./status/page";
import React, { useState, useCallback } from "react";

import { toast } from "sonner";

export default function Home() {
  const [activeTab, setActiveTab] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setActiveTab("dashboard");
    toast.success("Login successful! Welcome back.");
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setActiveTab("login");
    toast.info("Logged out successfully");
  }, []);

  const handlePageChange = useCallback((page: string) => {
    console.log("[Home] Page change requested:", page);
    setActiveTab(page);
    console.log("[Home] Active tab set to:", page);
  }, []);

  // Move renderContent before conditional return to maintain hook order
  const renderContent = useCallback(() => {
    console.log("[Home] Rendering content for activeTab:", activeTab);
    switch (activeTab) {
      case "dashboard":
        console.log("[Home] Rendering Dashboard");
        return <Dashboard />;
      case "data":
        console.log("[Home] Rendering DataExplorer");
        return <DataExplorer />;
      case "scraper":
        console.log("[Home] Rendering ScraperControl");
        return <ScraperControl />;
      case "status":
        console.log("[Home] Rendering StatusPage");
        return <StatusPage />;
      case "users":
        console.log("[Home] Rendering UserManagement");
        return <UserManagement />;
      default:
        console.log("[Home] Rendering Dashboard (default)");
        return <Dashboard />;
    }
  }, [activeTab]);

  // Conditional return after all hooks
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar
        currentPage={activeTab}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* <Header title={getPageTitle(activeTab)} /> */}

        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

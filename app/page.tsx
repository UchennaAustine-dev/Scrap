"use client";
import React, { useState, useCallback } from "react";
import { LoginScreen } from "@/components/auth/login-screen";
import { Dashboard } from "@/components/dashboard/dashboard";
import DataExplorer from "@/components/data/data-explorer";
// import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ScraperControl } from "@/components/scraper/scraper-control";
import { UserManagement } from "@/components/user/user-management";
import StatusPage from "./status/page";
import { toast } from "sonner";

// Dynamic import helper for new pages
const DynamicPage = ({ page }: { page: string }) => {
  const PageComponent = React.lazy(() => import(`./${page}/page`));
  return <PageComponent />;
};

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
        return <Dashboard />;
      case "data":
        return <DataExplorer />;
      case "scraper":
        return <ScraperControl />;
      case "status":
        return <StatusPage />;
      case "users":
        return <UserManagement />;
      case "rate-limit":
      case "price-intelligence":
      case "market-trends":
      case "search":
      case "saved-searches":
      case "export":
      case "firestore":
      case "github":
      case "duplicates":
      case "quality":
      case "schedule":
      case "health":
      case "email":
      case "alerts":
      case "top-performers":
      case "site-health":
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DynamicPage page={activeTab} />
          </React.Suspense>
        );
      default:
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

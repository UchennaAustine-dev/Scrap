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
  const PageComponent = React.lazy(() =>
    import(`./${page}/page`).catch((err) => {
      console.error(`Failed to load page: ${page}`, err);
      return {
        default: () => (
          <div className="p-8 text-white">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p>Could not load page: {page}</p>
          </div>
        ),
      };
    })
  );
  return <PageComponent />;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug: Track activeTab changes
  React.useEffect(() => {
    console.log("[Home] activeTab changed to:", activeTab);
  }, [activeTab]);

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
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="rate-limit" />
          </React.Suspense>
        );
      case "price-intelligence":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="price-intelligence" />
          </React.Suspense>
        );
      case "market-trends":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="market-trends" />
          </React.Suspense>
        );
      case "search":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="search" />
          </React.Suspense>
        );
      case "saved-searches":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="saved-searches" />
          </React.Suspense>
        );
      case "export":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="export" />
          </React.Suspense>
        );
      case "firestore":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="firestore" />
          </React.Suspense>
        );
      case "github":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="github" />
          </React.Suspense>
        );
      case "duplicates":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="duplicates" />
          </React.Suspense>
        );
      case "quality":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="quality" />
          </React.Suspense>
        );
      case "schedule":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="schedule" />
          </React.Suspense>
        );
      case "health":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="health" />
          </React.Suspense>
        );
      case "email":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="email" />
          </React.Suspense>
        );
      case "alerts":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="alerts" />
          </React.Suspense>
        );
      case "top-performers":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="top-performers" />
          </React.Suspense>
        );
      case "site-health":
        return (
          <React.Suspense
            fallback={<div className="p-8 text-white">Loading...</div>}
          >
            <DynamicPage page="site-health" />
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

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 overflow-auto bg-slate-900" key={activeTab}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

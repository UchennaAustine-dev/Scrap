"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "./stats-card";
import { RecentActivity } from "./recent-activity";
import { TopSites } from "./top-sites";
import { TrendsChart } from "./trends-chart";
import { SiteStatistics } from "./site-statistics";
import { useApi, usePolling } from "@/lib/hooks/useApi";
import { useCallback } from "react";
import { statsApi, scrapeApi, sitesApi } from "@/lib/api";
import { StatsResponse, ScrapeStatus, SiteListResponse } from "@/lib/types";
import { toast } from "sonner";

export function DashboardOverview() {
  // Get stats data
  const { data: stats, refetch: refetchStats } = useApi<StatsResponse>(() =>
    statsApi.getOverview()
  );

  // Poll for scraper status with stable function reference
  const getScrapeStatus = useCallback(() => scrapeApi.status(), []);
  const { data: scrapeStatus } = usePolling<ScrapeStatus>(
    getScrapeStatus,
    10000, // Poll every 10 seconds to reduce load
    true
  );

  // Get sites data
  const { data: sitesData, refetch: refetchSites } = useApi<SiteListResponse>(
    () => sitesApi.list()
  );

  const handleRefresh = () => {
    refetchStats();
    refetchSites();
    toast.success("Dashboard refreshed");
  };

  const activeScrapers = scrapeStatus?.is_running ? 1 : 0;
  const totalRecords = stats?.total_listings || 0;
  const recentRuns = stats?.recent_runs || 0;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Scrapers"
          value={activeScrapers.toString()}
          description="Currently running"
        />
        <StatsCard
          title="Total Data Records"
          value={totalRecords.toLocaleString()}
          description="Scraped this month"
        />
        <StatsCard
          title="Recent Runs (24h)"
          value={recentRuns.toString()}
          description="Successful completions"
        />
      </div>

      {/* Activity & Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentActivity scrapeStatus={scrapeStatus || undefined} />
        <TrendsChart />
      </div>

      {/* Top Sites & Site Statistics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopSites sitesData={sitesData || undefined} />
        <SiteStatistics />
      </div>
    </div>
  );
}

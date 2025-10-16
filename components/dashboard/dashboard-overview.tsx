"use client";

import { StatsCard } from "./stats-card";
import { RecentActivity } from "./recent-activity";
import { TopSites } from "./top-sites";
import { useApi, usePolling } from "@/lib/hooks/useApi";
import { useCallback } from "react";
import { statsApi, scrapeApi, sitesApi } from "@/lib/api";
import { StatsResponse, ScrapeStatus, SiteListResponse } from "@/lib/types";

export function DashboardOverview() {
  // Get stats data
  const { data: stats } = useApi<StatsResponse>(() => statsApi.getOverview());

  // Poll for scraper status with stable function reference
  const getScrapeStatus = useCallback(() => scrapeApi.status(), []);
  const { data: scrapeStatus } = usePolling<ScrapeStatus>(
    getScrapeStatus,
    10000, // Poll every 10 seconds to reduce load
    true
  );

  // Get sites data
  const { data: sitesData } = useApi<SiteListResponse>(() => sitesApi.list());

  const activeScrapers = scrapeStatus?.is_running ? 1 : 0;
  const totalRecords = stats?.total_listings || 0;
  const recentRuns = stats?.recent_runs || 0;

  return (
    <div className="space-y-6">
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

      {/* Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentActivity scrapeStatus={scrapeStatus || undefined} />
        <TopSites sitesData={sitesData || undefined} />
      </div>
    </div>
  );
}

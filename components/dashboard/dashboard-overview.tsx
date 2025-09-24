"use client";

import { StatsCard } from "./stats-card";
import { RecentActivity } from "./recent-activity";
import { TopSites } from "./top-sites";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Active Scrapers"
          value="5"
          description="Currently running"
        />
        <StatsCard
          title="Total Data Records"
          value="12,345"
          description="Scraped this month"
        />
        <StatsCard
          title="Recent Runs (24h)"
          value="20"
          description="Successful completions"
        />
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentActivity />
        <TopSites />
      </div>
    </div>
  );
}

"use client";

import { formatNumber } from "@/lib/utils";
import { SiteListResponse } from "@/lib/types";

interface TopSitesProps {
  sitesData?: SiteListResponse;
}

export function TopSites({ sitesData }: TopSitesProps) {
  // Create top sites from sites data
  const topSites =
    sitesData?.sites
      .filter((site) => site.enabled)
      .map((site) => ({
        id: site.site_key,
        site: site.name,
        scraper: site.parser,
        records: Math.floor(Math.random() * 5000) + 100, // Mock records count
      }))
      .sort((a, b) => b.records - a.records)
      .slice(0, 5) || [];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          Top Performing Sites
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm font-medium text-slate-400 pb-2 border-b border-slate-700">
            <span>Site</span>
            <span>Parser</span>
            <span>Records</span>
          </div>

          {topSites.length > 0 ? (
            topSites.map((site) => (
              <div key={site.id} className="grid grid-cols-3 gap-4 text-sm">
                <span className="text-slate-300">{site.site}</span>
                <span className="text-slate-300">{site.scraper}</span>
                <span className="text-slate-300 font-medium">
                  {formatNumber(site.records)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-center py-4">
              No sites configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { mockTopSites } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";

export function TopSites() {
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
            <span>Scraper</span>
            <span>Records</span>
          </div>

          {mockTopSites.map((site) => (
            <div key={site.id} className="grid grid-cols-3 gap-4 text-sm">
              <span className="text-slate-300">{site.site}</span>
              <span className="text-slate-300">{site.scraper}</span>
              <span className="text-slate-300 font-medium">
                {formatNumber(site.records)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

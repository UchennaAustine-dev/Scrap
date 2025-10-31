"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { SiteStats } from "@/lib/types";

export default function TopPerformersPage() {
  const [sites, setSites] = useState<SiteStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .topPerformers()
      .then((res: SiteStats[]) => setSites(res))
      .catch((err: any) =>
        setError(err?.message || "Error fetching top performers")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Top Performing Sites</h1>
      <p className="text-slate-400 text-sm mt-1">
        Sites with highest success rates and listing counts
      </p>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {sites.length > 0 ? (
        <ul className="space-y-2">
          {sites.map((site) => (
            <li
              key={site.site_key}
              className="bg-slate-900 rounded-lg p-4 text-slate-300"
            >
              <div>
                <strong>Name:</strong> {site.name}
              </div>
              <div>
                <strong>Listings:</strong> {site.total_listings}
              </div>
              <div>
                <strong>Success Rate:</strong> {site.success_rate}%
              </div>
              {site.latest_scrape && (
                <div>
                  <strong>Latest Scrape:</strong> {site.latest_scrape}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div>No top performers found.</div>
      )}
    </div>
  );
}

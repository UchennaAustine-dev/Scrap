"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrapeStatus } from "@/lib/types";
import { Clock, CheckCircle2, XCircle, Database } from "lucide-react";

interface ScraperStatusCardProps {
  scrapeStatus: ScrapeStatus | null;
}

export function ScraperStatusCard({ scrapeStatus }: ScraperStatusCardProps) {
  if (!scrapeStatus) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Scraper Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Loading status...</p>
        </CardContent>
      </Card>
    );
  }

  // New ScrapeStatus fields
  const {
    status,
    current_site,
    sites_completed,
    sites_total,
    listings_found,
    start_time,
    estimated_completion,
    progress_percentage,
  } = scrapeStatus;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scraper Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">State:</span>
            <Badge
              variant={status === "running" ? "default" : "secondary"}
              className={
                status === "running"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : status === "completed"
                  ? "bg-green-500 hover:bg-green-600"
                  : status === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-slate-600 hover:bg-slate-700"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          {current_site && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Site:</span>
              <span className="text-slate-300 font-semibold">
                {current_site}
              </span>
            </div>
          )}
          {typeof sites_completed === "number" &&
            typeof sites_total === "number" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sites:</span>
                <span className="text-slate-300 font-semibold">
                  {sites_completed} / {sites_total}
                </span>
              </div>
            )}
          {typeof listings_found === "number" && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Listings Found:</span>
              <span className="text-blue-300 font-bold">{listings_found}</span>
            </div>
          )}
          {start_time && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Started:</span>
              <span className="text-slate-300">
                {new Date(start_time).toLocaleString()}
              </span>
            </div>
          )}
          {estimated_completion && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Estimated Completion:</span>
              <span className="text-slate-300">{estimated_completion}</span>
            </div>
          )}
          {typeof progress_percentage === "number" && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Progress:</span>
              <span className="text-green-300 font-bold">
                {progress_percentage}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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

  const { is_running, current_run, last_run, site_metadata } = scrapeStatus;

  // Calculate duration for last run
  const getRunDuration = (started: string, completed: string) => {
    const start = new Date(started).getTime();
    const end = new Date(completed).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">State:</span>
              <Badge
                variant={is_running ? "default" : "secondary"}
                className={
                  is_running
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-slate-600 hover:bg-slate-700"
                }
              >
                {is_running ? "Running" : "Idle"}
              </Badge>
            </div>

            {current_run && (
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <p className="text-sm text-slate-400">Current Run Details:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Run ID:</span>
                    <span className="ml-2 text-slate-300">
                      {current_run.run_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">PID:</span>
                    <span className="ml-2 text-slate-300">
                      {current_run.pid}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Sites:</span>
                    <span className="ml-2 text-slate-300">
                      {Array.isArray(current_run.sites)
                        ? current_run.sites.join(", ")
                        : current_run.sites}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Started:</span>
                    <span className="ml-2 text-slate-300">
                      {new Date(current_run.started_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Run */}
      {last_run && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              {last_run.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Last Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                <Badge
                  variant={last_run.success ? "default" : "destructive"}
                  className={
                    last_run.success
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {last_run.success ? "Success" : "Failed"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Run ID:</span>
                  <p className="text-slate-300 mt-1">{last_run.run_id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Duration:</span>
                  <p className="text-slate-300 mt-1">
                    {getRunDuration(last_run.started_at, last_run.completed_at)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">PID:</span>
                  <p className="text-slate-300 mt-1">{last_run.pid}</p>
                </div>
                <div>
                  <span className="text-slate-500">Return Code:</span>
                  <p className="text-slate-300 mt-1">{last_run.return_code}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Sites:</span>
                  <p className="text-slate-300 mt-1">
                    {Array.isArray(last_run.sites)
                      ? last_run.sites.join(", ")
                      : last_run.sites}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Started:</span>
                  <p className="text-slate-300 mt-1">
                    {new Date(last_run.started_at).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Completed:</span>
                  <p className="text-slate-300 mt-1">
                    {new Date(last_run.completed_at).toLocaleString()}
                  </p>
                </div>
                {last_run.max_pages && (
                  <div>
                    <span className="text-slate-500">Max Pages:</span>
                    <p className="text-slate-300 mt-1">{last_run.max_pages}</p>
                  </div>
                )}
                {last_run.geocoding !== null &&
                  last_run.geocoding !== undefined && (
                    <div>
                      <span className="text-slate-500">Geocoding:</span>
                      <p className="text-slate-300 mt-1">
                        {last_run.geocoding ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site Metadata */}
      {site_metadata && Object.keys(site_metadata).length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Site Metadata ({Object.keys(site_metadata).length} sites)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(site_metadata).map(([siteName, metadata]) => (
                <div
                  key={siteName}
                  className="p-3 rounded-lg bg-slate-900/50 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-200">{siteName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {metadata.total_scrapes} scrape
                      {metadata.total_scrapes !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400">
                    Last scraped:{" "}
                    <span className="text-slate-300">
                      {new Date(metadata.last_scrape).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

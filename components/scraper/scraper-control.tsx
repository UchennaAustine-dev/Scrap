"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Square, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteConfiguration } from "./site-configuration";
import { GlobalParameters } from "./global-parameters";
import { RunConsole } from "./run-console";
import { NotificationsAlerts } from "./notifications-alerts";
import { AddSiteModal } from "./add-site-modal";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { usePolling } from "@/lib/hooks/useApi";
import { ScrapeStatus } from "@/lib/types";

export function ScraperControl() {
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [maxPages, setMaxPages] = useState<number | undefined>();
  const [geocoding, setGeocoding] = useState<boolean | undefined>();
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeComplete, setScrapeComplete] = useState(false);

  // Poll for scraper status with stable function reference
  const getScrapeStatus = useCallback(() => apiClient.getScrapeStatus(), []);
  const { data: scrapeStatus } = usePolling<ScrapeStatus>(
    getScrapeStatus,
    5000,
    true
  );

  const isRunning = scrapeStatus?.status === "running";

  // Track previous running state to detect completion
  const previousStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (
      previousStatusRef.current === "running" &&
      scrapeStatus?.status !== "running"
    ) {
      toast.success("Scrape completed", {
        description: `Total listings found: ${
          scrapeStatus?.listings_found ?? 0
        }`,
        duration: 4000,
      });
      setScrapeComplete(true);
    }
    previousStatusRef.current = scrapeStatus?.status;
  }, [scrapeStatus]);

  console.log("[ScraperControl] Component mounted/updated");
  if (scrapeStatus) {
    console.log(
      "[ScraperControl] Scraper status:",
      JSON.stringify(scrapeStatus, null, 2)
    );
  } else {
    console.log("[ScraperControl] Scraper status: null");
  }

  const handleRunScraper = async () => {
    console.log(
      "[ScraperControl] handleRunScraper called, isRunning:",
      isRunning
    );
    setScrapeError(null);
    setScrapeComplete(false);
    setScrapeLoading(true);
    try {
      if (isRunning) {
        console.log("[ScraperControl] Stopping scraper...");
        await apiClient.stopScrape();
        toast.success("Scraper stopped successfully");
        setScrapeLoading(false);
        setScrapeComplete(true);
      } else {
        const params: {
          sites?: string[];
          max_pages?: number;
          geocode?: boolean;
        } = {};
        if (selectedSites.length > 0) params.sites = selectedSites;
        if (maxPages !== undefined) params.max_pages = maxPages;
        if (geocoding !== undefined) params.geocode = geocoding;

        console.log("[ScraperControl] Starting scraper with params:", params);
        await apiClient.startScrape(params);
        toast.success("Scraper started successfully");
        // Poll for completion
        let pollCount = 0;
        let running = true;
        while (running && pollCount < 60) {
          // up to 5 min
          await new Promise((res) => setTimeout(res, 5000));
          const status = await apiClient.getScrapeStatus();
          running = status?.status === "running";
          pollCount++;
        }
        setScrapeLoading(false);
        setScrapeComplete(true);
      }
    } catch (error) {
      console.error("[ScraperControl] Failed to control scraper:", error);
      setScrapeError(
        error instanceof Error ? error.message : "Failed to control scraper"
      );
      setScrapeLoading(false);
      toast.error(
        error instanceof Error ? error.message : "Failed to control scraper"
      );
    }
  };

  const handleScheduleRuns = () => {
    toast.info("Schedule configuration opened");
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Scraper Control
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure and manage your web scrapers
          </p>
        </div>
      </div>

      {/* Scraper Status Banner */}
      {scrapeStatus && (
        <div
          className={`border rounded-lg p-4 ${
            isRunning
              ? "bg-blue-500/10 border-blue-500/30"
              : scrapeStatus.status === "completed"
              ? "bg-green-500/10 border-green-500/30"
              : scrapeStatus.status === "error"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-slate-700/10 border-slate-700/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div
                className={`w-3 h-3 rounded-full ${
                  isRunning
                    ? "bg-blue-500 animate-pulse"
                    : scrapeStatus.status === "completed"
                    ? "bg-green-500"
                    : scrapeStatus.status === "error"
                    ? "bg-red-500"
                    : "bg-slate-500"
                }`}
              ></div>
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  isRunning
                    ? "text-blue-400"
                    : scrapeStatus.status === "completed"
                    ? "text-green-400"
                    : scrapeStatus.status === "error"
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                Status:{" "}
                {scrapeStatus.status.charAt(0).toUpperCase() +
                  scrapeStatus.status.slice(1)}
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate-300">
                {scrapeStatus.current_site && (
                  <p>Current Site: {scrapeStatus.current_site}</p>
                )}
                {typeof scrapeStatus.sites_completed === "number" &&
                  typeof scrapeStatus.sites_total === "number" && (
                    <p>
                      Sites: {scrapeStatus.sites_completed} /{" "}
                      {scrapeStatus.sites_total}
                    </p>
                  )}
                {typeof scrapeStatus.listings_found === "number" && (
                  <p>Listings Found: {scrapeStatus.listings_found}</p>
                )}
                {scrapeStatus.start_time && (
                  <p>
                    Started:{" "}
                    {new Date(scrapeStatus.start_time).toLocaleString()}
                  </p>
                )}
                {scrapeStatus.estimated_completion && (
                  <p>
                    Estimated Completion: {scrapeStatus.estimated_completion}
                  </p>
                )}
                {typeof scrapeStatus.progress_percentage === "number" && (
                  <p>Progress: {scrapeStatus.progress_percentage}%</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons & Scrape Status */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleRunScraper}
          disabled={scrapeLoading}
          className={`flex items-center justify-center space-x-2 w-full sm:w-auto ${
            isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {scrapeLoading ? (
            <span className="animate-spin mr-2 w-4 h-4 border-b-2 border-white rounded-full"></span>
          ) : isRunning ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="text-sm sm:text-base">
            {scrapeLoading
              ? "Running..."
              : isRunning
              ? "Stop / Abort Run"
              : "Run Scraper Now"}
          </span>
        </Button>

        <Button
          onClick={handleScheduleRuns}
          variant="outline"
          className="flex items-center justify-center space-x-2 w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm sm:text-base">Schedule Runs</span>
        </Button>
      </div>
      {/* Scrape Status Feedback */}
      {(scrapeLoading || scrapeComplete || scrapeError) && (
        <div className="mt-2">
          {scrapeLoading && (
            <div className="text-blue-400 flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-b-2 border-blue-400 rounded-full"></span>
              <span>Scraping in progress...</span>
            </div>
          )}
          {scrapeComplete && !scrapeError && (
            <div className="text-green-400">Scraping complete!</div>
          )}
          {scrapeError && (
            <div className="text-red-400">Error: {scrapeError}</div>
          )}
        </div>
      )}

      {/* Site Configuration */}
      <SiteConfiguration
        onAddSite={() => setShowAddSiteModal(true)}
        selectedSites={selectedSites}
        onSelectedSitesChange={setSelectedSites}
      />

      {/* Global Parameters */}
      <GlobalParameters
        maxPages={maxPages}
        onMaxPagesChange={setMaxPages}
        geocoding={geocoding}
        onGeocodingChange={setGeocoding}
      />

      {/* Run Console & Logs */}
      <RunConsole isRunning={isRunning} />

      {/* Notifications & Alerts */}
      <NotificationsAlerts />

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={showAddSiteModal}
        onClose={() => setShowAddSiteModal(false)}
      />
    </div>
  );
}

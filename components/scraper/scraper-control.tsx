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
import { scrapeApi } from "@/lib/api";
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
  const getScrapeStatus = useCallback(() => scrapeApi.status(), []);
  const { data: scrapeStatus } = usePolling<ScrapeStatus>(
    getScrapeStatus,
    5000, // Poll every 5 seconds to reduce load
    true
  );

  const isRunning = scrapeStatus?.is_running || false;

  // Track previous running state to detect completion
  const previousIsRunningRef = useRef<boolean>(false);
  const hasShownToastRef = useRef<boolean>(false);

  // Detect scrape completion and show master workbook generation status
  useEffect(() => {
    // Only trigger if transitioning from running to not running
    if (
      previousIsRunningRef.current &&
      !isRunning &&
      !hasShownToastRef.current
    ) {
      const lastRun = scrapeStatus?.last_run;

      if (lastRun) {
        // Show master workbook generation status
        if (lastRun.master_workbook_generated) {
          toast.success("✅ Master workbook generated successfully", {
            description: "All scraped data has been consolidated",
            duration: 5000,
          });
        } else if (lastRun.master_workbook_error) {
          toast.error("❌ Master workbook generation failed", {
            description: lastRun.master_workbook_error,
            duration: 7000,
          });
        } else {
          // Scrape completed but master workbook status unknown
          toast.info("ℹ️ Scrape completed", {
            description: "Master workbook status unavailable",
            duration: 4000,
          });
        }

        hasShownToastRef.current = true;
      }
    }

    // Update previous state
    previousIsRunningRef.current = isRunning;

    // Reset toast flag when scraper starts again
    if (isRunning) {
      hasShownToastRef.current = false;
    }
  }, [isRunning, scrapeStatus]);

  console.log("[ScraperControl] Component mounted/updated");
  if (scrapeStatus) {
    console.log(
      "[ScraperControl] Scraper status:",
      JSON.stringify(scrapeStatus, null, 2)
    );
    console.log("[ScraperControl] is_running:", scrapeStatus.is_running);
    if (scrapeStatus.current_run)
      console.log(
        "[ScraperControl] current_run:",
        JSON.stringify(scrapeStatus.current_run, null, 2)
      );
    if (scrapeStatus.last_run)
      console.log(
        "[ScraperControl] last_run:",
        JSON.stringify(scrapeStatus.last_run, null, 2)
      );
    if (scrapeStatus.site_metadata)
      console.log(
        "[ScraperControl] site_metadata:",
        JSON.stringify(scrapeStatus.site_metadata, null, 2)
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
        await scrapeApi.stop();
        toast.success("Scraper stopped successfully");
        setScrapeLoading(false);
        setScrapeComplete(true);
      } else {
        const params: {
          sites?: string[];
          max_pages?: number;
          geocoding?: boolean;
        } = {};
        if (selectedSites.length > 0) params.sites = selectedSites;
        if (maxPages !== undefined) params.max_pages = maxPages;
        if (geocoding !== undefined) params.geocoding = geocoding;

        console.log("[ScraperControl] Starting scraper with params:", params);
        await scrapeApi.start(params);
        toast.success("Scraper started successfully");
        // Poll for completion
        let pollCount = 0;
        let running = true;
        while (running && pollCount < 60) {
          // up to 5 min
          await new Promise((res) => setTimeout(res, 5000));
          const status = await scrapeApi.status();
          running = status?.is_running;
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

      {/* Running Status Banner */}
      {isRunning && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-blue-400 font-medium">Scraper is running</p>
            <p className="text-blue-300 text-sm">
              {scrapeStatus?.current_run?.sites
                ? `Scraping: ${
                    Array.isArray(scrapeStatus.current_run.sites)
                      ? scrapeStatus.current_run.sites.join(", ")
                      : scrapeStatus.current_run.sites
                  }`
                : "Check Run Console below for live logs"}
            </p>
          </div>
          <div className="text-blue-400 text-sm">
            {scrapeStatus?.current_run?.started_at && (
              <span>
                Started{" "}
                {new Date(
                  scrapeStatus.current_run.started_at
                ).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Last Run Status Banner */}
      {!isRunning && scrapeStatus?.last_run && (
        <div
          className={`${
            scrapeStatus.last_run.success
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          } border rounded-lg p-4`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`${
                  scrapeStatus.last_run.success
                    ? "text-green-400"
                    : "text-red-400"
                } font-medium`}
              >
                Last Run:{" "}
                {scrapeStatus.last_run.success ? "Completed" : "Failed"}
              </p>
              <div className="mt-2 space-y-1 text-sm text-slate-300">
                <p>
                  Sites:{" "}
                  {Array.isArray(scrapeStatus.last_run.sites)
                    ? scrapeStatus.last_run.sites.join(", ")
                    : scrapeStatus.last_run.sites}
                </p>
                <p>
                  Started:{" "}
                  {new Date(scrapeStatus.last_run.started_at).toLocaleString()}
                </p>
                <p>
                  Completed:{" "}
                  {new Date(
                    scrapeStatus.last_run.completed_at
                  ).toLocaleString()}
                </p>
                <p>
                  Duration:{" "}
                  {Math.round(
                    (new Date(scrapeStatus.last_run.completed_at).getTime() -
                      new Date(scrapeStatus.last_run.started_at).getTime()) /
                      1000
                  )}{" "}
                  seconds
                </p>
              </div>
            </div>
            <div className="ml-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  scrapeStatus.last_run.success
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {scrapeStatus.last_run.success ? "Success" : "Failed"}
              </span>
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

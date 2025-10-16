"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Square, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteConfiguration } from "./site-configuration";
import { GlobalParameters } from "./global-parameters";
import { RunConsole } from "./run-console";
import { NotificationsAlerts } from "./notifications-alerts";
import { AddSiteModal } from "./add-site-modal";
import { toast } from "sonner";
import { scrapeApi } from "@/lib/api";
import { useApi, usePolling } from "@/lib/hooks/useApi";
import { ScrapeStatus } from "@/lib/types";

export function ScraperControl() {
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [maxPages, setMaxPages] = useState<number | undefined>();
  const [geocoding, setGeocoding] = useState<boolean | undefined>();

  // Poll for scraper status with stable function reference
  const getScrapeStatus = useCallback(() => scrapeApi.status(), []);
  const { data: scrapeStatus } = usePolling<ScrapeStatus>(
    getScrapeStatus,
    5000, // Poll every 5 seconds to reduce load
    true
  );

  const isRunning = scrapeStatus?.is_running || false;

  const handleRunScraper = async () => {
    try {
      if (isRunning) {
        await scrapeApi.stop();
        toast.success("Scraper stopped successfully");
      } else {
        const params: any = {};
        if (selectedSites.length > 0) params.sites = selectedSites;
        if (maxPages) params.max_pages = maxPages;
        if (geocoding !== undefined) params.geocoding = geocoding;

        await scrapeApi.start(params);
        toast.success("Scraper started successfully");
      }
    } catch (error) {
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

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          onClick={handleRunScraper}
          className={`flex items-center justify-center space-x-2 w-full sm:w-auto ${
            isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRunning ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="text-sm sm:text-base">
            {isRunning ? "Stop / Abort Run" : "Run Scraper Now"}
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
      <RunConsole
        isRunning={isRunning}
        scrapeStatus={scrapeStatus || undefined}
      />

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

"use client";

import { useState } from "react";
import { Play, Square, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteConfiguration } from "./site-configuration";
import { GlobalParameters } from "./global-parameters";
import { RunConsole } from "./run-console";
import { NotificationsAlerts } from "./notifications-alerts";
import { AddSiteModal } from "./add-site-modal";
import { toast } from "sonner";

export function ScraperControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);

  const handleRunScraper = () => {
    if (isRunning) {
      setIsRunning(false);
      toast.success("Scraper stopped successfully");
    } else {
      setIsRunning(true);
      toast.success("Scraper started successfully");
    }
  };

  const handleScheduleRuns = () => {
    toast.info("Schedule configuration opened");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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
      <SiteConfiguration onAddSite={() => setShowAddSiteModal(true)} />

      {/* Global Parameters */}
      <GlobalParameters />

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

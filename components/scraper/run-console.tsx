"use client";

import { useState, useEffect, useCallback } from "react";
import { logsApi, scrapeApi } from "@/lib/api";
import { useApi, usePolling } from "@/lib/hooks/useApi";
import { ScrapeStatus, LogEntry } from "@/lib/types";

interface RunConsoleProps {
  isRunning: boolean;
  scrapeStatus?: ScrapeStatus;
}

export function RunConsole({ isRunning, scrapeStatus }: RunConsoleProps) {
  const [activeTab, setActiveTab] = useState("current");

  // Poll for logs when running with stable function references
  const getCurrentLogs = useCallback(() => logsApi.getLogs({ limit: 50 }), []);
  const getErrorLogs = useCallback(() => logsApi.getErrors(20), []);

  const { data: currentLogs } = usePolling<LogEntry[]>(
    getCurrentLogs,
    5000, // Poll every 5 seconds to reduce load
    isRunning
  );

  const { data: errorLogs } = usePolling<LogEntry[]>(
    getErrorLogs,
    10000, // Poll every 10 seconds to reduce load
    isRunning
  );

  const { data: historyData } = useApi(() => scrapeApi.history(10));

  // Ensure logs are always arrays
  const currentLogsArray = Array.isArray(currentLogs)
    ? currentLogs
    : (currentLogs as any)?.logs || [];

  const errorLogsArray = Array.isArray(errorLogs)
    ? errorLogs
    : (errorLogs as any)?.logs || [];

  const formatLogEntry = (log: LogEntry) => {
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const sitePrefix = log.site_key ? `[${log.site_key}] ` : "";
    return `> [${timestamp}] ${sitePrefix}${log.message}`;
  };

  const tabs = [
    { id: "current", label: "Current Run" },
    { id: "errors", label: "Error Logs" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Run Console & Logs</h3>
      </div>

      {/* Mobile Tabs - Scrollable */}
      <div className="border-b border-slate-700">
        <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Console Content */}
      <div className="p-4 sm:p-6">
        <div className="bg-slate-900 rounded-lg p-3 sm:p-4 h-48 sm:h-64 overflow-y-auto font-mono text-xs sm:text-sm">
          {activeTab === "current" && (
            <div className="space-y-1">
              {currentLogsArray.length > 0 ? (
                currentLogsArray.map((log: LogEntry, index: number) => (
                  <div
                    key={`log-${index}`}
                    className="text-green-400 break-all"
                  >
                    {formatLogEntry(log)}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">
                  {isRunning ? "Loading logs..." : "No recent logs"}
                </div>
              )}
              {isRunning && (
                <div className="text-blue-400 animate-pulse">
                  {"> Running..."}
                </div>
              )}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-1">
              {errorLogsArray.length > 0 ? (
                errorLogsArray.map((log: LogEntry, index: number) => (
                  <div
                    key={`error-${index}`}
                    className="text-red-400 break-all"
                  >
                    • {formatLogEntry(log)}
                  </div>
                ))
              ) : (
                <div className="text-slate-400">No recent errors</div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-1">
              {historyData?.history?.map((run: any, index: number) => (
                <div
                  key={`history-${index}`}
                  className="text-slate-300 break-all"
                >
                  • [
                  {new Date(run.timestamp || run.started_at).toLocaleString()}]
                  {run.success
                    ? "Run completed successfully"
                    : "Run completed with errors"}
                  {run.count && ` - ${run.count} records`}
                  {run.site_key && ` (${run.site_key})`}
                </div>
              )) || (
                <div className="text-slate-400">No run history available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

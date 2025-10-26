"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logsApi, scrapeApi } from "@/lib/api";
import { useApi, usePolling } from "@/lib/hooks/useApi";
import { LogEntry, HistoryResponse, HistoryRun } from "@/lib/types";
import { toast } from "sonner";

interface RunConsoleProps {
  isRunning: boolean;
}

export function RunConsole({ isRunning }: RunConsoleProps) {
  const [activeTab, setActiveTab] = useState("current");

  console.log(
    "[RunConsole] Component mounted/updated, isRunning:",
    isRunning,
    "activeTab:",
    activeTab
  );

  // Poll for logs when running with stable function references
  const getCurrentLogs = useCallback(
    (): Promise<LogEntry[]> =>
      logsApi.getLogs({ limit: 50 }) as Promise<LogEntry[]>,
    []
  );
  const getErrorLogs = useCallback(
    (): Promise<LogEntry[]> => logsApi.getErrors(20) as Promise<LogEntry[]>,
    []
  );

  const { data: currentLogs } = usePolling<LogEntry[]>(
    getCurrentLogs,
    isRunning ? 5000 : 15000, // Poll slower when idle to still surface logs
    true
  );

  const { data: errorLogs } = usePolling<LogEntry[]>(
    getErrorLogs,
    isRunning ? 10000 : 30000, // Poll slower when idle
    true
  );

  // Use stable function reference for history to avoid re-mounting issues
  const getHistory = useCallback(
    (): Promise<HistoryResponse> =>
      scrapeApi.history(10) as Promise<HistoryResponse>,
    []
  );

  const { data: historyData, refetch: refetchHistory } =
    useApi<HistoryResponse>(getHistory);

  console.log("[RunConsole] Logs data:");
  console.log(
    "  currentLogsCount:",
    Array.isArray(currentLogs) ? currentLogs.length : 0
  );
  console.log(
    "  errorLogsCount:",
    Array.isArray(errorLogs) ? errorLogs.length : 0
  );
  console.log("  historyCount:", historyData?.history?.length || 0);

  if (Array.isArray(currentLogs) && currentLogs.length > 0) {
    console.log(
      "  currentLogs (first 3):",
      JSON.stringify(currentLogs.slice(0, 3), null, 2)
    );
  }
  if (Array.isArray(errorLogs) && errorLogs.length > 0) {
    console.log(
      "  errorLogs (first 3):",
      JSON.stringify(errorLogs.slice(0, 3), null, 2)
    );
  }
  if (historyData?.history && historyData.history.length > 0) {
    console.log(
      "  history (first 3):",
      JSON.stringify(historyData.history.slice(0, 3), null, 2)
    );
  }

  const handleRefresh = () => {
    console.log("[RunConsole] Refresh triggered for tab:", activeTab);
    if (activeTab === "history") {
      refetchHistory();
    } else {
    }
    toast.success("Logs refreshed");
  };

  // Ensure logs are always arrays
  const currentLogsArray: LogEntry[] = Array.isArray(currentLogs)
    ? (currentLogs as LogEntry[])
    : (currentLogs as unknown as { logs?: LogEntry[] })?.logs || [];

  const errorLogsArray: LogEntry[] = Array.isArray(errorLogs)
    ? (errorLogs as LogEntry[])
    : (errorLogs as unknown as { logs?: LogEntry[] })?.logs || [];

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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Run Console & Logs
          </h3>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
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
                <div className="text-slate-400">No recent logs</div>
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
            <div className="space-y-2">
              {historyData?.history && historyData.history.length > 0 ? (
                historyData.history.map((run: HistoryRun, index: number) => {
                  const startTime = run.started_at
                    ? new Date(run.started_at).toLocaleString()
                    : "Unknown";
                  const endTime = run.completed_at
                    ? new Date(run.completed_at).toLocaleString()
                    : "N/A";
                  const duration =
                    run.started_at && run.completed_at
                      ? Math.round(
                          (new Date(run.completed_at).getTime() -
                            new Date(run.started_at).getTime()) /
                            1000 /
                            60
                        )
                      : null;
                  const sites = Array.isArray(run.sites)
                    ? run.sites.join(", ")
                    : run.sites || "N/A";
                  const statusText = run.success
                    ? "✓ Success"
                    : run.return_code === 0
                    ? "✓ Success"
                    : "✗ Failed";
                  const statusColor =
                    run.success || run.return_code === 0
                      ? "text-green-400"
                      : "text-red-400";

                  return (
                    <div
                      key={`history-${run.run_id || index}`}
                      className="pb-2 border-b border-slate-800 last:border-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className={`font-semibold ${statusColor}`}>
                          {statusText}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-xs">
                          Run ID: {run.run_id || "N/A"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        <div>Started: {startTime}</div>
                        {run.completed_at && <div>Completed: {endTime}</div>}
                        <div>Sites: {sites}</div>
                        <div className="flex gap-3 flex-wrap">
                          {duration !== null && (
                            <span>Duration: {duration}min</span>
                          )}
                          {run.max_pages && (
                            <span>Max Pages: {run.max_pages}</span>
                          )}
                          {run.geocoding !== null &&
                            run.geocoding !== undefined && (
                              <span>
                                Geocoding: {run.geocoding ? "Yes" : "No"}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400">No run history available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

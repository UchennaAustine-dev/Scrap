"use client";

import { useState, useEffect } from "react";

interface RunConsoleProps {
  isRunning: boolean;
}

export function RunConsole({ isRunning }: RunConsoleProps) {
  const [activeTab, setActiveTab] = useState("current");
  const [logs, setLogs] = useState<string[]>([
    "> Initializing scraper...",
    "> Connecting to proxy pool...",
    "> Connection successful.",
    "> Starting run for 'Site Three'...",
    "> Console messages will appear here during a run...",
  ]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setLogs((prev) => [
          ...prev,
          `> [${new Date().toLocaleTimeString()}] Processing page ${
            Math.floor(Math.random() * 100) + 1
          }...`,
        ]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

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
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 break-all">
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="text-blue-400 animate-pulse">
                  {"> Running..."}
                </div>
              )}
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-1">
              <div className="text-red-400 break-all">
                • [2024-01-15 09:00] Error: Connection timeout for site-two.com
              </div>
              <div className="text-red-400 break-all">
                • [2024-01-14 15:30] Error: Rate limit exceeded
              </div>
              <div className="text-red-400 break-all">
                • [2024-01-14 12:15] Error: Invalid selector for price element
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-1">
              <div className="text-slate-300 break-all">
                • [2024-01-15 10:00] Run completed successfully - 1,234 records
              </div>
              <div className="text-slate-300 break-all">
                • [2024-01-14 14:30] Run completed with errors - 856 records
              </div>
              <div className="text-slate-300 break-all">
                • [2024-01-14 09:15] Run completed successfully - 2,145 records
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { HealthAlert } from "@/lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .healthAlerts()
      .then((res: HealthAlert[]) => setAlerts(res))
      .catch((err: any) => setError(err?.message || "Error fetching alerts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">Health Alerts</h1>
      <p className="text-slate-400 text-sm mt-1">
        System warnings, errors, and info alerts
      </p>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {alerts.length > 0 ? (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={`bg-slate-900 rounded-lg p-4 text-slate-300 border-l-4 ${
                a.type === "error"
                  ? "border-red-500"
                  : a.type === "warning"
                  ? "border-yellow-500"
                  : "border-blue-500"
              }`}
            >
              <div>
                <strong>Type:</strong> {a.type}
              </div>
              <div>
                <strong>Message:</strong> {a.message}
              </div>
              <div>
                <strong>Site:</strong> {a.site_key || "-"}
              </div>
              <div>
                <strong>Time:</strong> {a.timestamp}
              </div>
              <div>
                <strong>Acknowledged:</strong> {a.acknowledged ? "Yes" : "No"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No alerts found.</div>
      )}
    </div>
  );
}

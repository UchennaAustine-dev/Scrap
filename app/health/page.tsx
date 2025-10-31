"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { HealthCheck } from "@/lib/types";

export default function HealthPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient
      .healthCheck()
      .then((res: HealthCheck) => setHealth(res))
      .catch((err: any) =>
        setError(err?.message || "Error fetching health status")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white">API Health</h1>
      <p className="text-slate-400 text-sm mt-1">
        Backend health and diagnostics
      </p>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {health && (
        <pre className="mt-4 p-4 bg-slate-900 rounded-lg overflow-auto text-xs text-slate-300">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </div>
  );
}

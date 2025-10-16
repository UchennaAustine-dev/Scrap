"use client";

import { useMemo } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { statsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TrendsPoint {
  date: string;
  total_records: number;
  successful_runs: number;
  failed_runs: number;
}

export function TrendsChart() {
  const { data, refetch } = useApi<TrendsPoint[]>(() => statsApi.getTrends(7));

  const chartData = useMemo(() => {
    const arr = Array.isArray(data) ? data : (data as any)?.points || [];
    return arr.map((d: any) => ({
      date: d.date || d.day || "",
      records: d.total_records ?? d.records ?? 0,
      success: d.successful_runs ?? d.success ?? 0,
      failed: d.failed_runs ?? d.failed ?? 0,
    }));
  }, [data]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          7-Day Activity Trends
        </h3>
        <Button
          onClick={() => {
            refetch();
            toast.success("Trends refreshed");
          }}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      <div className="p-4 sm:p-6">
        {chartData.length === 0 ? (
          <div className="text-slate-400">No trend data available.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Records</th>
                  <th className="text-left py-2 pr-4">Success</th>
                  <th className="text-left py-2 pr-4">Failed</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map(
                  (
                    row: {
                      date: string;
                      records: number;
                      success: number;
                      failed: number;
                    },
                    idx: number
                  ) => (
                    <tr key={idx} className="border-b border-slate-800">
                      <td className="py-2 pr-4 text-slate-300">{row.date}</td>
                      <td className="py-2 pr-4 text-slate-300">
                        {row.records}
                      </td>
                      <td className="py-2 pr-4 text-green-400">
                        {row.success}
                      </td>
                      <td className="py-2 pr-4 text-red-400">{row.failed}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

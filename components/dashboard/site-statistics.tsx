"use client";

import { useMemo, useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/useApi";
import { statsApi } from "@/lib/api";
import {
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SiteStat {
  site_key: string;
  name?: string;
  total_scrapes?: number;
  successful_scrapes?: number;
  failed_scrapes?: number;
  success_rate?: number;
  avg_records_per_scrape?: number;
  total_records?: number;
  avg_scrape_duration?: number;
  last_scrape?: string;
  last_success?: string;
  error_count?: number;
  health_score?: number;
}

export function SiteStatistics() {
  const { data, refetch } = useApi<SiteStat[] | { sites: SiteStat[] }>(() =>
    statsApi.getSiteStats()
  );

  const stats = useMemo(() => {
    if (Array.isArray(data)) return data;
    return (data as any)?.sites || [];
  }, [data]);

  type SortKey =
    | "name"
    | "success_rate"
    | "total_records"
    | "avg_records_per_scrape"
    | "error_count"
    | "last_success";
  const [sortKey, setSortKey] = useState<SortKey>("success_rate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25>(10);

  // Reset to first page when data or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [stats.length, pageSize, sortKey, sortDir]);

  const sortedStats = useMemo(() => {
    const arr = [...stats];
    const getVal = (s: SiteStat, key: SortKey) => {
      if (key === "name") return (s.name || s.site_key || "").toLowerCase();
      if (key === "last_success")
        return s.last_success ? new Date(s.last_success).getTime() : 0;
      return Number((s as any)?.[key] ?? 0);
    };
    arr.sort((a, b) => {
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [stats, sortKey, sortDir]);

  const total = sortedStats.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = sortedStats.slice(startIdx, endIdx);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Site Statistics</h3>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-slate-400 text-sm">
            Rows {total === 0 ? 0 : startIdx + 1}-{endIdx} of {total}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">Per page:</span>
              <Button
                variant={pageSize === 10 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setPageSize(10)}
                className="h-7 px-2"
              >
                10
              </Button>
              <Button
                variant={pageSize === 25 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setPageSize(25)}
                className="h-7 px-2"
              >
                25
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-slate-300 text-sm">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-7 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("name")}
                  title="Sort by site"
                >
                  Site
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("success_rate")}
                  title="Sort by success rate"
                >
                  Success Rate
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("total_records")}
                  title="Sort by total records"
                >
                  Total Records
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("avg_records_per_scrape")}
                  title="Sort by average per run"
                >
                  Avg/Run
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("error_count")}
                  title="Sort by errors"
                >
                  Errors
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="text-left py-2 pr-4">
                <button
                  className="inline-flex items-center gap-1 hover:text-slate-200"
                  onClick={() => toggleSort("last_success")}
                  title="Sort by last success"
                >
                  Last Success
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows && pageRows.length > 0 ? (
              pageRows.map((s: SiteStat) => (
                <tr key={s.site_key} className="border-b border-slate-800">
                  <td className="py-2 pr-4 text-slate-300">
                    {s.name || s.site_key}
                  </td>
                  <td className="py-2 pr-4 text-slate-300">
                    {(s.success_rate ?? 0).toFixed(1)}%
                  </td>
                  <td className="py-2 pr-4 text-slate-300">
                    {s.total_records ?? 0}
                  </td>
                  <td className="py-2 pr-4 text-slate-300">
                    {s.avg_records_per_scrape ?? 0}
                  </td>
                  <td className="py-2 pr-4 text-red-400">
                    {s.error_count ?? 0}
                  </td>
                  <td className="py-2 pr-4 text-slate-300">
                    {s.last_success
                      ? new Date(s.last_success).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-slate-400">
                  No site statistics available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

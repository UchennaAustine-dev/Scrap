"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useApi, useApiMutation } from "@/lib/hooks/useApi";
import { SiteListResponse } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiteLogsModal } from "./site-logs-modal";
import { SiteDetailsModal } from "./site-details-modal";

interface SiteConfigurationProps {
  onAddSite: () => void;
  selectedSites: string[];
  onSelectedSitesChange: (sites: string[]) => void;
}

export function SiteConfiguration({
  onAddSite,
  selectedSites,
  onSelectedSitesChange,
}: SiteConfigurationProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [logsSiteKey, setLogsSiteKey] = useState<string | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [editSiteKey, setEditSiteKey] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Persistent filter: showDisabled
  const [showDisabled, setShowDisabled] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("siteConfigShowDisabled");
      return stored === null ? true : stored === "true";
    }
    return true;
  });
  // Persistent pagination: page
  const [page, setPage] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("siteConfigPage");
      return stored ? parseInt(stored, 10) || 1 : 1;
    }
    return 1;
  });
  // Persist showDisabled and page to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteConfigShowDisabled", String(showDisabled));
    }
  }, [showDisabled]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteConfigPage", String(page));
    }
  }, [page]);
  const PAGE_SIZE = 10;
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("siteConfigAutoRefresh");
      return stored === "true";
    }
    return false;
  });
  // Inline feedback state
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  // Bulk action loading state
  const [bulkLoading, setBulkLoading] = useState(false);
  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Create a stable function reference for the API call
  const getSites = useCallback(() => apiClient.listSites(), []);

  const {
    data: sitesData,
    loading,
    error,
    refetch,
  } = useApi<SiteListResponse>(getSites);

  // Extract sites array - handle both null and the response structure
  const allSites = useMemo(() => sitesData?.sites || [], [sitesData?.sites]);

  // Extra diagnostics for state transitions
  const prevLoadingRef = useRef<boolean | null>(null);
  const prevDataRef = useRef<number>(-1);
  useEffect(() => {
    if (prevLoadingRef.current !== loading) {
      console.log("[SiteConfiguration] loading changed:", loading);
      prevLoadingRef.current = loading;
    }
    const count = sitesData?.sites?.length ?? -1;
    if (prevDataRef.current !== count) {
      console.log("[SiteConfiguration] sites count changed:", count);
      prevDataRef.current = count;
    }
  }, [loading, sitesData]);

  // Reset page if sites data changes and page is out of range
  useEffect(() => {
    const filteredLength = showDisabled
      ? allSites.length
      : allSites.filter((site: any) => site.enabled).length;
    const maxPages = Math.max(1, Math.ceil(filteredLength / PAGE_SIZE));
    if (page > maxPages) {
      setPage(1);
    }
  }, [allSites, showDisabled, PAGE_SIZE, page]);

  // Persist auto-refresh setting
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteConfigAutoRefresh", String(autoRefresh));
    }
  }, [autoRefresh]);

  // Auto-refresh sites list every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log("[SiteConfiguration] Auto-refreshing sites...");
      refetch();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Filter sites based on showDisabled toggle
  const filteredSites = showDisabled
    ? allSites
    : allSites.filter((site: any) => site.enabled);
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredSites.length / PAGE_SIZE));
  const pagedSites = filteredSites.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Aggregate selection state for the header select-all checkbox
  const allChecked =
    pagedSites.length > 0 &&
    pagedSites.every((site: any) => selectedSites.includes(site.site_key));
  const someChecked = pagedSites.some((site: any) =>
    selectedSites.includes(site.site_key)
  );

  // Maintain indeterminate state for the select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someChecked && !allChecked;
    }
  }, [someChecked, allChecked]);

  console.log("[SiteConfiguration] Component mounted/updated");
  console.log("[SiteConfiguration] loading:", loading, "error:", error);

  if (sitesData) {
    console.log("[SiteConfiguration] Sites data:");
    console.log("  enabled:", sitesData.enabled);
    console.log("  disabled:", sitesData.disabled);
    console.log("  total:", sitesData.total);
    console.log(
      "  sites (first 3):",
      JSON.stringify(sitesData.sites?.slice(0, 3), null, 2)
    );
  } else {
    console.log("[SiteConfiguration] Sites data: null");
  }

  // API Mutations - MUST be declared before any conditional returns
  const toggleSiteMutation = useApiMutation(async (siteKey: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const site = allSites.find((s: any) => s.site_key === siteKey);
      if (site) {
        await apiClient.toggleSite(siteKey, !site.enabled);
      }
      setActionSuccess("Site status updated");
      toast.success("Site status updated");
      refetch();
    } catch (_error) {
      setActionError("Failed to update site status");
      toast.error("Failed to update site status");
      throw _error;
    }
  });

  const deleteSiteMutation = useApiMutation(async (siteKey: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await apiClient.deleteSite(siteKey);
      setActionSuccess("Site deleted successfully");
      toast.success("Site deleted successfully");
      refetch();
    } catch (_error) {
      setActionError("Failed to delete site");
      toast.error("Failed to delete site");
      throw _error;
    }
  });

  // Bulk action handlers
  const handleBulkEnable = async () => {
    setBulkLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      for (const key of selectedSites) {
        const site = allSites.find((s: any) => s.site_key === key);
        if (site && !site.enabled) {
          await toggleSiteMutation.mutate(key);
        }
      }
      setActionSuccess("Selected sites enabled");
      toast.success("Selected sites enabled");
      refetch();
    } catch {
      setActionError("Failed to enable selected sites");
      toast.error("Failed to enable selected sites");
    }
    setBulkLoading(false);
  };
  const handleBulkDisable = async () => {
    setBulkLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      for (const key of selectedSites) {
        const site = allSites.find((s: any) => s.site_key === key);
        if (site && site.enabled) {
          await toggleSiteMutation.mutate(key);
        }
      }
      setActionSuccess("Selected sites disabled");
      toast.success("Selected sites disabled");
      refetch();
    } catch {
      setActionError("Failed to disable selected sites");
      toast.error("Failed to disable selected sites");
    }
    setBulkLoading(false);
  };
  const handleBulkDelete = async () => {
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    setBulkLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      for (const key of selectedSites) {
        await deleteSiteMutation.mutate(key);
      }
      setActionSuccess("Selected sites deleted");
      toast.success("Selected sites deleted");
      refetch();
      onSelectedSitesChange([]);
      setBulkDeleteConfirmOpen(false);
    } catch {
      setActionError("Failed to delete selected sites");
      toast.error("Failed to delete selected sites");
    }
    setBulkLoading(false);
  };

  const handleEdit = (siteKey: string) => {
    setEditSiteKey(siteKey);
    setIsEditOpen(true);
  };

  const handleViewLogs = (siteKey: string) => {
    setLogsSiteKey(siteKey);
    setIsLogsOpen(true);
  };

  const handleDelete = async (siteKey: string) => {
    setSiteToDelete(siteKey);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!siteToDelete) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteSiteMutation.mutate(siteToDelete);
      setDeleteConfirmOpen(false);
      setSiteToDelete(null);
    } catch {
      // error handled in mutation
    }
  };

  const handleToggleEnabled = async (siteKey: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await toggleSiteMutation.mutate(siteKey);
    } catch {
      // error handled in mutation
    }
  };

  const handleToggleSelection = (siteKey: string) => {
    const newSelected = selectedSites.includes(siteKey)
      ? selectedSites.filter((key) => key !== siteKey)
      : [...selectedSites, siteKey];
    console.log("[SiteConfiguration] Site selection changed:", {
      siteKey,
      newSelected,
    });
    onSelectedSitesChange(newSelected);
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <Power className="w-4 h-4 text-green-400" />
    ) : (
      <PowerOff className="w-4 h-4 text-red-400" />
    );
  };

  if (loading && (!sitesData || !sitesData.sites)) {
    // Skeleton loader for mobile cards
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="block sm:hidden divide-y divide-slate-700">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="p-4 space-y-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-slate-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700 rounded w-1/4" />
            </div>
          ))}
        </div>
        {/* Skeleton loader for desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4">SITE</th>
                <th className="p-4">URL</th>
                <th className="p-4">PARSER</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-700 animate-pulse"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-slate-700 rounded" />
                      <div>
                        <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
                        <div className="h-3 bg-slate-700 rounded w-16" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="h-3 bg-slate-700 rounded w-32" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 bg-slate-700 rounded w-20" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 bg-slate-700 rounded w-16" />
                  </td>
                  <td className="p-4">
                    <div className="h-3 bg-slate-700 rounded w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="text-center">
          <p className="text-red-400">Error loading sites: {error}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              onClick={refetch}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                // Soft reset selection to prevent stale UI
                onSelectedSitesChange([]);
                refetch();
              }}
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              Clear & Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h3 className="text-lg font-semibold text-white">
              Site Configuration
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                onClick={() => {
                  refetch();
                  toast.success("Sites list refreshed");
                }}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              {/* Auto-refresh toggle */}
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="hidden sm:inline">Auto-refresh (30s)</span>
                <span className="sm:hidden">Auto</span>
              </label>
              <Button
                onClick={onAddSite}
                className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center space-x-2 flex-1 sm:flex-initial"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Site</span>
              </Button>
            </div>
          </div>
          {/* Stats and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm">
            <div className="flex items-center gap-4 text-slate-400">
              <span>
                Total:{" "}
                <span className="text-white font-medium">
                  {allSites.length}
                </span>
              </span>
              <span>
                Enabled:{" "}
                <span className="text-green-400 font-medium">
                  {sitesData?.enabled || 0}
                </span>
              </span>
              <span>
                Disabled:{" "}
                <span className="text-slate-500 font-medium">
                  {sitesData?.disabled || 0}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-disabled"
                checked={showDisabled}
                onCheckedChange={(checked) =>
                  setShowDisabled(checked as boolean)
                }
              />
              <label
                htmlFor="show-disabled"
                className="text-slate-300 cursor-pointer"
              >
                Show disabled sites
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Inline feedback for actions */}
      {(actionError || actionSuccess) && (
        <div className="px-4 sm:px-6 py-2 border-b border-slate-700">
          {actionError && (
            <div className="text-red-400 text-sm">{actionError}</div>
          )}
          {actionSuccess && (
            <div className="text-green-400 text-sm">{actionSuccess}</div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredSites.length === 0 && !loading && (
        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
          {/* Simple illustration */}
          <svg
            width="64"
            height="64"
            fill="none"
            viewBox="0 0 64 64"
            className="mb-4"
          >
            <rect x="8" y="20" width="48" height="32" rx="6" fill="#334155" />
            <rect x="16" y="28" width="32" height="8" rx="2" fill="#475569" />
            <rect x="16" y="40" width="12" height="4" rx="2" fill="#475569" />
            <rect x="32" y="40" width="16" height="4" rx="2" fill="#475569" />
          </svg>
          <p className="mb-2 text-lg font-semibold text-slate-300">
            {allSites.length === 0
              ? "No sites configured yet."
              : "No enabled sites found."}
          </p>
          <p className="mb-4 text-slate-400">
            {allSites.length === 0
              ? "Add a new site to get started."
              : "Toggle 'Show disabled sites' to see all sites or enable one."}
          </p>
          {allSites.length > 0 && !showDisabled && (
            <Button
              onClick={() => setShowDisabled(true)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Show All Sites
            </Button>
          )}
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="divide-y divide-slate-700">
          {pagedSites.map((site: any) => (
            <div key={site.site_key} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Checkbox
                    checked={selectedSites.includes(site.site_key)}
                    onCheckedChange={() => handleToggleSelection(site.site_key)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {site.name}
                    </p>
                    <p className="text-slate-400 text-sm truncate">
                      {site.site_key}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-slate-700 border-slate-600"
                  >
                    <DropdownMenuItem
                      onClick={() => handleViewLogs(site.site_key)}
                      className="text-slate-300 focus:bg-slate-600"
                    >
                      Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEdit(site.site_key)}
                      className="text-slate-300 focus:bg-slate-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleEnabled(site.site_key)}
                      className="text-slate-300 focus:bg-slate-600"
                      disabled={toggleSiteMutation.loading}
                    >
                      {site.enabled ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Enable
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(site.site_key)}
                      className="text-red-400 focus:bg-red-500/10"
                      disabled={deleteSiteMutation.loading}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">URL: </span>
                  <span className="text-slate-300 break-all">{site.url}</span>
                </div>
                <div>
                  <span className="text-slate-400">Parser: </span>
                  <span className="text-slate-300">{site.parser}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Status: </span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(site.enabled)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        site.enabled ? "enabled" : "disabled"
                      )}`}
                    >
                      {site.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View (scrollable on all screens, better tap targets) */}
      <div className="w-full overflow-x-auto">
        {/* Bulk actions bar */}
        {selectedSites.length > 0 && (
          <div className="flex gap-2 items-center bg-slate-700/80 p-2 rounded-t-lg mb-1">
            <span className="text-slate-300 text-sm font-medium">
              Bulk actions for {selectedSites.length} selected:
            </span>
            <Button
              size="sm"
              onClick={handleBulkEnable}
              disabled={bulkLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Enable
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDisable}
              disabled={bulkLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Disable
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        )}
        <table className="min-w-[700px] w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4">
                {/* Accessible select-all checkbox with indeterminate state */}
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={
                    pagedSites.length > 0 &&
                    pagedSites.every((site: any) =>
                      selectedSites.includes(site.site_key)
                    )
                  }
                  aria-checked={
                    pagedSites.length > 0 &&
                    pagedSites.every((site: any) =>
                      selectedSites.includes(site.site_key)
                    )
                      ? "true"
                      : pagedSites.some((site: any) =>
                          selectedSites.includes(site.site_key)
                        )
                      ? "mixed"
                      : "false"
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSelected = Array.from(
                        new Set([
                          ...selectedSites,
                          ...pagedSites.map((site: any) => site.site_key),
                        ])
                      );
                      onSelectedSitesChange(newSelected);
                    } else {
                      const newSelected = selectedSites.filter(
                        (key) =>
                          !pagedSites
                            .map((site: any) => site.site_key)
                            .includes(key)
                      );
                      onSelectedSitesChange(newSelected);
                    }
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none cursor-pointer"
                  tabIndex={0}
                  aria-label="Select all sites on this page"
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                SITE
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                URL
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                PARSER
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                STATUS
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedSites.map((site: any) => (
              <tr
                key={site.site_key}
                className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-all focus-within:bg-slate-700/80 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                tabIndex={0}
                aria-label={`Site row for ${site.name}`}
                style={{ minHeight: 56 }}
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedSites.includes(site.site_key)}
                    onCheckedChange={() => {
                      const newSelected = selectedSites.includes(site.site_key)
                        ? selectedSites.filter((key) => key !== site.site_key)
                        : [...selectedSites, site.site_key];
                      onSelectedSitesChange(newSelected);
                    }}
                  />
                </td>
                {/* SITE */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium">
                      {site.name || site.site_key}
                    </span>
                    {site.name && (
                      <span className="text-slate-400 text-xs">
                        {site.site_key}
                      </span>
                    )}
                  </div>
                </td>
                {/* URL */}
                <td className="p-4 max-w-[320px]">
                  {site.url ? (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 truncate inline-block max-w-full"
                      title={site.url}
                    >
                      {site.url}
                    </a>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </td>
                {/* PARSER */}
                <td className="p-4">
                  <span className="text-slate-300">
                    {site.parser || "Auto"}
                  </span>
                </td>
                {/* STATUS */}
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(site.enabled)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        site.enabled ? "enabled" : "disabled"
                      )}`}
                    >
                      {site.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </td>
                {/* ACTIONS */}
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleViewLogs(site.site_key)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-300 hover:text-white hover:bg-slate-600/30"
                      disabled={
                        toggleSiteMutation.loading || deleteSiteMutation.loading
                      }
                    >
                      Logs
                    </Button>
                    <Button
                      onClick={() => handleEdit(site.site_key)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      disabled={
                        toggleSiteMutation.loading || deleteSiteMutation.loading
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleEnabled(site.site_key)}
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      disabled={toggleSiteMutation.loading}
                    >
                      {site.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {filteredSites.length > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-2 py-4">
          <Button
            size="sm"
            variant="outline"
            className="px-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>
          {[...Array(totalPages)].map((_, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={page === idx + 1 ? "default" : "outline"}
              className="px-2"
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </Button>
          ))}
          <Button
            size="sm"
            variant="outline"
            className="px-2"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      {/* Site Logs Modal */}
      <SiteLogsModal
        siteKey={logsSiteKey}
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
      {/* Site Details/Edit Modal */}
      <SiteDetailsModal
        siteKey={editSiteKey}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => refetch()}
      />
      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirm Delete
            </h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to delete this site? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteSiteMutation.loading}
              >
                {deleteSiteMutation.loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Delete Confirmation Dialog */}
      {bulkDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setBulkDeleteConfirmOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirm Bulk Delete
            </h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to delete {selectedSites.length} selected
              site(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBulkDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={bulkLoading}
              >
                {bulkLoading ? "Deleting..." : "Delete All"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import { sitesApi } from "@/lib/api";
import { useApi, useApiMutation } from "@/lib/hooks/useApi";
import { Site, SiteListResponse } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SiteConfigurationProps {
  onAddSite: () => void;
  selectedSites: string[];
  onSelectedSitesChange: (sites: string[]) => void;
}

export function SiteConfiguration({ 
  onAddSite, 
  selectedSites, 
  onSelectedSitesChange 
}: SiteConfigurationProps) {
  const { data: sitesData, loading, error, refetch } = useApi<SiteListResponse>(
    () => sitesApi.list()
  );

  const sites = sitesData?.sites || [];

  const toggleSiteMutation = useApiMutation((siteKey: string) => 
    sitesApi.toggle(siteKey)
  );

  const deleteSiteMutation = useApiMutation((siteKey: string) => 
    sitesApi.delete(siteKey)
  );

  const handleEdit = (siteKey: string) => {
    toast.info(`Editing site ${siteKey}`);
  };

  const handleDelete = async (siteKey: string) => {
    try {
      await deleteSiteMutation.mutate(siteKey);
      toast.success("Site deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete site");
    }
  };

  const handleToggleEnabled = async (siteKey: string) => {
    try {
      await toggleSiteMutation.mutate(siteKey);
      toast.success("Site status updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update site status");
    }
  };

  const handleToggleSelection = (siteKey: string) => {
    const newSelected = selectedSites.includes(siteKey)
      ? selectedSites.filter(key => key !== siteKey)
      : [...selectedSites, siteKey];
    onSelectedSitesChange(newSelected);
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <Power className="w-4 h-4 text-green-400" />
    ) : (
      <PowerOff className="w-4 h-4 text-red-400" />
    );
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-slate-400">Loading sites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="text-center text-red-400">
          <p>Error loading sites: {error}</p>
          <Button onClick={refetch} className="mt-2" variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Site Configuration</h3>
        <Button
          onClick={onAddSite}
          className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Site</span>
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="divide-y divide-slate-700">
          {sites.map((site) => (
            <div key={site.id} className="p-4 space-y-3">
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
                      onClick={() => handleEdit(site.site_key)}
                      className="text-slate-300 focus:bg-slate-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleEnabled(site.site_key)}
                      className="text-slate-300 focus:bg-slate-600"
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
                  <span className="text-slate-300 break-all">
                    {site.url}
                  </span>
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
                        site.enabled ? 'enabled' : 'disabled'
                      )}`}
                    >
                      {site.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
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
            {sites.map((site) => (
              <tr
                key={site.site_key}
                className="border-b border-slate-700 hover:bg-slate-700/50"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedSites.includes(site.site_key)}
                      onCheckedChange={() => handleToggleSelection(site.site_key)}
                    />
                    <div>
                      <p className="text-white font-medium">{site.name}</p>
                      <p className="text-slate-400 text-sm">
                        {site.site_key}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{site.url}</td>
                <td className="p-4 text-slate-300">{site.parser}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(site.enabled)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        site.enabled ? 'enabled' : 'disabled'
                      )}`}
                    >
                      {site.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(site.site_key)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleToggleEnabled(site.site_key)}
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      {site.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

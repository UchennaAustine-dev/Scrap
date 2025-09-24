"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import { mockSites } from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SiteConfigurationProps {
  onAddSite: () => void;
}

export function SiteConfiguration({ onAddSite }: SiteConfigurationProps) {
  const [sites, setSites] = useState(mockSites);

  const handleEdit = (siteId: string) => {
    toast.info(`Editing site ${siteId}`);
  };

  const handleDelete = (siteId: string) => {
    setSites(sites.filter((site) => site.id !== siteId));
    toast.success("Site deleted successfully");
  };

  const handleToggleSelection = (siteId: string) => {
    setSites(
      sites.map((site) =>
        site.id === siteId ? { ...site, selected: !site.selected } : site
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "Running":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

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
                    checked={site.selected || false}
                    onCheckedChange={() => handleToggleSelection(site.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {site.name}
                    </p>
                    <p className="text-slate-400 text-sm truncate">
                      site_key_{site.id}
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
                      onClick={() => handleEdit(site.id)}
                      className="text-slate-300 focus:bg-slate-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(site.id)}
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
                    {site.baseUrl}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Last Run: </span>
                  <span className="text-slate-300">{site.lastRun}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Status: </span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(site.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        site.status
                      )}`}
                    >
                      {site.status}
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
                BASE URL
              </th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">
                LAST RUN
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
                key={site.id}
                className="border-b border-slate-700 hover:bg-slate-700/50"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={site.selected || false}
                      onCheckedChange={() => handleToggleSelection(site.id)}
                    />
                    <div>
                      <p className="text-white font-medium">{site.name}</p>
                      <p className="text-slate-400 text-sm">
                        site_key_{site.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{site.baseUrl}</td>
                <td className="p-4 text-slate-300">{site.lastRun}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(site.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        site.status
                      )}`}
                    >
                      {site.status}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(site.id)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      Edit
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

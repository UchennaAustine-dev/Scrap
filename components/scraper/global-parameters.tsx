"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { GlobalParameters as GlobalParametersType } from "@/lib/types";

export function GlobalParameters() {
  const [parameters, setParameters] = useState<GlobalParametersType>({
    headless: true,
    maxPagesPerSite: 100,
    geocoding: true,
    retryStrategy: "Exponential Backoff",
    proxyPool: "Residential",
    exportFormat: "CSV",
  });

  const updateParameter = (key: keyof GlobalParametersType, value: any) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Global Parameters</h3>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Headless
          </label>
          <Select
            value={parameters.headless ? "Enabled" : "Disabled"}
            onValueChange={(value) =>
              updateParameter("headless", value === "Enabled")
            }
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Enabled">Enabled</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Max Pages Per Site
          </label>
          <Input
            type="number"
            value={parameters.maxPagesPerSite}
            onChange={(e) =>
              updateParameter(
                "maxPagesPerSite",
                Number.parseInt(e.target.value)
              )
            }
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Geocoding
          </label>
          <Select
            value={parameters.geocoding ? "Enabled" : "Disabled"}
            onValueChange={(value) =>
              updateParameter("geocoding", value === "Enabled")
            }
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Enabled">Enabled</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Retry Strategy
          </label>
          <Select
            value={parameters.retryStrategy}
            onValueChange={(value) => updateParameter("retryStrategy", value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Exponential Backoff">
                Exponential Backoff
              </SelectItem>
              <SelectItem value="Linear Backoff">Linear Backoff</SelectItem>
              <SelectItem value="Fixed Delay">Fixed Delay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Proxy Pool
          </label>
          <Select
            value={parameters.proxyPool}
            onValueChange={(value) => updateParameter("proxyPool", value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Datacenter">Datacenter</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Export Format
          </label>
          <Select
            value={parameters.exportFormat}
            onValueChange={(value) => updateParameter("exportFormat", value)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="XLSX">XLSX</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

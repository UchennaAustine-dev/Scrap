"use client";

import { useState } from "react";
import { Download, FileText, Table, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, FilterState } from "@/lib/types";
import { toast } from "sonner";
import { mockProperties } from "@/lib/mockData";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/lib/export-utils";
import DataTable from "./data-table";
import FilterSidebar from "./filter-sidebar";

export default function DataExplorer() {
  const [properties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    location: "",
    priceRange: [0, 1000000],
    bedrooms: [],
    bathrooms: [],
    propertyType: "",
    promoTags: [],
    startDate: "",
    endDate: "",
    sourceSite: "",
  });

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKeyword =
      !filters.keyword ||
      property.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      property.location.toLowerCase().includes(filters.keyword.toLowerCase());

    const matchesLocation =
      !filters.location ||
      property.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesPrice =
      property.price >= filters.priceRange[0] &&
      property.price <= filters.priceRange[1];

    const matchesBedrooms =
      filters.bedrooms.length === 0 ||
      filters.bedrooms.includes(property.bedrooms);

    const matchesBathrooms =
      filters.bathrooms.length === 0 ||
      filters.bathrooms.includes(property.bathrooms);

    const matchesType =
      !filters.propertyType ||
      property.type.toLowerCase() === filters.propertyType.toLowerCase();

    const matchesPromoTags =
      filters.promoTags.length === 0 ||
      filters.promoTags.some((tag) => {
        switch (tag) {
          case "Featured":
            return property.featured;
          case "New Listing":
            return property.newListing;
          case "Open House":
            return property.openHouse;
          default:
            return false;
        }
      });

    return (
      matchesSearch &&
      matchesKeyword &&
      matchesLocation &&
      matchesPrice &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesType &&
      matchesPromoTags
    );
  });

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      switch (format) {
        case "csv":
          exportToCSV(filteredProperties, "property-data");
          break;
        case "xlsx":
          exportToXLSX(filteredProperties, "property-data");
          break;
        case "pdf":
          exportToPDF(filteredProperties, "property-data");
          break;
      }
      toast.success(`Data exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to export to ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="relative">
      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-slate-900 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileFilters(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold text-white">Data Explorer</h2>
          <p className="text-slate-400">
            Query, filter, and export scraped data.
          </p>
        </div>

        {/* Mobile Export Buttons */}
        <div className="flex flex-wrap gap-2 lg:hidden">
          <Button
            onClick={() => handleExport("csv")}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-1 text-xs"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </Button>
          <Button
            onClick={() => handleExport("xlsx")}
            size="sm"
            className="bg-green-500 hover:bg-green-600 flex items-center space-x-1 text-xs"
          >
            <Table className="w-3 h-3" />
            <span>XLSX</span>
          </Button>
          <Button
            onClick={() => handleExport("pdf")}
            size="sm"
            className="bg-red-500 hover:bg-red-600 flex items-center space-x-1 text-xs"
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </Button>
        </div>

        {/* Desktop Export Buttons */}
        <div className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-3">
          <Button
            onClick={() => handleExport("csv")}
            className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV</span>
          </Button>
          <Button
            onClick={() => handleExport("xlsx")}
            className="bg-green-500 hover:bg-green-600 flex items-center space-x-2"
          >
            <Table className="w-4 h-4" />
            <span>Export to XLSX</span>
          </Button>
          <Button
            onClick={() => handleExport("pdf")}
            className="bg-red-500 hover:bg-red-600 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Export to PDF</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search and Mobile Filter Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden border-slate-600 text-slate-300 hover:bg-slate-700 px-3"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Active Filters Display */}
          {(filters.location ||
            filters.propertyType ||
            filters.bedrooms.length > 0 ||
            filters.bathrooms.length > 0 ||
            filters.promoTags.length > 0) && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">Active filters:</span>

              {filters.location && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                  Location: {filters.location}
                </span>
              )}

              {filters.propertyType && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                  Type: {filters.propertyType}
                </span>
              )}

              {filters.bedrooms.length > 0 && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                  Beds: {filters.bedrooms.join(", ")}
                </span>
              )}

              {filters.bathrooms.length > 0 && (
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                  Baths: {filters.bathrooms.join(", ")}
                </span>
              )}

              {filters.promoTags.length > 0 && (
                <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded text-xs">
                  Tags: {filters.promoTags.join(", ")}
                </span>
              )}

              <button
                onClick={() =>
                  setFilters({
                    keyword: "",
                    location: "",
                    priceRange: [0, 1000000],
                    bedrooms: [],
                    bathrooms: [],
                    propertyType: "",
                    promoTags: [],
                    startDate: "",
                    endDate: "",
                    sourceSite: "",
                  })
                }
                className="text-slate-400 hover:text-white text-xs underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-slate-400">
            Showing {filteredProperties.length} of {properties.length}{" "}
            properties
          </div>

          {/* Data Table */}
          <DataTable properties={filteredProperties} />
        </div>
      </div>
    </div>
  );
}

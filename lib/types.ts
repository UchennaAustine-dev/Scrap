export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface Site {
  site_key: string;
  name: string;
  url: string;
  enabled: boolean;
  parser: string;
  selected?: boolean;
  // Optional fields from backend
  category?: string;
  priority?: number;
  notes?: string;
  selectors?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
  lagos_paths?: string[];
  list_paths?: string[];
  search_param?: string;
  overrides?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ScraperSite extends Site {
  enabled: boolean;
}

export interface Activity {
  id: string;
  date: string;
  scraper: string;
  status: "Success" | "Failed" | "Running";
}

export type ActivityLog = Activity;

export interface TopSite {
  id: string;
  site: string;
  scraper: string;
  records: number;
}

export interface Property {
  id?: string;
  title: string;
  price: number | string;
  price_per_sqm?: number;
  location: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  type?: string;
  source?: string;
  timestamp?: string;
  featured?: boolean;
  newListing?: boolean;
  openHouse?: boolean;
  // Additional fields from backend
  description?: string;
  image?: string;
  url?: string;
  site_key?: string;
  latitude?: number;
  longitude?: number;
  geocoded?: boolean;
}

export interface GlobalParameters {
  headless: boolean;
  maxPagesPerSite: number;
  geocoding: boolean;
  retryStrategy: string;
  proxyPool: string;
  exportFormat: string;
}

export interface FilterState {
  keyword: string;
  location: string;
  priceRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  propertyType: string;
  promoTags: string[];
  startDate: string;
  endDate: string;
  sourceSite: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  // TODO: align all API call sites to concrete types and remove default generic
  success?: boolean;
  error?: string;
  data?: T;
}

export interface ScrapeStatus {
  is_running: boolean;
  current_run?: {
    run_id: string;
    started_at: string;
    sites: string | string[];
    max_pages?: number | null;
    geocoding?: boolean | null;
    pid: number;
    completed_at?: string;
    return_code?: number;
    success?: boolean;
    stopped_at?: string;
    stopped_manually?: boolean;
    master_workbook_generated?: boolean;
    master_workbook_error?: string | null;
  };
  last_run?: {
    run_id: string;
    started_at: string;
    completed_at: string;
    sites: string | string[];
    max_pages?: number | null;
    geocoding?: boolean | null;
    pid: number;
    return_code: number;
    success: boolean;
    master_workbook_generated?: boolean;
    master_workbook_error?: string | null;
  } | null;
  site_metadata?: Record<
    string,
    {
      last_scrape: string;
      total_scrapes: number;
    }
  >;
}

export interface SiteListResponse {
  total: number;
  enabled: number;
  disabled: number;
  sites: Site[];
}

export interface DataResponse {
  site_key: string;
  source: string;
  total_records: number;
  returned_records: number;
  offset: number;
  limit: number;
  data: Property[];
}

export interface SearchResponse {
  query: string;
  fields: string[];
  total_results: number;
  results: Array<{
    site_key: string;
    data: Property;
  }>;
}

export interface StatsResponse {
  total_sites: number;
  enabled_sites: number;
  total_listings: number;
  recent_runs: number;
  success_rate: number;
  last_updated: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  site_key?: string;
}

export interface HistoryRun {
  run_id: string;
  started_at: string;
  completed_at?: string;
  sites: string | string[];
  max_pages?: number;
  geocoding?: boolean;
  pid: number;
  return_code?: number;
  success?: boolean;
}

export interface HistoryResponse {
  history: HistoryRun[];
  total: number;
  limit: number;
}

export interface SiteStat {
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

export interface TrendsPoint {
  date: string;
  total_records: number;
  successful_runs: number;
  failed_runs: number;
}

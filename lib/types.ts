// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: "Admin" | "Editor" | "Viewer";
//   status: "Active" | "Inactive";
//   lastLogin: string;
// }

// export interface Site {
//   site_key: string;
//   name: string;
//   url: string;
//   enabled: boolean;
//   parser: string;
//   selected?: boolean;
//   // Optional fields from backend
//   category?: string;
//   priority?: number;
//   notes?: string;
//   selectors?: Record<string, unknown>;
//   pagination?: Record<string, unknown>;
//   lagos_paths?: string[];
//   list_paths?: string[];
//   search_param?: string;
//   overrides?: Record<string, unknown>;
//   metadata?: Record<string, unknown>;
// }

// export interface ScraperSite extends Site {
//   enabled: boolean;
// }

// export interface Activity {
//   id: string;
//   date: string;
//   scraper: string;
//   status: "Success" | "Failed" | "Running";
// }

// export type ActivityLog = Activity;

// export interface TopSite {
//   id: string;
//   site: string;
//   scraper: string;
//   records: number;
// }

// export interface Property {
//   id?: string;
//   title: string;
//   price: number | string;
//   price_per_sqm?: number;
//   location: string;
//   bedrooms?: number | string;
//   bathrooms?: number | string;
//   type?: string;
//   source?: string;
//   timestamp?: string;
//   featured?: boolean;
//   newListing?: boolean;
//   openHouse?: boolean;
//   // Additional fields from backend
//   description?: string;
//   image?: string;
//   url?: string;
//   site_key?: string;
//   latitude?: number;
//   longitude?: number;
//   geocoded?: boolean;
// }

export interface GlobalParameters {
  headless: boolean;
  maxPagesPerSite: number;
  geocoding: boolean;
  retryStrategy: string;
  proxyPool: string;
  exportFormat: string;
}

// export interface FilterState {
//   keyword: string;
//   location: string;
//   priceRange: [number, number];
//   bedrooms: number[];
//   bathrooms: number[];
//   propertyType: string;
//   promoTags: string[];
//   startDate: string;
//   endDate: string;
//   sourceSite: string;
// }

// // API Response Types
// export interface ApiResponse<T = unknown> {
//   // TODO: align all API call sites to concrete types and remove default generic
//   success?: boolean;
//   error?: string;
//   data?: T;
// }

// export interface ScrapeStatus {
//   is_running: boolean;
//   current_run?: {
//     run_id: string;
//     started_at: string;
//     sites: string | string[];
//     max_pages?: number | null;
//     geocoding?: boolean | null;
//     pid: number;
//     completed_at?: string;
//     return_code?: number;
//     success?: boolean;
//     stopped_at?: string;
//     stopped_manually?: boolean;
//     master_workbook_generated?: boolean;
//     master_workbook_error?: string | null;
//   };
//   last_run?: {
//     run_id: string;
//     started_at: string;
//     completed_at: string;
//     sites: string | string[];
//     max_pages?: number | null;
//     geocoding?: boolean | null;
//     pid: number;
//     return_code: number;
//     success: boolean;
//     master_workbook_generated?: boolean;
//     master_workbook_error?: string | null;
//   } | null;
//   site_metadata?: Record<
//     string,
//     {
//       last_scrape: string;
//       total_scrapes: number;
//     }
//   >;
// }

export interface SiteListResponse {
  total: number;
  enabled: number;
  disabled: number;
  sites: Site[];
}

// export interface DataResponse {
//   site_key: string;
//   source: string;
//   total_records: number;
//   returned_records: number;
//   offset: number;
//   limit: number;
//   data: Property[];
// }

// export interface SearchResponse {
//   query: string;
//   fields: string[];
//   total_results: number;
//   results: Array<{
//     site_key: string;
//     data: Property;
//   }>;
// }

// export interface StatsResponse {
//   total_sites: number;
//   enabled_sites: number;
//   total_listings: number;
//   recent_runs: number;
//   success_rate: number;
//   last_updated: string;
// }

// export interface LogEntry {
//   timestamp: string;
//   level: string;
//   message: string;
//   site_key?: string;
// }

// export interface HistoryRun {
//   run_id: string;
//   started_at: string;
//   completed_at?: string;
//   sites: string | string[];
//   max_pages?: number;
//   geocoding?: boolean;
//   pid: number;
//   return_code?: number;
//   success?: boolean;
// }

// export interface HistoryResponse {
//   history: HistoryRun[];
//   total: number;
//   limit: number;
// }

// export interface SiteStat {
//   site_key: string;
//   name?: string;
//   total_scrapes?: number;
//   successful_scrapes?: number;
//   failed_scrapes?: number;
//   success_rate?: number;
//   avg_records_per_scrape?: number;
//   total_records?: number;
//   avg_scrape_duration?: number;
//   last_scrape?: string;
//   last_success?: string;
//   error_count?: number;
//   health_score?: number;
// }

// export interface TrendsPoint {
//   date: string;
//   total_records: number;
//   successful_runs: number;
//   failed_runs: number;
// }

/**
 * TypeScript Type Definitions for Nigerian Real Estate API
 * Auto-generated types for all 67 API endpoints
 */

// ============================================================================
// Core Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface DateRange {
  start_date?: string; // ISO 8601 format
  end_date?: string;
}

// ============================================================================
// Property Types
// ============================================================================

export interface Property {
  id?: string;
  hash?: string;
  title: string;
  price: number;
  price_formatted?: string;
  location: string;
  listing_url: string;
  source: string;
  scrape_timestamp: string;

  // Property Details
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  bq?: number; // Boys' Quarters
  land_size?: string;

  // Financial
  price_per_sqm?: number;
  price_per_bedroom?: number;
  initial_deposit?: number;
  payment_plan?: string;
  service_charge?: number;

  // Legal/Promo
  title_tag?: string;
  promo_tags?: string[];
  launch_timeline?: string;

  // Contact
  agent_name?: string;
  contact_info?: string;

  // Media
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Quality & Duplicates
  quality_score?: number;
  is_duplicate?: boolean;
  duplicate_of?: string;
}

// ============================================================================
// Site Types
// ============================================================================

export interface Site {
  site_key: string;
  name: string;
  url: string;
  enabled: boolean;
  parser?: string;
  selectors?: Record<string, string>;
  overrides?: Record<string, any>;
  last_scrape?: string;
  total_scraped?: number;
  success_rate?: number;
  notes?: string;
}

export interface SiteStats {
  site_key: string;
  name: string;
  total_listings: number;
  latest_scrape?: string;
  success_rate: number;
  average_price?: number;
  listings_24h?: number;
}

// ============================================================================
// Scraping Types
// ============================================================================

export interface ScrapeRequest {
  sites?: string[]; // Site keys to scrape, empty = all enabled
  max_pages?: number;
  headless?: boolean;
  geocode?: boolean;
}

export interface ScrapeStatus {
  status: "idle" | "running" | "stopping" | "stopped" | "completed" | "error";
  current_site?: string;
  sites_completed?: number;
  sites_total?: number;
  listings_found?: number;
  start_time?: string;
  estimated_completion?: string;
  progress_percentage?: number;
}

export interface ScrapeHistory {
  scrapes: ScrapeHistoryItem[];
  total: number;
}

export interface ScrapeHistoryItem {
  id: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  sites: string[];
  total_listings: number;
  status: "completed" | "failed" | "partial";
  error?: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface OverviewStats {
  overview: {
    total_sites: number;
    active_sites: number;
    total_listings: number;
    latest_scrape?: string;
  };
  files: {
    raw_files: number;
    cleaned_files: number;
    master_workbook_exists: boolean;
    master_workbook_size_mb?: number;
  };
}

export interface TrendStats {
  trends: {
    date: string;
    listings: number;
    sites: number;
    avg_price?: number;
  }[];
  summary: {
    total_days: number;
    avg_daily_listings: number;
    peak_day?: string;
    peak_listings?: number;
  };
}

// ============================================================================
// Search & Query Types
// ============================================================================

export interface SearchParams {
  query?: string;
  site?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface PropertyQuery {
  filters?: {
    property_type?: string | string[];
    bedrooms?: number | { min?: number; max?: number };
    bathrooms?: number | { min?: number; max?: number };
    price?: { min?: number; max?: number };
    location?: string | string[];
    has_images?: boolean;
    source?: string | string[];
  };
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
  pagination?: PaginationParams;
}

export interface QueryResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ============================================================================
// Saved Search Types
// ============================================================================

export interface SavedSearch {
  id: string;
  name: string;
  query: PropertyQuery;
  created_at: string;
  updated_at?: string;
  last_run?: string;
  result_count?: number;
  email_alerts?: boolean;
  alert_frequency?: "daily" | "weekly" | "immediate";
}

export interface SavedSearchStats {
  search_id: string;
  total_matches: number;
  new_matches_24h: number;
  new_matches_7d: number;
  avg_price: number;
  price_trend: "up" | "down" | "stable";
}

// ============================================================================
// Price Intelligence Types
// ============================================================================

export interface PriceHistory {
  property_id: string;
  history: {
    date: string;
    price: number;
    source: string;
  }[];
  current_price: number;
  original_price: number;
  price_change: number;
  price_change_percentage: number;
}

export interface PriceDrop {
  property: Property;
  original_price: number;
  current_price: number;
  drop_amount: number;
  drop_percentage: number;
  first_seen: string;
  last_seen: string;
}

export interface MarketTrends {
  overall: {
    avg_price: number;
    median_price: number;
    total_listings: number;
    price_trend: "up" | "down" | "stable";
  };
  by_property_type: {
    property_type: string;
    avg_price: number;
    count: number;
  }[];
  by_location: {
    location: string;
    avg_price: number;
    count: number;
  }[];
}

// ============================================================================
// Location Types
// ============================================================================

export interface LocationFilter {
  areas: string[];
  keywords: string[];
  strict_mode: boolean;
}

export interface LocationStats {
  total_checked: number;
  passed: number;
  filtered: number;
  pass_rate: number;
}

// ============================================================================
// Health & Monitoring Types
// ============================================================================

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks?: {
    database?: boolean;
    filesystem?: boolean;
    geocoding?: boolean;
  };
}

export interface SiteHealth {
  site_key: string;
  status: "healthy" | "warning" | "error";
  last_successful_scrape?: string;
  consecutive_failures: number;
  last_error?: string;
  uptime_percentage: number;
}

export interface HealthAlert {
  id: string;
  type: "error" | "warning" | "info";
  site_key?: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportRequest {
  format: "csv" | "xlsx" | "json" | "parquet";
  filters?: PropertyQuery["filters"];
  fields?: string[];
}

export interface ExportJob {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  format: string;
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size_bytes?: number;
  error?: string;
}

// ============================================================================
// GitHub Actions Types
// ============================================================================

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion?: "success" | "failure" | "cancelled";
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubArtifact {
  id: number;
  name: string;
  size_in_bytes: number;
  created_at: string;
  expired: boolean;
  download_url?: string;
}

// ============================================================================
// Scheduling Types
// ============================================================================

export interface ScheduleJob {
  job_id: number;
  schedule_time: string;
  sites: string[];
  max_pages?: number;
  status: "pending" | "running" | "completed" | "cancelled" | "failed";
  created_at: string;
  executed_at?: string;
  result?: ScrapeHistoryItem;
}

// ============================================================================
// Email Types
// ============================================================================

export interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  use_tls: boolean;
  from_email: string;
  from_name?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  alerts_enabled: boolean;
  alert_types: (
    | "scrape_complete"
    | "scrape_failed"
    | "new_listings"
    | "price_drops"
  )[];
}

// ============================================================================
// Validation Types
// ============================================================================

export interface URLValidation {
  url: string;
  valid: boolean;
  reason?: string;
}

export interface DuplicateDetection {
  listings: Property[];
  duplicates_found: number;
  groups: {
    hash: string;
    count: number;
    listings: Property[];
  }[];
}

export interface QualityScore {
  property: Property;
  score: number;
  max_score: number;
  breakdown: {
    has_price: number;
    has_location: number;
    has_property_type: number;
    has_bedrooms: number;
    has_images: number;
    has_contact: number;
    has_coordinates: number;
  };
}

// ============================================================================
// Log Types
// ============================================================================

export interface LogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  module?: string;
  site?: string;
}

export interface LogResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

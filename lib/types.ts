export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface Site {
  id: string;
  name: string;
  baseUrl: string;
  lastRun: string;
  status: "Completed" | "Failed" | "Running" | "Idle";
  selected?: boolean;
  enabled?: boolean;
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

export interface ActivityLog extends Activity {}

export interface TopSite {
  id: string;
  site: string;
  scraper: string;
  records: number;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  pricePerSqm: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: string;
  source: string;
  timestamp: string;
  featured?: boolean;
  newListing?: boolean;
  openHouse?: boolean;
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

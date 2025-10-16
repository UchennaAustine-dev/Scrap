// API service layer for backend integration
const API_BASE_URL =
  typeof window !== "undefined"
    ? (window as any).ENV?.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    : "http://localhost:5000";

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

// Health Check
export const healthCheck = () => apiRequest("/api/health");

// Scraping Management
export const scrapeApi = {
  start: (params: {
    sites?: string[];
    max_pages?: number;
    geocoding?: boolean;
  }) =>
    apiRequest("/api/scrape/start", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  status: () => apiRequest("/api/scrape/status"),

  stop: () => apiRequest("/api/scrape/stop", { method: "POST" }),

  history: (limit = 20) => apiRequest(`/api/scrape/history?limit=${limit}`),
};

// Site Management
export const sitesApi = {
  list: () => apiRequest("/api/sites"),

  get: (siteKey: string) => apiRequest(`/api/sites/${siteKey}`),

  create: (siteData: {
    site_key: string;
    name: string;
    url: string;
    enabled: boolean;
    parser?: string;
    selectors?: any;
  }) =>
    apiRequest("/api/sites", {
      method: "POST",
      body: JSON.stringify(siteData),
    }),

  update: (siteKey: string, updates: any) =>
    apiRequest(`/api/sites/${siteKey}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  delete: (siteKey: string) =>
    apiRequest(`/api/sites/${siteKey}`, {
      method: "DELETE",
    }),

  toggle: (siteKey: string) =>
    apiRequest(`/api/sites/${siteKey}/toggle`, {
      method: "PATCH",
    }),
};

// Data Management
export const dataApi = {
  listFiles: () => apiRequest("/api/data/sites"),

  getSiteData: (
    siteKey: string,
    options: {
      limit?: number;
      offset?: number;
      source?: "raw" | "cleaned";
    } = {}
  ) => {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.source) params.append("source", options.source);

    return apiRequest(`/api/data/sites/${siteKey}?${params.toString()}`);
  },

  getMasterData: (options: { limit?: number; site?: string } = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.site) params.append("site", options.site);

    return apiRequest(`/api/data/master?${params.toString()}`);
  },

  search: (
    query: string,
    options: { fields?: string[]; limit?: number } = {}
  ) => {
    const params = new URLSearchParams();
    params.append("query", query);
    if (options.fields) params.append("fields", options.fields.join(","));
    if (options.limit) params.append("limit", options.limit.toString());

    return apiRequest(`/api/data/search?${params.toString()}`);
  },
};

// Logs
export const logsApi = {
  getLogs: (options: { limit?: number; level?: string } = {}) => {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.level) params.append("level", options.level);

    return apiRequest(`/api/logs?${params.toString()}`);
  },

  getErrors: (limit = 50) => apiRequest(`/api/logs/errors?limit=${limit}`),

  getSiteLogs: (siteKey: string, limit = 100) =>
    apiRequest(`/api/logs/site/${siteKey}?limit=${limit}`),
};

// Statistics
export const statsApi = {
  getOverview: () => apiRequest("/api/stats/overview"),

  getSiteStats: () => apiRequest("/api/stats/sites"),

  getTrends: (days = 7) => apiRequest(`/api/stats/trends?days=${days}`),
};

export { ApiError };

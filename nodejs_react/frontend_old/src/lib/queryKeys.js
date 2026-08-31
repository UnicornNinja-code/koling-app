/**
 * Centralized Query Keys Factory for TanStack React Query v5.
 * Enables granular cache invalidation on targeted Socket.IO events and domain mutations.
 */
export const queryKeys = {
  auth: {
    all: ["auth"],
    me: () => ["auth", "me"],
  },
  users: {
    all: ["users"],
    list: (filters = {}) => ["users", "list", filters],
    detail: (id) => ["users", "detail", id],
  },
  zones: {
    all: ["zones"],
    list: (params = {}) => ["zones", "list", params],
    detail: (id) => ["zones", "detail", id],
    restrictions: () => ["zones", "restrictions"],
    scores: (id) => ["zones", "scores", id],
  },
  pois: {
    all: ["pois"],
    byZone: (zoneId) => ["pois", "zone", zoneId],
    pending: () => ["pois", "pending"],
    approvalLogs: () => ["pois", "approval-logs"],
  },
  weather: {
    all: ["weather"],
    byZone: (zoneId) => ["weather", "zone", zoneId],
    byHub: (cityName) => ["weather", "hub", cityName],
  },
  dss: {
    all: ["dss"],
    active: () => ["dss", "active"],
    recommendations: (params = {}) => ["dss", "recommendations", params],
    snapshots: (params = {}) => ["dss", "snapshots", params],
    snapshotDetail: (id) => ["dss", "snapshots", "detail", id],
    rawEvaluation: (zoneId, params = {}) => ["dss", "zones", zoneId, "raw-evaluation", params],
  },
  distribution: {
    all: ["distribution"],
    overview: () => ["distribution", "overview"],
    history: () => ["distribution", "history"],
  },
  armadas: {
    all: ["armadas"],
    available: () => ["armadas", "available"],
    detail: (id) => ["armadas", "detail", id],
  },
  riders: {
    all: ["riders"],
    session: () => ["riders", "session"],
    hubArmadas: () => ["riders", "hub-armadas"],
    mySales: (params = {}) => ["riders", "my-sales", params],
    myHistory: () => ["riders", "my-history"],
  },
  products: {
    all: ["products"],
    list: (params = {}) => ["products", "list", params],
    detail: (id) => ["products", "detail", id],
  },
  sales: {
    all: ["sales"],
    overview: (params = {}) => ["sales", "overview", params],
    history: (params = {}) => ["sales", "history", params],
    byZone: (zoneId, params = {}) => ["sales", "zone", zoneId, params],
    byRider: (riderId, params = {}) => ["sales", "rider", riderId, params],
  },
  dashboard: {
    all: ["dashboard"],
    summary: (range = "today") => ["dashboard", "summary", range],
    salesTrend: (range = "7d") => ["dashboard", "sales-trend", range],
    zonePerformance: (range = "30d") => ["dashboard", "zone-performance", range],
    productPerformance: (range = "30d") => ["dashboard", "product-performance", range],
  },
  audit: {
    all: ["audit"],
    logs: (params = {}) => ["audit", "logs", params],
  },
  cron: {
    all: ["cron"],
    jobs: () => ["cron", "jobs"],
  },
  operationalRules: {
    all: ["operationalRules"],
    list: () => ["operationalRules", "list"],
  },
};

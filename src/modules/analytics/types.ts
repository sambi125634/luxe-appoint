export interface ServiceProfit {
  serviceId: string;
  serviceName: string;
  price: number;
  materialCost: number;
  staffCostPerVisit: number;
  duration: number;
  trueProfitPerVisit: number;
  trueProfitPerHour: number;
  executionCount: number;
  hasMaterialData: boolean;
}

export interface ClientLTV {
  clientId: string;
  clientName: string;
  totalSpent: number;
  visitCount: number;
  acquisitionCost: number;
  source: string | null;
  ltvCacRatio: number;
  firstVisit: string | null;
  lastVisit: string | null;
}

export interface ProfitSummary {
  revenue: number;
  materialCosts: number;
  staffCosts: number;
  acquisitionCosts: number;
  trueProfit: number;
  trueMargin: number;
  hasMaterialData: boolean;
  hasStaffRates: boolean;
}

export interface CashflowPoint {
  date: string;
  label: string;
  scheduled: number;
  predicted: number;
  historical: number;
}

export const CAC_ESTIMATES: Record<string, number> = {
  facebook: 40,
  instagram: 35,
  google: 30,
  booksy: 25,
  tiktok: 45,
  polecenie: 0,
  referral: 0,
  walk_in: 0,
  organic: 0,
  website: 15,
  '': 10, // unknown source default
};

export const DEFAULT_HOURLY_RATE = 35;

export const INDUSTRY_BENCHMARKS = {
  trueMargin: 34,
  trueMarginTop25: 48,
  trueMarginBottom25: 18,
  materialCostPct: 14,
  materialCostTop25: 9,
  materialCostBottom25: 22,
  staffCostPct: 38,
  staffCostTop25: 30,
  staffCostBottom25: 48,
  avgRevenuePerVisit: 165,
  avgRevenuePerVisitTop25: 240,
  avgVisitsPerClient: 8.2,
  avgVisitsPerClientTop25: 14,
  clientRetentionRate: 58,
  clientRetentionTop25: 78,
  noShowRate: 12,
  noShowRateTop25: 5,
  avgTpPerHour: 85,
  avgTpPerHourTop25: 130,
  avgCAC: 28,
  avgCACTop25: 12,
};

export const SALON_SEGMENTS: Record<string, { label: string; trueMargin: number; avgRevenuePerVisit: number }> = {
  nails: { label: "Paznokcie i manicure", trueMargin: 38, avgRevenuePerVisit: 120 },
  face: { label: "Zabiegi twarzy", trueMargin: 42, avgRevenuePerVisit: 220 },
  hair: { label: "Fryzjerstwo", trueMargin: 28, avgRevenuePerVisit: 180 },
  beauty_mix: { label: "Mieszany beauty", trueMargin: 34, avgRevenuePerVisit: 165 },
  aesthetic: { label: "Medycyna estetyczna", trueMargin: 52, avgRevenuePerVisit: 450 },
};

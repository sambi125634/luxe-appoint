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
  materialCostPct: 14,
  staffCostPct: 38,
  avgTpPerHour: 85,
};

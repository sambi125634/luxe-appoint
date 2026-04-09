import { ServiceProfit, ClientLTV, ProfitSummary } from './types';

// Dane spójne z recepturami demo w ServiceRecipes.tsx (Med-Spa Atelier Beauty Studio)
const demoServices: ServiceProfit[] = [
  { serviceId: 's1', serviceName: 'Mezoterapia igłowa twarzy', price: 450, materialCost: 119, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 296, trueProfitPerHour: 296, executionCount: 18, hasMaterialData: true },
  { serviceId: 's2', serviceName: 'HIFU – lifting bez skalpela', price: 1200, materialCost: 4.16, staffCostPerVisit: 52.5, duration: 90, trueProfitPerVisit: 1143.34, trueProfitPerHour: 762.2, executionCount: 6, hasMaterialData: true },
  { serviceId: 's3', serviceName: 'Peeling chemiczny TCA', price: 350, materialCost: 23.1, staffCostPerVisit: 26.25, duration: 45, trueProfitPerVisit: 300.65, trueProfitPerHour: 400.9, executionCount: 14, hasMaterialData: true },
  { serviceId: 's4', serviceName: 'Manicure hybrydowy premium', price: 180, materialCost: 9.72, staffCostPerVisit: 43.75, duration: 75, trueProfitPerVisit: 126.53, trueProfitPerHour: 101.2, executionCount: 38, hasMaterialData: true },
  { serviceId: 's5', serviceName: 'Drenaż limfatyczny – pełny', price: 280, materialCost: 5, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 240, trueProfitPerHour: 240, executionCount: 12, hasMaterialData: true },
  { serviceId: 's6', serviceName: 'Modelowanie brwi z henną', price: 150, materialCost: 12, staffCostPerVisit: 17.5, duration: 30, trueProfitPerVisit: 120.5, trueProfitPerHour: 241, executionCount: 28, hasMaterialData: true },
  { serviceId: 's7', serviceName: 'Masaż twarzy kobido', price: 220, materialCost: 8, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 177, trueProfitPerHour: 177, executionCount: 10, hasMaterialData: true },
  { serviceId: 's8', serviceName: 'Oczyszczanie wodorowe', price: 280, materialCost: 32, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 213, trueProfitPerHour: 213, executionCount: 15, hasMaterialData: true },
];

const demoClients: ClientLTV[] = [
  { clientId: 'c1', clientName: 'Anna Kowalska', totalSpent: 12400, visitCount: 24, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 354, firstVisit: '2024-03-15', lastVisit: '2026-03-10' },
  { clientId: 'c2', clientName: 'Katarzyna Nowak', totalSpent: 9800, visitCount: 18, acquisitionCost: 40, source: 'facebook', ltvCacRatio: 245, firstVisit: '2024-06-01', lastVisit: '2026-03-08' },
  { clientId: 'c3', clientName: 'Magdalena Wiśniewska', totalSpent: 7200, visitCount: 16, acquisitionCost: 0, source: 'polecenie', ltvCacRatio: Infinity, firstVisit: '2024-07-20', lastVisit: '2026-03-05' },
  { clientId: 'c4', clientName: 'Joanna Wójcik', totalSpent: 6500, visitCount: 14, acquisitionCost: 30, source: 'google', ltvCacRatio: 216.7, firstVisit: '2024-09-10', lastVisit: '2026-03-01' },
  { clientId: 'c5', clientName: 'Agnieszka Kamińska', totalSpent: 5800, visitCount: 12, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 165.7, firstVisit: '2024-11-05', lastVisit: '2026-02-28' },
  { clientId: 'c6', clientName: 'Monika Lewandowska', totalSpent: 4900, visitCount: 11, acquisitionCost: 0, source: 'polecenie', ltvCacRatio: Infinity, firstVisit: '2025-01-12', lastVisit: '2026-03-09' },
  { clientId: 'c7', clientName: 'Natalia Zielińska', totalSpent: 4200, visitCount: 10, acquisitionCost: 45, source: 'tiktok', ltvCacRatio: 93.3, firstVisit: '2025-02-18', lastVisit: '2026-03-07' },
  { clientId: 'c8', clientName: 'Ewa Szymańska', totalSpent: 3600, visitCount: 9, acquisitionCost: 40, source: 'facebook', ltvCacRatio: 90, firstVisit: '2025-03-01', lastVisit: '2026-03-04' },
  { clientId: 'c9', clientName: 'Izabela Woźniak', totalSpent: 3100, visitCount: 8, acquisitionCost: 30, source: 'google', ltvCacRatio: 103.3, firstVisit: '2025-04-15', lastVisit: '2026-02-25' },
  { clientId: 'c10', clientName: 'Aleksandra Dąbrowska', totalSpent: 2600, visitCount: 7, acquisitionCost: 0, source: 'walk_in', ltvCacRatio: Infinity, firstVisit: '2025-05-20', lastVisit: '2026-03-06' },
  { clientId: 'c11', clientName: 'Paulina Kozłowska', totalSpent: 2100, visitCount: 6, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 60, firstVisit: '2025-07-08', lastVisit: '2026-02-20' },
  { clientId: 'c12', clientName: 'Marta Jankowska', totalSpent: 1400, visitCount: 4, acquisitionCost: 25, source: 'booksy', ltvCacRatio: 56, firstVisit: '2025-10-01', lastVisit: '2026-03-02' },
];

// Dzisiejszy dzień — 5 zabiegów: mezoterapia, HIFU, peeling TCA, manicure, drenaż
const demoTodaySummary: ProfitSummary = {
  revenue: 2460,        // 450 + 1200 + 350 + 180 + 280
  materialCosts: 161,   // 119 + 4.16 + 23.1 + 9.72 + 5
  staffCosts: 192.5,    // 35 + 52.5 + 26.25 + 43.75 + 35
  acquisitionCosts: 25,
  trueProfit: 2081.5,
  trueMargin: 84.6,
  hasMaterialData: true,
  hasStaffRates: true,
};

// Miesiąc — ~141 zabiegów (suma executionCount)
const demoMonthlySummary: ProfitSummary = {
  revenue: 42_860,
  materialCosts: 3_420,
  staffCosts: 14_280,
  acquisitionCosts: 1_650,
  trueProfit: 23_510,
  trueMargin: 54.8,
  hasMaterialData: true,
  hasStaffRates: true,
};

const demoPrevMonthlySummary: ProfitSummary = {
  revenue: 38_200,
  materialCosts: 3_100,
  staffCosts: 12_800,
  acquisitionCosts: 1_520,
  trueProfit: 20_780,
  trueMargin: 54.4,
  hasMaterialData: true,
  hasStaffRates: true,
};

export function getDemoTrueProfitData() {
  return {
    todaySummary: demoTodaySummary,
    monthlySummary: demoMonthlySummary,
    prevMonthlySummary: demoPrevMonthlySummary,
    monthOverMonthChange: 13.1,
    bestServiceToday: { name: 'HIFU – lifting bez skalpela', tpPerHour: 762 },
    serviceProfits: demoServices,
    clientLTVs: demoClients,
    hasMaterialData: true,
    hasStaffRates: true,
    salonId: 'demo-salon-id',
  };
}

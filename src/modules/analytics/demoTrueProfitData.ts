import { ServiceProfit, ClientLTV, ProfitSummary } from './types';

const demoServices: ServiceProfit[] = [
  { serviceId: 's1', serviceName: 'Mezoterapia igłowa', price: 350, materialCost: 42, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 273, trueProfitPerHour: 273, executionCount: 18, hasMaterialData: true },
  { serviceId: 's2', serviceName: 'Laser frakcyjny', price: 500, materialCost: 85, staffCostPerVisit: 52.5, duration: 90, trueProfitPerVisit: 362.5, trueProfitPerHour: 241.7, executionCount: 8, hasMaterialData: true },
  { serviceId: 's3', serviceName: 'Peeling chemiczny', price: 200, materialCost: 28, staffCostPerVisit: 26.25, duration: 45, trueProfitPerVisit: 145.75, trueProfitPerHour: 194.3, executionCount: 22, hasMaterialData: true },
  { serviceId: 's4', serviceName: 'Oczyszczanie wodorowe', price: 280, materialCost: 35, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 210, trueProfitPerHour: 210, executionCount: 15, hasMaterialData: true },
  { serviceId: 's5', serviceName: 'Mikrodermabrazja', price: 180, materialCost: 15, staffCostPerVisit: 26.25, duration: 45, trueProfitPerVisit: 138.75, trueProfitPerHour: 185, executionCount: 20, hasMaterialData: true },
  { serviceId: 's6', serviceName: 'Modelowanie brwi', price: 150, materialCost: 12, staffCostPerVisit: 17.5, duration: 30, trueProfitPerVisit: 120.5, trueProfitPerHour: 241, executionCount: 35, hasMaterialData: true },
  { serviceId: 's7', serviceName: 'Manicure hybrydowy', price: 120, materialCost: 18, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 67, trueProfitPerHour: 67, executionCount: 45, hasMaterialData: true },
  { serviceId: 's8', serviceName: 'Masaż twarzy kobido', price: 220, materialCost: 8, staffCostPerVisit: 35, duration: 60, trueProfitPerVisit: 177, trueProfitPerHour: 177, executionCount: 12, hasMaterialData: true },
];

const demoClients: ClientLTV[] = [
  { clientId: 'c1', clientName: 'Anna Kowalska', totalSpent: 8400, visitCount: 24, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 240, firstVisit: '2024-03-15', lastVisit: '2026-03-10' },
  { clientId: 'c2', clientName: 'Katarzyna Nowak', totalSpent: 6200, visitCount: 18, acquisitionCost: 40, source: 'facebook', ltvCacRatio: 155, firstVisit: '2024-06-01', lastVisit: '2026-03-08' },
  { clientId: 'c3', clientName: 'Magdalena Wiśniewska', totalSpent: 5800, visitCount: 16, acquisitionCost: 0, source: 'polecenie', ltvCacRatio: Infinity, firstVisit: '2024-07-20', lastVisit: '2026-03-05' },
  { clientId: 'c4', clientName: 'Joanna Wójcik', totalSpent: 4900, visitCount: 14, acquisitionCost: 30, source: 'google', ltvCacRatio: 163.3, firstVisit: '2024-09-10', lastVisit: '2026-03-01' },
  { clientId: 'c5', clientName: 'Agnieszka Kamińska', totalSpent: 4200, visitCount: 12, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 120, firstVisit: '2024-11-05', lastVisit: '2026-02-28' },
  { clientId: 'c6', clientName: 'Monika Lewandowska', totalSpent: 3800, visitCount: 11, acquisitionCost: 0, source: 'polecenie', ltvCacRatio: Infinity, firstVisit: '2025-01-12', lastVisit: '2026-03-09' },
  { clientId: 'c7', clientName: 'Natalia Zielińska', totalSpent: 3500, visitCount: 10, acquisitionCost: 45, source: 'tiktok', ltvCacRatio: 77.8, firstVisit: '2025-02-18', lastVisit: '2026-03-07' },
  { clientId: 'c8', clientName: 'Ewa Szymańska', totalSpent: 3100, visitCount: 9, acquisitionCost: 40, source: 'facebook', ltvCacRatio: 77.5, firstVisit: '2025-03-01', lastVisit: '2026-03-04' },
  { clientId: 'c9', clientName: 'Izabela Woźniak', totalSpent: 2800, visitCount: 8, acquisitionCost: 30, source: 'google', ltvCacRatio: 93.3, firstVisit: '2025-04-15', lastVisit: '2026-02-25' },
  { clientId: 'c10', clientName: 'Aleksandra Dąbrowska', totalSpent: 2400, visitCount: 7, acquisitionCost: 0, source: 'walk_in', ltvCacRatio: Infinity, firstVisit: '2025-05-20', lastVisit: '2026-03-06' },
  { clientId: 'c11', clientName: 'Paulina Kozłowska', totalSpent: 1900, visitCount: 6, acquisitionCost: 35, source: 'instagram', ltvCacRatio: 54.3, firstVisit: '2025-07-08', lastVisit: '2026-02-20' },
  { clientId: 'c12', clientName: 'Marta Jankowska', totalSpent: 1200, visitCount: 4, acquisitionCost: 25, source: 'booksy', ltvCacRatio: 48, firstVisit: '2025-10-01', lastVisit: '2026-03-02' },
];

const demoTodaySummary: ProfitSummary = {
  revenue: 1840,
  materialCosts: 185,
  staffCosts: 245,
  acquisitionCosts: 30,
  trueProfit: 1380,
  trueMargin: 75,
  hasMaterialData: true,
  hasStaffRates: true,
};

const demoMonthlySummary: ProfitSummary = {
  revenue: 38500,
  materialCosts: 4200,
  staffCosts: 12600,
  acquisitionCosts: 1850,
  trueProfit: 19850,
  trueMargin: 51.6,
  hasMaterialData: true,
  hasStaffRates: true,
};

const demoPrevMonthlySummary: ProfitSummary = {
  revenue: 34200,
  materialCosts: 3800,
  staffCosts: 11400,
  acquisitionCosts: 1720,
  trueProfit: 17280,
  trueMargin: 50.5,
  hasMaterialData: true,
  hasStaffRates: true,
};

export function getDemoTrueProfitData() {
  return {
    todaySummary: demoTodaySummary,
    monthlySummary: demoMonthlySummary,
    prevMonthlySummary: demoPrevMonthlySummary,
    monthOverMonthChange: 14.9,
    bestServiceToday: { name: 'Mezoterapia igłowa', tpPerHour: 273 },
    serviceProfits: demoServices,
    clientLTVs: demoClients,
    hasMaterialData: true,
    hasStaffRates: true,
    salonId: 'demo-salon-id',
  };
}

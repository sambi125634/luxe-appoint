// CSV Export utilities for salon reports

interface ExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export function exportToCSV({ filename, headers, rows }: ExportOptions): void {
  // Add BOM for proper Polish character encoding in Excel
  const BOM = '\uFEFF';
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing semicolons or quotes
      const cellStr = String(cell);
      if (cellStr.includes(';') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(';'))
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Appointment export
export interface AppointmentExportData {
  date: string;
  time: string;
  client: string;
  service: string;
  staff: string;
  status: string;
  revenue: number;
}

export function exportAppointments(data: AppointmentExportData[]): void {
  exportToCSV({
    filename: 'wizyty',
    headers: ['Data', 'Godzina', 'Klient', 'Usługa', 'Pracownik', 'Status', 'Przychód (zł)'],
    rows: data.map(d => [d.date, d.time, d.client, d.service, d.staff, d.status, d.revenue])
  });
}

// Services summary export
export interface ServiceExportData {
  name: string;
  bookings: number;
  revenue: number;
  avgPrice: number;
}

export function exportServices(data: ServiceExportData[]): void {
  exportToCSV({
    filename: 'uslugi_raport',
    headers: ['Usługa', 'Liczba rezerwacji', 'Przychód (zł)', 'Średnia cena (zł)'],
    rows: data.map(d => [d.name, d.bookings, d.revenue, d.avgPrice])
  });
}

// Staff summary export
export interface StaffExportData {
  name: string;
  appointments: number;
  revenue: number;
  occupancy: number;
  noShows: number;
}

export function exportStaff(data: StaffExportData[]): void {
  exportToCSV({
    filename: 'personel_raport',
    headers: ['Pracownik', 'Liczba wizyt', 'Przychód (zł)', 'Obłożenie (%)', 'No-shows'],
    rows: data.map(d => [d.name, d.appointments, d.revenue, d.occupancy, d.noShows])
  });
}

// No-shows export
export interface NoShowExportData {
  date: string;
  client: string;
  phone: string;
  service: string;
  staff: string;
}

export function exportNoShows(data: NoShowExportData[]): void {
  exportToCSV({
    filename: 'no_shows',
    headers: ['Data', 'Klient', 'Telefon', 'Usługa', 'Pracownik'],
    rows: data.map(d => [d.date, d.client, d.phone, d.service, d.staff])
  });
}

// Full report export
export function exportFullReport(
  appointments: AppointmentExportData[],
  services: ServiceExportData[],
  staff: StaffExportData[],
  dateRange: { from: string; to: string }
): void {
  const totalRevenue = appointments.reduce((sum, a) => sum + a.revenue, 0);
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'confirmed').length;
  
  exportToCSV({
    filename: 'pelny_raport',
    headers: ['Metryka', 'Wartość'],
    rows: [
      ['Okres raportu', `${dateRange.from} - ${dateRange.to}`],
      ['', ''],
      ['=== PODSUMOWANIE ===', ''],
      ['Łączna liczba wizyt', totalAppointments],
      ['Zrealizowane wizyty', completedAppointments],
      ['Łączny przychód (zł)', totalRevenue],
      ['', ''],
      ['=== TOP 5 USŁUG ===', ''],
      ...services.slice(0, 5).map((s, i) => [`${i + 1}. ${s.name}`, `${s.bookings} rezerwacji, ${s.revenue} zł`]),
      ['', ''],
      ['=== TOP 5 PRACOWNIKÓW ===', ''],
      ...staff.slice(0, 5).map((s, i) => [`${i + 1}. ${s.name}`, `${s.appointments} wizyt, ${s.revenue} zł`]),
    ]
  });
}

// Product sales export
export interface ProductExportData {
  date: string;
  productName: string;
  category: string;
  brand: string;
  sku: string;
  quantity: number;
  unitPriceGross: number;
  totalGross: number;
  vatRate: number;
  vatAmount: number;
  profit: number;
  staffName: string;
  clientName: string;
  paymentMethod: string;
}

export function exportProductSales(data: ProductExportData[]): void {
  exportToCSV({
    filename: 'sprzedaz_produktow',
    headers: [
      'Data', 
      'Produkt', 
      'Kategoria', 
      'Marka', 
      'SKU', 
      'Ilość', 
      'Cena jedn. brutto (zł)', 
      'Razem brutto (zł)', 
      'Stawka VAT (%)', 
      'VAT (zł)', 
      'Zysk (zł)', 
      'Pracownik', 
      'Klient',
      'Metoda płatności'
    ],
    rows: data.map(d => [
      d.date, 
      d.productName, 
      d.category, 
      d.brand, 
      d.sku, 
      d.quantity, 
      d.unitPriceGross, 
      d.totalGross, 
      d.vatRate, 
      d.vatAmount, 
      d.profit, 
      d.staffName,
      d.clientName,
      d.paymentMethod
    ])
  });
}

// Employee commissions export
export interface CommissionExportData {
  staffName: string;
  servicesGross: number;
  productsGross: number;
  tipsTotal: number;
  commissionServices: number;
  commissionProducts: number;
  totalCommission: number;
  totalPayout: number;
}

export function exportEmployeeCommissions(data: CommissionExportData[]): void {
  const totals = data.reduce(
    (acc, d) => ({
      servicesGross: acc.servicesGross + d.servicesGross,
      productsGross: acc.productsGross + d.productsGross,
      tipsTotal: acc.tipsTotal + d.tipsTotal,
      commissionServices: acc.commissionServices + d.commissionServices,
      commissionProducts: acc.commissionProducts + d.commissionProducts,
      totalCommission: acc.totalCommission + d.totalCommission,
      totalPayout: acc.totalPayout + d.totalPayout,
    }),
    { servicesGross: 0, productsGross: 0, tipsTotal: 0, commissionServices: 0, commissionProducts: 0, totalCommission: 0, totalPayout: 0 }
  );

  exportToCSV({
    filename: 'prowizje_pracownikow',
    headers: [
      'Pracownik',
      'Usługi brutto (zł)',
      'Produkty brutto (zł)',
      'Napiwki (zł)',
      'Prowizja od usług (zł)',
      'Prowizja od produktów (zł)',
      'Prowizja łącznie (zł)',
      'Do wypłaty (zł)'
    ],
    rows: [
      ...data.map(d => [
        d.staffName,
        d.servicesGross,
        d.productsGross,
        d.tipsTotal,
        d.commissionServices,
        d.commissionProducts,
        d.totalCommission,
        d.totalPayout
      ]),
      ['', '', '', '', '', '', '', ''],
      [
        'SUMA',
        totals.servicesGross,
        totals.productsGross,
        totals.tipsTotal,
        totals.commissionServices,
        totals.commissionProducts,
        totals.totalCommission,
        totals.totalPayout
      ]
    ]
  });
}

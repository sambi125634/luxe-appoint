export interface Transaction {
  id: string;
  salonId: string;
  dateTime: string;
  clientId: string | null;
  clientName: string | null;
  staffId: string | null;
  staffName: string | null;
  locationId: string | null;
  itemType: "usługa" | "produkt";
  itemCategory: string;
  itemName: string;
  quantity: number;
  unitPriceBrutto: number;
  discountAmount: number;
  vatRate: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  paymentMethod: "gotówka" | "karta" | "online" | "voucher" | "depozyt";
  tipAmount: number;
  relatedVoucherId: string | null;
  status: "opłacone" | "anulowane";
}

export interface DailyClosing {
  id: string;
  salonId: string;
  date: string;
  totalServicesGross: number;
  totalProductsGross: number;
  totalTips: number;
  cashGross: number;
  cardGross: number;
  onlineGross: number;
  voucherGross: number;
  depositGross: number;
  expectedCashInDrawer: number;
  actualCashInDrawer: number | null;
  cashDifference: number | null;
  closedByUserId: string | null;
  closedByUserName: string | null;
  closedAt: string | null;
  status: "otwarte" | "zamknięte";
}

export interface EmployeeCommission {
  id: string;
  salonId: string;
  staffId: string;
  staffName: string;
  staffAvatar: string | null;
  periodStart: string;
  periodEnd: string;
  servicesGross: number;
  productsGross: number;
  tipsTotal: number;
  commissionServices: number;
  commissionProducts: number;
  totalCommission: number;
  totalPayout: number;
}

export interface Voucher {
  id: string;
  salonId: string;
  code: string;
  type: "voucher kwotowy" | "voucher zabiegowy" | "pakiet";
  clientId: string | null;
  clientName: string | null;
  issueDate: string;
  expiryDate: string | null;
  originalValue: number;
  remainingValue: number;
  currency: string;
  status: "aktywny" | "wykorzystany" | "wygasły";
}

export interface AccountingExport {
  id: string;
  salonId: string;
  generatedByUserId: string;
  generatedByUserName: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  type: "pełny" | "sprzedaż VAT" | "prowizje" | "vouchery";
  format: "csv" | "xlsx" | "pdf";
  targetEmail: string | null;
  downloadUrl: string | null;
}

export interface AccountingFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  location: string | null;
  reportType: "daily" | "sales" | "commissions" | "vouchers";
}

export interface VatSummary {
  rate: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
}

export interface PaymentMethodSummary {
  method: string;
  transactionCount: number;
  totalGross: number;
}

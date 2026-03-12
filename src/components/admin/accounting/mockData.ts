import { Transaction, DailyClosing, EmployeeCommission, Voucher, AccountingExport } from "./types";
import { format, subDays } from "date-fns";

// Helper to generate dates relative to today
const today = new Date();
const d = (daysAgo: number, time: string = "12:00:00") => {
  const date = subDays(today, daysAgo);
  return `${format(date, "yyyy-MM-dd")}T${time}`;
};
const dd = (daysAgo: number) => format(subDays(today, daysAgo), "yyyy-MM-dd");

// Deterministic pseudo-random number generator (seed-based for stable renders)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randBetween = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

// Data pools
const staffPool = [
  { id: "s1", name: "Maria Kowalczyk" },
  { id: "s2", name: "Aleksandra Wiśniewska" },
  { id: "s3", name: "Natalia Kamińska" },
];

const clientPool = [
  { id: "c1", name: "Anna Kowalska" },
  { id: "c2", name: "Katarzyna Nowak" },
  { id: "c3", name: "Magdalena Wiśniewska" },
  { id: "c4", name: "Joanna Lewandowska" },
  { id: "c5", name: "Ewa Dąbrowska" },
  { id: "c6", name: "Monika Zielińska" },
  { id: "c7", name: "Agnieszka Szymańska" },
  { id: "c8", name: "Barbara Woźniak" },
  { id: "c9", name: "Dorota Kaczmarek" },
  { id: "c10", name: "Patrycja Piotrowska" },
  { id: "c11", name: "Karolina Jankowska" },
  { id: "c12", name: "Izabela Mazur" },
  { id: "c13", name: "Sylwia Krawczyk" },
  { id: "c14", name: "Justyna Wójcik" },
  { id: "c15", name: "Renata Kubiak" },
  { id: "c16", name: "Marta Pawlak" },
  { id: "c17", name: "Beata Michalska" },
  { id: "c18", name: "Paulina Adamczyk" },
  { id: "c19", name: "Weronika Stępień" },
  { id: "c20", name: "Natalia Głowacka" },
];

interface ServiceItem {
  category: string;
  name: string;
  price: number;
  vatRate: number;
  type: "usługa" | "produkt";
}

const serviceItems: ServiceItem[] = [
  { category: "Twarz", name: "Mezoterapia twarzy", price: 350, vatRate: 23, type: "usługa" },
  { category: "Twarz", name: "Peeling kawitacyjny", price: 150, vatRate: 23, type: "usługa" },
  { category: "Twarz", name: "Oczyszczanie manualne", price: 180, vatRate: 23, type: "usługa" },
  { category: "Twarz", name: "Lifting RF twarzy", price: 500, vatRate: 23, type: "usługa" },
  { category: "Twarz", name: "Mikrodermabrazja", price: 200, vatRate: 23, type: "usługa" },
  { category: "Ciało", name: "Masaż relaksacyjny 60min", price: 200, vatRate: 8, type: "usługa" },
  { category: "Ciało", name: "Drenaż limfatyczny", price: 280, vatRate: 8, type: "usługa" },
  { category: "Ciało", name: "Masaż gorącymi kamieniami", price: 250, vatRate: 8, type: "usługa" },
  { category: "Ciało", name: "Body wrapping", price: 220, vatRate: 8, type: "usługa" },
  { category: "Depilacja", name: "Depilacja laserowa - nogi", price: 450, vatRate: 23, type: "usługa" },
  { category: "Depilacja", name: "Depilacja woskiem - bikini", price: 120, vatRate: 23, type: "usługa" },
  { category: "Depilacja", name: "Depilacja laserowa - pachy", price: 180, vatRate: 23, type: "usługa" },
  { category: "Paznokcie", name: "Manicure hybrydowy", price: 130, vatRate: 23, type: "usługa" },
  { category: "Paznokcie", name: "Pedicure spa", price: 160, vatRate: 23, type: "usługa" },
  { category: "Brwi & Rzęsy", name: "Laminacja brwi", price: 140, vatRate: 23, type: "usługa" },
  { category: "Brwi & Rzęsy", name: "Przedłużanie rzęs 1:1", price: 250, vatRate: 23, type: "usługa" },
];

const productItems: ServiceItem[] = [
  { category: "Kosmetyki", name: "Serum witaminowe C", price: 120, vatRate: 23, type: "produkt" },
  { category: "Kosmetyki", name: "Krem nawilżający premium", price: 189, vatRate: 23, type: "produkt" },
  { category: "Kosmetyki", name: "Tonik oczyszczający", price: 65, vatRate: 23, type: "produkt" },
  { category: "Kosmetyki", name: "Maska algowa", price: 45, vatRate: 23, type: "produkt" },
  { category: "Pielęgnacja", name: "Olejek do ciała", price: 85, vatRate: 23, type: "produkt" },
  { category: "Pielęgnacja", name: "Peeling cukrowy", price: 55, vatRate: 23, type: "produkt" },
  { category: "Pielęgnacja", name: "Odżywka do paznokci", price: 35, vatRate: 23, type: "produkt" },
];

const paymentMethods: Transaction["paymentMethod"][] = ["gotówka", "karta", "online", "voucher"];
const hours = ["09:00:00", "09:30:00", "10:00:00", "10:30:00", "11:00:00", "11:30:00", "12:00:00", "12:30:00", "13:00:00", "13:30:00", "14:00:00", "14:30:00", "15:00:00", "15:30:00", "16:00:00", "16:30:00", "17:00:00", "17:30:00", "18:00:00", "18:30:00"];

// Generate ~150 transactions over 90 days
function generateTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  let txId = 1;

  for (let daysAgo = 0; daysAgo <= 89; daysAgo++) {
    const date = subDays(today, daysAgo);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

    // Skip Sundays
    if (dayOfWeek === 0) continue;

    // Determine number of transactions: weekends (Sat) slightly less, weekdays vary
    let txCount: number;
    if (dayOfWeek === 6) {
      txCount = randBetween(1, 3); // Saturday: fewer
    } else if (dayOfWeek === 5 || dayOfWeek === 4) {
      txCount = randBetween(2, 4); // Thu-Fri: busier
    } else {
      txCount = randBetween(1, 3); // Mon-Wed: moderate
    }

    for (let i = 0; i < txCount; i++) {
      const isProduct = rand() < 0.2; // 20% product sales
      const item = isProduct ? pick(productItems) : pick(serviceItems);
      const staff = pick(staffPool);
      const client = pick(clientPool);
      const time = pick(hours);
      const quantity = isProduct ? randBetween(1, 3) : 1;
      const hasDiscount = rand() < 0.12;
      const discountAmount = hasDiscount ? Math.round(item.price * 0.1) : 0;
      const grossAmount = item.price * quantity - discountAmount;
      const netAmount = grossAmount / (1 + item.vatRate / 100);
      const vatAmount = grossAmount - netAmount;
      const hasTip = !isProduct && rand() < 0.4;
      const tipAmount = hasTip ? pick([10, 15, 20, 25, 30, 40, 50]) : 0;
      const isCancelled = rand() < 0.04; // ~4% cancelled
      const method = pick(paymentMethods);

      transactions.push({
        id: `t${txId++}`,
        salonId: "demo",
        dateTime: d(daysAgo, time),
        clientId: client.id,
        clientName: client.name,
        staffId: staff.id,
        staffName: staff.name,
        locationId: null,
        itemType: item.type,
        itemCategory: item.category,
        itemName: item.name,
        quantity,
        unitPriceBrutto: item.price,
        discountAmount,
        vatRate: item.vatRate,
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount,
        paymentMethod: method,
        tipAmount,
        relatedVoucherId: method === "voucher" ? "v1" : null,
        status: isCancelled ? "anulowane" : "opłacone",
      });
    }
  }

  return transactions;
}

export const mockTransactions: Transaction[] = generateTransactions();

// Generate daily closings from transactions
function generateDailyClosings(): DailyClosing[] {
  const closings: DailyClosing[] = [];
  const byDate = new Map<string, Transaction[]>();

  for (const tx of mockTransactions) {
    const date = tx.dateTime.split("T")[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(tx);
  }

  let dcId = 1;
  const sortedDates = [...byDate.keys()].sort().reverse();

  for (const date of sortedDates) {
    const txs = byDate.get(date)!.filter(t => t.status === "opłacone");
    const servicesGross = txs.filter(t => t.itemType === "usługa").reduce((s, t) => s + t.grossAmount, 0);
    const productsGross = txs.filter(t => t.itemType === "produkt").reduce((s, t) => s + t.grossAmount, 0);
    const tips = txs.reduce((s, t) => s + t.tipAmount, 0);
    const cash = txs.filter(t => t.paymentMethod === "gotówka").reduce((s, t) => s + t.grossAmount, 0);
    const card = txs.filter(t => t.paymentMethod === "karta").reduce((s, t) => s + t.grossAmount, 0);
    const online = txs.filter(t => t.paymentMethod === "online").reduce((s, t) => s + t.grossAmount, 0);
    const voucher = txs.filter(t => t.paymentMethod === "voucher").reduce((s, t) => s + t.grossAmount, 0);
    const daysAgo = Math.round((today.getTime() - new Date(date).getTime()) / 86400000);
    const isClosed = daysAgo > 0;

    closings.push({
      id: `dc${dcId++}`,
      salonId: "demo",
      date,
      totalServicesGross: servicesGross,
      totalProductsGross: productsGross,
      totalTips: tips,
      cashGross: cash,
      cardGross: card,
      onlineGross: online,
      voucherGross: voucher,
      depositGross: 0,
      expectedCashInDrawer: cash + tips,
      actualCashInDrawer: isClosed ? cash + tips + (rand() > 0.5 ? randBetween(-5, 5) : 0) : null,
      cashDifference: isClosed ? randBetween(-5, 5) : null,
      closedByUserId: isClosed ? "u1" : null,
      closedByUserName: isClosed ? "Admin" : null,
      closedAt: isClosed ? `${date}T21:00:00` : null,
      status: isClosed ? "zamknięte" : "otwarte",
    });
  }

  return closings;
}

export const mockDailyClosings: DailyClosing[] = generateDailyClosings();

export const mockEmployeeCommissions: EmployeeCommission[] = [
  {
    id: "ec1",
    salonId: "demo",
    staffId: "s1",
    staffName: "Maria Kowalczyk",
    staffAvatar: null,
    periodStart: dd(30),
    periodEnd: dd(0),
    servicesGross: 4850,
    productsGross: 720,
    tipsTotal: 280,
    commissionServices: 1455,
    commissionProducts: 72,
    totalCommission: 1527,
    totalPayout: 1807
  },
  {
    id: "ec2",
    salonId: "demo",
    staffId: "s2",
    staffName: "Aleksandra Wiśniewska",
    staffAvatar: null,
    periodStart: dd(30),
    periodEnd: dd(0),
    servicesGross: 3920,
    productsGross: 580,
    tipsTotal: 195,
    commissionServices: 1176,
    commissionProducts: 58,
    totalCommission: 1234,
    totalPayout: 1429
  },
  {
    id: "ec3",
    salonId: "demo",
    staffId: "s3",
    staffName: "Natalia Kamińska",
    staffAvatar: null,
    periodStart: dd(30),
    periodEnd: dd(0),
    servicesGross: 2680,
    productsGross: 245,
    tipsTotal: 145,
    commissionServices: 804,
    commissionProducts: 24.5,
    totalCommission: 828.5,
    totalPayout: 973.5
  }
];

export const mockVouchers: Voucher[] = [
  {
    id: "v1",
    salonId: "demo",
    code: "GIFT-2024-001",
    type: "voucher kwotowy",
    clientId: "c5",
    clientName: "Ewa Dąbrowska",
    issueDate: dd(10),
    expiryDate: dd(-180),
    originalValue: 500,
    remainingValue: 100,
    currency: "PLN",
    status: "aktywny"
  },
  {
    id: "v2",
    salonId: "demo",
    code: "BIRTH-2024-012",
    type: "voucher kwotowy",
    clientId: "c2",
    clientName: "Katarzyna Nowak",
    issueDate: dd(30),
    expiryDate: dd(-20),
    originalValue: 300,
    remainingValue: 300,
    currency: "PLN",
    status: "aktywny"
  },
  {
    id: "v3",
    salonId: "demo",
    code: "PKG-FACE-001",
    type: "pakiet",
    clientId: "c1",
    clientName: "Anna Kowalska",
    issueDate: dd(5),
    expiryDate: dd(-85),
    originalValue: 1200,
    remainingValue: 800,
    currency: "PLN",
    status: "aktywny"
  },
  {
    id: "v4",
    salonId: "demo",
    code: "VZ-MEZO-005",
    type: "voucher zabiegowy",
    clientId: "c3",
    clientName: "Magdalena Wiśniewska",
    issueDate: dd(90),
    expiryDate: dd(5),
    originalValue: 350,
    remainingValue: 0,
    currency: "PLN",
    status: "wykorzystany"
  },
  {
    id: "v5",
    salonId: "demo",
    code: "PROMO-2023-099",
    type: "voucher kwotowy",
    clientId: "c8",
    clientName: "Barbara Woźniak",
    issueDate: dd(120),
    expiryDate: dd(15),
    originalValue: 200,
    remainingValue: 150,
    currency: "PLN",
    status: "wygasły"
  },
  {
    id: "v6",
    salonId: "demo",
    code: "PKG-BODY-003",
    type: "pakiet",
    clientId: "c6",
    clientName: "Monika Zielińska",
    issueDate: dd(7),
    expiryDate: dd(-175),
    originalValue: 1500,
    remainingValue: 1500,
    currency: "PLN",
    status: "aktywny"
  }
];

export const mockAccountingExports: AccountingExport[] = [
  {
    id: "ae1",
    salonId: "demo",
    generatedByUserId: "u1",
    generatedByUserName: "Admin",
    generatedAt: d(2, "14:00:00"),
    periodStart: dd(30),
    periodEnd: dd(0),
    type: "pełny",
    format: "csv",
    targetEmail: "salon@example.com",
    downloadUrl: null
  },
  {
    id: "ae2",
    salonId: "demo",
    generatedByUserId: "u1",
    generatedByUserName: "Admin",
    generatedAt: d(7, "10:30:00"),
    periodStart: dd(60),
    periodEnd: dd(30),
    type: "sprzedaż VAT",
    format: "xlsx",
    targetEmail: "ksiegowosc@example.com",
    downloadUrl: null
  }
];

import { useMemo } from "react";
import { format, subMonths, startOfMonth, parseISO, eachDayOfInterval, getDay } from "date-fns";
import { pl } from "date-fns/locale";
import {
  TrendingUp, TrendingDown, BarChart3, Receipt, ShoppingCart, Heart,
  Clock, Users, Star, Percent, AlertTriangle, Scissors, Package
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "./types";

interface AccountingChartsProps {
  transactions: Transaction[];
  dateRange: { from: Date; to: Date };
}

// Rich luxury palette
const COLORS = {
  violet: "#8B5CF6",
  violetDark: "#6D28D9",
  burgundy: "#BE185D",
  burgundyLight: "#F472B6",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  emerald: "#10B981",
  emeraldLight: "#6EE7B7",
  cyan: "#06B6D4",
  cyanLight: "#67E8F9",
  rose: "#E91E8C",
  roseLight: "#F9A8D4",
  slate: "#64748B",
  indigo: "#6366F1",
  indigoLight: "#A5B4FC",
  amber: "#D97706",
};

const PAYMENT_COLORS: Record<string, string> = {
  gotówka: COLORS.emerald,
  karta: COLORS.violet,
  online: COLORS.cyan,
  voucher: COLORS.gold,
  depozyt: COLORS.burgundy,
};

const PAYMENT_LABELS: Record<string, string> = {
  gotówka: "Gotówka",
  karta: "Karta",
  online: "Online",
  voucher: "Voucher",
  depozyt: "Depozyt",
};

const TOP_ITEM_COLORS = [COLORS.violet, COLORS.rose, COLORS.gold, COLORS.emerald, COLORS.cyan];

const DAY_NAMES = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];

const tooltipStyle = {
  backgroundColor: "hsla(var(--card), 0.85)",
  border: "1px solid hsla(var(--border), 0.5)",
  borderRadius: "12px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  padding: "10px 14px",
};

const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

export function AccountingCharts({ transactions, dateRange }: AccountingChartsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const paidTransactions = useMemo(
    () => transactions.filter((t) => t.status === "opłacone"),
    [transactions]
  );

  const cancelledTransactions = useMemo(
    () => transactions.filter((t) => t.status === "anulowane"),
    [transactions]
  );

  // === KPI calculations ===
  const totalRevenue = useMemo(
    () => paidTransactions.reduce((s, t) => s + t.grossAmount, 0),
    [paidTransactions]
  );

  const transactionCount = paidTransactions.length;
  const avgBasket = transactionCount > 0 ? totalRevenue / transactionCount : 0;
  const totalTips = useMemo(
    () => paidTransactions.reduce((s, t) => s + t.tipAmount, 0),
    [paidTransactions]
  );
  const totalDiscounts = useMemo(
    () => paidTransactions.reduce((s, t) => s + t.discountAmount, 0),
    [paidTransactions]
  );

  const servicesRevenue = useMemo(
    () => paidTransactions.filter((t) => t.itemType === "usługa").reduce((s, t) => s + t.grossAmount, 0),
    [paidTransactions]
  );
  const productsRevenue = useMemo(
    () => paidTransactions.filter((t) => t.itemType === "produkt").reduce((s, t) => s + t.grossAmount, 0),
    [paidTransactions]
  );
  const servicesPct = totalRevenue > 0 ? ((servicesRevenue / totalRevenue) * 100).toFixed(0) : "0";
  const productsPct = totalRevenue > 0 ? ((productsRevenue / totalRevenue) * 100).toFixed(0) : "0";

  const uniqueStaffCount = useMemo(() => {
    const staffIds = new Set(paidTransactions.map((t) => t.staffId).filter(Boolean));
    return Math.max(staffIds.size, 1);
  }, [paidTransactions]);
  const avgPerStaff = totalRevenue / uniqueStaffCount;

  const cancelledCount = cancelledTransactions.length;
  const cancelledValue = useMemo(
    () => cancelledTransactions.reduce((s, t) => s + t.grossAmount, 0),
    [cancelledTransactions]
  );

  // === Daily sales trend ===
  const dailySalesData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTx = paidTransactions.filter((t) => t.dateTime.split("T")[0] === dayStr);
      const services = dayTx.filter((t) => t.itemType === "usługa").reduce((s, t) => s + t.grossAmount, 0);
      const products = dayTx.filter((t) => t.itemType === "produkt").reduce((s, t) => s + t.grossAmount, 0);
      return { date: format(day, "dd.MM", { locale: pl }), usługi: services, produkty: products, total: services + products };
    });
  }, [paidTransactions, dateRange]);

  // === Monthly comparison — 4 months, stacked ===
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    return [3, 2, 1, 0].map((monthsAgo) => {
      const monthStart = startOfMonth(subMonths(now, monthsAgo));
      const monthEnd = monthsAgo === 0 ? now : startOfMonth(subMonths(now, monthsAgo - 1));
      const monthTx = paidTransactions.filter((t) => {
        const d = parseISO(t.dateTime);
        return d >= monthStart && d < monthEnd;
      });
      return {
        name: format(monthStart, "LLL yyyy", { locale: pl }),
        usługi: monthTx.filter((t) => t.itemType === "usługa").reduce((s, t) => s + t.grossAmount, 0),
        produkty: monthTx.filter((t) => t.itemType === "produkt").reduce((s, t) => s + t.grossAmount, 0),
      };
    });
  }, [paidTransactions]);

  const currentMonthRevenue = (monthlyComparison[3]?.usługi || 0) + (monthlyComparison[3]?.produkty || 0);
  const prevMonthRevenue = (monthlyComparison[2]?.usługi || 0) + (monthlyComparison[2]?.produkty || 0);
  const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

  // === Payment distribution ===
  const paymentDistribution = useMemo(() => {
    const totals: Record<string, number> = {};
    paidTransactions.forEach((t) => {
      totals[t.paymentMethod] = (totals[t.paymentMethod] || 0) + t.grossAmount;
    });
    return Object.entries(totals)
      .map(([method, total]) => ({
        name: PAYMENT_LABELS[method] || method,
        value: total,
        color: PAYMENT_COLORS[method] || COLORS.slate,
      }))
      .sort((a, b) => b.value - a.value);
  }, [paidTransactions]);

  // === Category breakdown ===
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    paidTransactions.forEach((t) => {
      totals[t.itemCategory] = (totals[t.itemCategory] || 0) + t.grossAmount;
    });
    return Object.entries(totals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [paidTransactions]);

  // === Top 5 items ===
  const topItems = useMemo(() => {
    const totals: Record<string, { name: string; total: number; type: string }> = {};
    paidTransactions.forEach((t) => {
      if (!totals[t.itemName]) totals[t.itemName] = { name: t.itemName, total: 0, type: t.itemType };
      totals[t.itemName].total += t.grossAmount;
    });
    return Object.values(totals).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [paidTransactions]);

  // === Revenue by staff ===
  const staffRevenue = useMemo(() => {
    const totals: Record<string, { name: string; total: number; txCount: number }> = {};
    paidTransactions.forEach((t) => {
      const name = t.staffName || "Nieprzypisany";
      if (!totals[name]) totals[name] = { name, total: 0, txCount: 0 };
      totals[name].total += t.grossAmount;
      totals[name].txCount += 1;
    });
    return Object.values(totals).sort((a, b) => b.total - a.total);
  }, [paidTransactions]);

  // === Staff productivity (revenue per hour — estimated 8h workday) ===
  const staffProductivity = useMemo(() => {
    const staffDays: Record<string, Set<string>> = {};
    const staffTotals: Record<string, number> = {};
    paidTransactions.forEach((t) => {
      const name = t.staffName || "Nieprzypisany";
      if (!staffDays[name]) staffDays[name] = new Set();
      if (!staffTotals[name]) staffTotals[name] = 0;
      staffDays[name].add(t.dateTime.split("T")[0]);
      staffTotals[name] += t.grossAmount;
    });
    return Object.entries(staffTotals)
      .map(([name, total]) => ({
        name,
        perHour: Math.round(total / Math.max(staffDays[name].size * 8, 1)),
        total,
      }))
      .sort((a, b) => b.perHour - a.perHour);
  }, [paidTransactions]);

  // === Hourly distribution ===
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let h = 8; h <= 20; h++) hours[h] = 0;
    paidTransactions.forEach((t) => {
      const timePart = t.dateTime.split("T")[1];
      if (timePart) {
        const hour = parseInt(timePart.split(":")[0], 10);
        if (hour >= 8 && hour <= 20) hours[hour] = (hours[hour] || 0) + t.grossAmount;
      }
    });
    return Object.entries(hours).map(([h, total]) => ({ hour: `${h}:00`, total }));
  }, [paidTransactions]);

  // === Day of week distribution ===
  const dayOfWeekData = useMemo(() => {
    const days: Record<number, number> = {};
    for (let d = 0; d < 7; d++) days[d] = 0;
    paidTransactions.forEach((t) => {
      const dayIndex = getDay(parseISO(t.dateTime));
      days[dayIndex] += t.grossAmount;
    });
    // Reorder: Mon-Sun
    return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      day: DAY_NAMES[d],
      total: days[d],
    }));
  }, [paidTransactions]);

  // === Discount analysis (donut) ===
  const discountAnalysis = useMemo(() => {
    let fullPrice = 0;
    let discounted = 0;
    let voucherPaid = 0;
    paidTransactions.forEach((t) => {
      if (t.paymentMethod === "voucher") {
        voucherPaid += t.grossAmount;
      } else if (t.discountAmount > 0) {
        discounted += t.grossAmount;
      } else {
        fullPrice += t.grossAmount;
      }
    });
    return [
      { name: "Pełna cena", value: fullPrice, color: COLORS.emerald },
      { name: "Z rabatem", value: discounted, color: COLORS.gold },
      { name: "Voucher", value: voucherPaid, color: COLORS.violet },
    ].filter((d) => d.value > 0);
  }, [paidTransactions]);

  // === New vs Returning clients trend ===
  const clientRetentionTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const seenClients = new Set<string>();
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTx = paidTransactions.filter((t) => t.dateTime.split("T")[0] === dayStr);
      let newClients = 0;
      let returning = 0;
      dayTx.forEach((t) => {
        if (t.clientId) {
          if (seenClients.has(t.clientId)) {
            returning++;
          } else {
            newClients++;
            seenClients.add(t.clientId);
          }
        }
      });
      return { date: format(day, "dd.MM", { locale: pl }), nowi: newClients, powracający: returning };
    });
  }, [paidTransactions, dateRange]);

  // === VAT summary table ===
  const vatSummary = useMemo(() => {
    const rates: Record<number, { net: number; vat: number; gross: number; count: number }> = {};
    paidTransactions.forEach((t) => {
      if (!rates[t.vatRate]) rates[t.vatRate] = { net: 0, vat: 0, gross: 0, count: 0 };
      rates[t.vatRate].net += t.netAmount;
      rates[t.vatRate].vat += t.vatAmount;
      rates[t.vatRate].gross += t.grossAmount;
      rates[t.vatRate].count += 1;
    });
    return Object.entries(rates)
      .map(([rate, data]) => ({ rate: Number(rate), ...data }))
      .sort((a, b) => a.rate - b.rate);
  }, [paidTransactions]);

  const vatTotals = useMemo(
    () => vatSummary.reduce(
      (acc, r) => ({ net: acc.net + r.net, vat: acc.vat + r.vat, gross: acc.gross + r.gross, count: acc.count + r.count }),
      { net: 0, vat: 0, gross: 0, count: 0 }
    ),
    [vatSummary]
  );

  const dailyAvg = totalRevenue / Math.max(dailySalesData.length, 1);

  // KPI config for colored accents
  const kpiRow1 = [
    { icon: <TrendingUp className="w-4 h-4" />, label: "Przychód w okresie", value: formatCurrency(totalRevenue), sub: `${format(dateRange.from, "dd.MM")} – ${format(dateRange.to, "dd.MM.yyyy")}`, accent: COLORS.violet, highlight: true },
    { icon: revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />, label: "Bieżący miesiąc", value: formatCurrency(currentMonthRevenue), sub: <span className={revenueChange > 0 ? "text-green-500" : revenueChange < 0 ? "text-red-500" : "text-muted-foreground"}>{revenueChange > 0 ? "+" : ""}{revenueChange.toFixed(1)}% vs poprzedni</span>, accent: revenueChange >= 0 ? COLORS.emerald : "#EF4444" },
    { icon: <BarChart3 className="w-4 h-4" />, label: "Średnia dzienna", value: formatCurrency(dailyAvg), sub: `${dailySalesData.length} dni`, accent: COLORS.cyan },
    { icon: <Receipt className="w-4 h-4" />, label: "Transakcje", value: transactionCount.toString(), sub: "w wybranym okresie", accent: COLORS.indigo },
    { icon: <ShoppingCart className="w-4 h-4" />, label: "Średni koszyk", value: formatCurrency(avgBasket), sub: "brutto / transakcja", accent: COLORS.gold },
    { icon: <Heart className="w-4 h-4" />, label: "Napiwki", value: formatCurrency(totalTips), sub: "w wybranym okresie", accent: COLORS.rose },
  ];

  const kpiRow2 = [
    { icon: <Percent className="w-4 h-4" />, label: "Rabaty łącznie", value: formatCurrency(totalDiscounts), sub: "utracony przychód", accent: COLORS.amber },
    { icon: <Scissors className="w-4 h-4" />, label: "Usługi / Produkty", value: `${servicesPct}% / ${productsPct}%`, sub: <span className="text-muted-foreground">{formatCurrency(servicesRevenue)} / {formatCurrency(productsRevenue)}</span>, accent: COLORS.violet },
    { icon: <Users className="w-4 h-4" />, label: "Śr. na pracownika", value: formatCurrency(avgPerStaff), sub: `${uniqueStaffCount} pracowników`, accent: COLORS.emerald },
    { icon: <AlertTriangle className="w-4 h-4" />, label: "Anulowane", value: cancelledCount.toString(), sub: <span className="text-red-500">{formatCurrency(cancelledValue)} stracone</span>, accent: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      {/* ROW 1 KPI — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiRow1.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* ROW 2 KPI — 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiRow2.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend — full width */}
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              Trend sprzedaży
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData}>
                  <defs>
                    <linearGradient id="gradUslugi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.violet} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.violet} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradProdukty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.rose} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.rose} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="usługi" name="Usługi" stroke={COLORS.violet} strokeWidth={2.5} fillOpacity={1} fill="url(#gradUslugi)" />
                  <Area type="monotone" dataKey="produkty" name="Produkty" stroke={COLORS.rose} strokeWidth={2.5} fillOpacity={1} fill="url(#gradProdukty)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Metody płatności</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={4} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                    {paymentDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Top 5 usług i produktów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical">
                  <defs>
                    {TOP_ITEM_COLORS.map((color, i) => (
                      <linearGradient key={i} id={`gradTop${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={color} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" radius={[0, 10, 10, 0]}>
                    {topItems.map((_, i) => (
                      <Cell key={i} fill={`url(#gradTop${i % TOP_ITEM_COLORS.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sprzedaż wg kategorii</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical">
                  <defs>
                    <linearGradient id="gradCategory" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.violet} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" width={100} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="url(#gradCategory)" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Staff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Przychód wg pracownika
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffRevenue} layout="vertical">
                  <defs>
                    <linearGradient id="gradStaff" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.emeraldLight} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="url(#gradStaff)" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Discount Analysis Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-500" />
              Analiza rabatów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={discountAnalysis} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={5} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                    {discountAnalysis.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Staff Productivity (per hour) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              Produktywność pracowników (zł/h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffProductivity} layout="vertical">
                  <defs>
                    <linearGradient id="gradProductivity" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.cyanLight} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis type="number" tickFormatter={(v) => `${v} zł/h`} tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${value} zł/h`} />
                  <Bar dataKey="perHour" name="Przychód/h" fill="url(#gradProductivity)" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Rozkład godzinowy sprzedaży
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <defs>
                    <linearGradient id="gradHourly" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.violetDark} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={COLORS.violet} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="hour" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="url(#gradHourly)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Przychód wg dnia tygodnia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <defs>
                    <linearGradient id="gradDayBest" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.burgundy} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={COLORS.rose} stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="gradDayNormal" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.burgundy} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={COLORS.burgundyLight} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="day" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" radius={[8, 8, 0, 0]}>
                    {dayOfWeekData.map((entry, i) => {
                      const max = Math.max(...dayOfWeekData.map((d) => d.total));
                      const isBest = entry.total === max && max > 0;
                      return <Cell key={i} fill={isBest ? "url(#gradDayBest)" : "url(#gradDayNormal)"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New vs Returning Clients — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Klienci nowi vs powracający
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientRetentionTrend}>
                  <defs>
                    <linearGradient id="gradNowi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradPowracajacy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="nowi" name="Nowi klienci" stroke={COLORS.cyan} strokeWidth={2.5} fillOpacity={1} fill="url(#gradNowi)" stackId="1" />
                  <Area type="monotone" dataKey="powracający" name="Powracający" stroke={COLORS.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#gradPowracajacy)" stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison — 4 months stacked */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Porównanie miesięczne (4 miesiące)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <defs>
                    <linearGradient id="gradMonthService" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.violetDark} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={COLORS.violet} stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="gradMonthProduct" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={COLORS.burgundy} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={COLORS.rose} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="usługi" name="Usługi" stackId="a" fill="url(#gradMonthService)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="produkty" name="Produkty" stackId="a" fill="url(#gradMonthProduct)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* VAT Summary Table — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              Podsumowanie VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stawka VAT</TableHead>
                    <TableHead className="text-right">Liczba transakcji</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatSummary.map((row) => (
                    <TableRow key={row.rate}>
                      <TableCell className="font-medium">{row.rate}%</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.net)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.vat)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.gross)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>RAZEM</TableCell>
                    <TableCell className="text-right">{vatTotals.count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatTotals.net)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatTotals.vat)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatTotals.gross)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// === KPI Card sub-component ===
function KPICard({
  icon,
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: React.ReactNode;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${highlight ? "ring-1 ring-primary/20" : ""}`}
      style={{ borderLeft: `3px solid ${accent || "hsl(var(--border))"}` }}
    >
      {highlight && (
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${COLORS.violet}, ${COLORS.burgundy})`,
          }}
        />
      )}
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <span style={{ color: accent }}>{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

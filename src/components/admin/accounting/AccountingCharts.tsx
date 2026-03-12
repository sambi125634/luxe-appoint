import { useMemo } from "react";
import { format, subMonths, startOfMonth, parseISO, eachDayOfInterval } from "date-fns";
import { pl } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, BarChart3, Receipt, ShoppingCart, Heart, Clock, Users, Star } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "./types";

interface AccountingChartsProps {
  transactions: Transaction[];
  dateRange: { from: Date; to: Date };
}

const PAYMENT_COLORS: Record<string, string> = {
  gotówka: "hsl(var(--chart-1))",
  karta: "hsl(var(--chart-2))",
  online: "hsl(var(--chart-3))",
  voucher: "hsl(var(--chart-4))",
  depozyt: "hsl(var(--chart-5))",
};

const PAYMENT_LABELS: Record<string, string> = {
  gotówka: "Gotówka",
  karta: "Karta",
  online: "Online",
  voucher: "Voucher",
  depozyt: "Depozyt",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

const tickStyle = { fill: "hsl(var(--muted-foreground))" };

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
        color: PAYMENT_COLORS[method] || "hsl(var(--muted))",
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
    const totals: Record<string, { name: string; total: number }> = {};
    paidTransactions.forEach((t) => {
      const name = t.staffName || "Nieprzypisany";
      if (!totals[name]) totals[name] = { name, total: 0 };
      totals[name].total += t.grossAmount;
    });
    return Object.values(totals).sort((a, b) => b.total - a.total);
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

  const dailyAvg = totalRevenue / Math.max(dailySalesData.length, 1);

  return (
    <div className="space-y-6">
      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Przychód w okresie"
          value={formatCurrency(totalRevenue)}
          sub={`${format(dateRange.from, "dd.MM")} – ${format(dateRange.to, "dd.MM.yyyy")}`}
          highlight
        />
        <KPICard
          icon={revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          label="Bieżący miesiąc"
          value={formatCurrency(currentMonthRevenue)}
          sub={
            <span className={revenueChange > 0 ? "text-green-500" : revenueChange < 0 ? "text-red-500" : "text-muted-foreground"}>
              {revenueChange > 0 ? "+" : ""}{revenueChange.toFixed(1)}% vs poprzedni
            </span>
          }
        />
        <KPICard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Średnia dzienna"
          value={formatCurrency(dailyAvg)}
          sub={`${dailySalesData.length} dni`}
        />
        <KPICard
          icon={<Receipt className="w-4 h-4" />}
          label="Transakcje"
          value={transactionCount.toString()}
          sub="w wybranym okresie"
        />
        <KPICard
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Średni koszyk"
          value={formatCurrency(avgBasket)}
          sub="brutto / transakcja"
        />
        <KPICard
          icon={<Heart className="w-4 h-4" />}
          label="Napiwki"
          value={formatCurrency(totalTips)}
          sub="w wybranym okresie"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Trend sprzedaży
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData}>
                  <defs>
                    <linearGradient id="colorUslugi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProdukty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={tickStyle} />
                  <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="usługi" name="Usługi" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUslugi)" />
                  <Area type="monotone" dataKey="produkty" name="Produkty" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorProdukty)" />
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
                  <Pie data={paymentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
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
              <Star className="w-5 h-5" />
              Top 5 usług i produktów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} />
                  <YAxis type="category" dataKey="name" width={120} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" radius={[0, 4, 4, 0]}>
                    {topItems.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} tick={tickStyle} />
                  <YAxis type="category" dataKey="category" width={100} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Staff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Przychód wg pracownika
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} />
                  <YAxis type="category" dataKey="name" width={100} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution — full width */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Rozkład godzinowy sprzedaży
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={tickStyle} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" name="Przychód" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={tickStyle} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="usługi" name="Usługi" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="produkty" name="Produkty" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" : ""}>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {icon}
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

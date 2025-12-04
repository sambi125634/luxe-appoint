import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
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

export function AccountingCharts({ transactions, dateRange }: AccountingChartsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Daily sales trend data
  const dailySalesData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTransactions = transactions.filter(
        (t) => t.dateTime.split("T")[0] === dayStr && t.status === "opłacone"
      );
      const services = dayTransactions
        .filter((t) => t.itemType === "usługa")
        .reduce((sum, t) => sum + t.grossAmount, 0);
      const products = dayTransactions
        .filter((t) => t.itemType === "produkt")
        .reduce((sum, t) => sum + t.grossAmount, 0);
      return {
        date: format(day, "dd.MM", { locale: pl }),
        fullDate: dayStr,
        usługi: services,
        produkty: products,
        total: services + products,
      };
    });
  }, [transactions, dateRange]);

  // Monthly comparison (current vs previous month)
  const monthlyComparison = useMemo(() => {
    const currentMonth = startOfMonth(new Date());
    const prevMonth = startOfMonth(subMonths(new Date(), 1));
    
    const currentMonthTrans = transactions.filter((t) => {
      const date = parseISO(t.dateTime);
      return date >= currentMonth && t.status === "opłacone";
    });
    
    const prevMonthTrans = transactions.filter((t) => {
      const date = parseISO(t.dateTime);
      return date >= prevMonth && date < currentMonth && t.status === "opłacone";
    });

    const currentTotal = currentMonthTrans.reduce((sum, t) => sum + t.grossAmount, 0);
    const prevTotal = prevMonthTrans.reduce((sum, t) => sum + t.grossAmount, 0);
    const change = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    return [
      {
        name: format(prevMonth, "LLLL yyyy", { locale: pl }),
        value: prevTotal,
        label: "Poprzedni miesiąc",
      },
      {
        name: format(currentMonth, "LLLL yyyy", { locale: pl }),
        value: currentTotal,
        label: "Bieżący miesiąc",
      },
    ];
  }, [transactions]);

  // Payment method distribution
  const paymentDistribution = useMemo(() => {
    const paidTransactions = transactions.filter((t) => t.status === "opłacone");
    const methodTotals: Record<string, number> = {};

    paidTransactions.forEach((t) => {
      methodTotals[t.paymentMethod] = (methodTotals[t.paymentMethod] || 0) + t.grossAmount;
    });

    return Object.entries(methodTotals)
      .map(([method, total]) => ({
        name: PAYMENT_LABELS[method] || method,
        value: total,
        color: PAYMENT_COLORS[method] || "hsl(var(--muted))",
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const paidTransactions = transactions.filter((t) => t.status === "opłacone");
    const categoryTotals: Record<string, number> = {};

    paidTransactions.forEach((t) => {
      categoryTotals[t.itemCategory] = (categoryTotals[t.itemCategory] || 0) + t.grossAmount;
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [transactions]);

  // Calculate totals
  const totalRevenue = transactions
    .filter((t) => t.status === "opłacone")
    .reduce((sum, t) => sum + t.grossAmount, 0);

  const currentMonthRevenue = monthlyComparison[1]?.value || 0;
  const prevMonthRevenue = monthlyComparison[0]?.value || 0;
  const revenueChange = prevMonthRevenue > 0 
    ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Przychód w okresie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(dateRange.from, "dd.MM")} - {format(dateRange.to, "dd.MM.yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bieżący miesiąc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              {revenueChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : revenueChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={`text-xs font-medium ${
                  revenueChange > 0
                    ? "text-green-500"
                    : revenueChange < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {revenueChange > 0 ? "+" : ""}
                {revenueChange.toFixed(1)}% vs poprzedni miesiąc
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Średnia dzienna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue / Math.max(dailySalesData.length, 1))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              na podstawie {dailySalesData.length} dni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
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
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tickFormatter={(v) => `${v / 1000}k`} 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="usługi"
                    name="Usługi"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorUslugi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="produkty"
                    name="Produkty"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorProdukty)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Metody płatności</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
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
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `${v / 1000}k`}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    width={100}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" name="Przychód" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Porównanie miesięczne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" name="Przychód" radius={[4, 4, 0, 0]}>
                    {monthlyComparison.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 1 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

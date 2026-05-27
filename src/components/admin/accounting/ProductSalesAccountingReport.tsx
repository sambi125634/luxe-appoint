import { useState, useMemo } from "react";
import { 
  Package, Download, TrendingUp, DollarSign, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Filter, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ProductSalesAccountingReportProps {
  dateRange: { from: Date; to: Date };
  isDemo?: boolean;
}

// ─── Rich demo data ───
const MOCK_PRODUCT_SALES_REPORT = {
  period: "Ostatnie 30 dni",
  totalRevenue: 4280,
  totalItemsSold: 89,
  totalOrders: 34,
  avgOrderValue: 125.88,
  topProducts: [
    { id: "m1", name: "Serum witaminowe C 30ml", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", unitsSold: 12, revenue: 1788, avgPrice: 149, margin: 49.7, trend: 23 },
    { id: "m2", name: "Lakier hybrydowy Classic Red", brand: "Semilac", category: "Paznokcie", unitsSold: 18, revenue: 630, avgPrice: 35, margin: 48.6, trend: 5 },
    { id: "m3", name: "Krem nawilżający do twarzy 50ml", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", unitsSold: 9, revenue: 801, avgPrice: 89, margin: 49.4, trend: -8 },
    { id: "m4", name: "Maska nawilżająca do włosów", brand: "Kérastase", category: "Włosy", unitsSold: 7, revenue: 1113, avgPrice: 159, margin: 49.7, trend: 15 },
    { id: "m5", name: "Top coat no-wipe 7ml", brand: "Semilac", category: "Paznokcie", unitsSold: 14, revenue: 546, avgPrice: 39, margin: 48.7, trend: 31 },
    { id: "m6", name: "Olejek arganowy do włosów", brand: "Kérastase", category: "Włosy", unitsSold: 5, revenue: 475, avgPrice: 95, margin: 49.5, trend: -3 },
    { id: "m7", name: "Baza pod lakier hybrydowy", brand: "Semilac", category: "Paznokcie", unitsSold: 11, revenue: 539, avgPrice: 49, margin: 49.0, trend: 8 },
    { id: "m8", name: "Krem pod oczy z retinolem", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", unitsSold: 4, revenue: 476, avgPrice: 119, margin: 49.6, trend: 44 },
  ],
  salesByCategory: [
    { category: "Pielęgnacja twarzy", revenue: 3065, units: 25, color: "hsl(var(--primary))" },
    { category: "Paznokcie", revenue: 1715, units: 43, color: "#E91E8C" },
    { category: "Włosy", revenue: 1588, units: 12, color: "#0D9488" },
    { category: "Pielęgnacja ciała", revenue: 680, units: 8, color: "#F59E0B" },
    { category: "Akcesoria", revenue: 232, units: 1, color: "#6B7280" },
  ],
  salesByDay: [
    { date: "10 mar", revenue: 89, units: 3 },
    { date: "11 mar", revenue: 245, units: 7 },
    { date: "12 mar", revenue: 178, units: 5 },
    { date: "13 mar", revenue: 310, units: 9 },
    { date: "14 mar", revenue: 420, units: 11 },
    { date: "15 mar", revenue: 165, units: 4 },
    { date: "16 mar", revenue: 89, units: 2 },
    { date: "17 mar", revenue: 534, units: 14 },
    { date: "18 mar", revenue: 290, units: 8 },
    { date: "19 mar", revenue: 445, units: 12 },
    { date: "20 mar", revenue: 380, units: 10 },
    { date: "21 mar", revenue: 155, units: 4 },
    { date: "22 mar", revenue: 75, units: 2 },
    { date: "23 mar", revenue: 480, units: 13 },
    { date: "24 mar", revenue: 325, units: 9 },
    { date: "25 mar", revenue: 265, units: 7 },
    { date: "26 mar", revenue: 495, units: 13 },
    { date: "27 mar", revenue: 340, units: 9 },
    { date: "28 mar", revenue: 120, units: 3 },
    { date: "29 mar", revenue: 685, units: 18 },
  ],
  staffSales: [
    { name: "Anna (właścicielka)", unitsSold: 38, revenue: 1820, commission: 182 },
    { name: "Oliwia Wrona", unitsSold: 31, revenue: 1490, commission: 149 },
    { name: "Karolina W.", unitsSold: 20, revenue: 970, commission: 97 },
  ],
};

const PIE_COLORS = ["#7c3aed", "#E91E8C", "#0D9488", "#F59E0B", "#6B7280"];

export function ProductSalesAccountingReport({ dateRange, isDemo = false }: ProductSalesAccountingReportProps) {
  const { t } = useTranslation();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { salonId } = useSalonId();

  const { data: txs } = useQuery({
    queryKey: ["product-sales", salonId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, quantity, category, description, transaction_date, staff_id, staff_members(name)")
        .eq("salon_id", salonId!)
        .eq("type", "product")
        .gte("transaction_date", dateRange.from.toISOString())
        .lte("transaction_date", dateRange.to.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !isDemo && !!salonId,
  });

  const realData = useMemo(() => {
    const list = txs || [];
    if (list.length === 0) return null;
    const totalRevenue = list.reduce((s, t: any) => s + Number(t.amount || 0), 0);
    const totalItemsSold = list.reduce((s, t: any) => s + Number(t.quantity || 1), 0);
    const totalOrders = list.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productAgg: Record<string, { id: string; name: string; brand: string; category: string; unitsSold: number; revenue: number; }> = {};
    list.forEach((t: any) => {
      const key = t.description || "Bez nazwy";
      if (!productAgg[key]) productAgg[key] = { id: key, name: key, brand: "", category: t.category || "Inne", unitsSold: 0, revenue: 0 };
      productAgg[key].unitsSold += Number(t.quantity || 1);
      productAgg[key].revenue += Number(t.amount || 0);
    });
    const topProducts = Object.values(productAgg)
      .map(p => ({ ...p, avgPrice: p.unitsSold > 0 ? p.revenue / p.unitsSold : 0, margin: 0, trend: 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const catAgg: Record<string, { category: string; revenue: number; units: number; color: string }> = {};
    list.forEach((t: any) => {
      const c = t.category || "Inne";
      if (!catAgg[c]) catAgg[c] = { category: c, revenue: 0, units: 0, color: "" };
      catAgg[c].revenue += Number(t.amount || 0);
      catAgg[c].units += Number(t.quantity || 1);
    });
    const salesByCategory = Object.values(catAgg).sort((a, b) => b.revenue - a.revenue);

    const dayAgg: Record<string, { date: string; revenue: number; units: number }> = {};
    list.forEach((t: any) => {
      const d = format(new Date(t.transaction_date), "d MMM", { locale: pl });
      if (!dayAgg[d]) dayAgg[d] = { date: d, revenue: 0, units: 0 };
      dayAgg[d].revenue += Number(t.amount || 0);
      dayAgg[d].units += Number(t.quantity || 1);
    });
    const salesByDay = Object.values(dayAgg);

    const staffAgg: Record<string, { name: string; unitsSold: number; revenue: number; commission: number }> = {};
    list.forEach((t: any) => {
      const name = t.staff_members?.name || "Nieprzypisane";
      if (!staffAgg[name]) staffAgg[name] = { name, unitsSold: 0, revenue: 0, commission: 0 };
      staffAgg[name].unitsSold += Number(t.quantity || 1);
      staffAgg[name].revenue += Number(t.amount || 0);
      staffAgg[name].commission += Number(t.amount || 0) * 0.1;
    });
    const staffSales = Object.values(staffAgg).sort((a, b) => b.revenue - a.revenue);

    return { period: "Wybrany okres", totalRevenue, totalItemsSold, totalOrders, avgOrderValue, topProducts, salesByCategory, salesByDay, staffSales };
  }, [txs]);

  const isShowingDemo = isDemo;
  const data = isDemo ? MOCK_PRODUCT_SALES_REPORT : realData;

  if (!isDemo && !data) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed rounded-lg">
        <div className="p-3 rounded-full bg-muted mb-4">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-base mb-1">Brak sprzedaży produktów w tym okresie</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Top produkty, sprzedaż wg kategorii i pracowników pojawią się automatycznie po pierwszej sprzedaży produktu klientce.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount);

  const filteredProducts = categoryFilter === "all"
    ? data!.topProducts
    : data!.topProducts.filter((p: any) => p.category === categoryFilter);

  const categories = [...new Set(data!.topProducts.map((p: any) => p.category))];

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      {isShowingDemo && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-lg">👁️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              Podgląd demo — przykładowe dane sprzedaży
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Tak będzie wyglądał Twój raport gdy zaczniesz sprzedawać produkty klientkom. Dane zostaną zastąpione rzeczywistymi automatycznie.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-300">
            DEMO
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              💰 Przychód ze sprzedaży
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">ostatnie 30 dni</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ShoppingBag className="w-4 h-4" />
              📦 Sprzedanych sztuk
            </div>
            <p className="text-2xl font-bold">{data.totalItemsSold}</p>
            <p className="text-xs text-muted-foreground mt-1">w {data.totalOrders} transakcjach</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              🛒 Średnia wartość zakupu
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data.avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">per transakcja</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ArrowUpRight className="w-4 h-4" />
              📈 Najlepszy produkt
            </div>
            <p className="text-sm font-bold leading-tight">{data.topProducts[0].name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.topProducts[0].unitsSold} szt · {formatCurrency(data.topProducts[0].revenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart — daily sales */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sprzedaż dzienna</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip formatter={(value: number) => [`${value} zł`, "Przychód"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {isShowingDemo && (
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground/40 font-medium select-none">
                dane przykładowe
              </span>
            )}
          </CardContent>
        </Card>

        {/* Pie chart — by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Wg kategorii</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.salesByCategory}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.salesByCategory.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} zł`, "Przychód"]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            {isShowingDemo && (
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground/40 font-medium select-none">
                dane przykładowe
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Wszystkie kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie kategorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2" size="sm">
          <Download className="w-4 h-4" />
          Eksport CSV
        </Button>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4" />
            Top produkty
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead className="text-center">Sprzedano</TableHead>
                  <TableHead className="text-right">Przychód</TableHead>
                  <TableHead className="text-right">Marża</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, idx) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{product.unitsSold} szt</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          product.margin > 45 ? "border-green-300 bg-green-50 text-green-700" :
                          product.margin >= 30 ? "border-yellow-300 bg-yellow-50 text-yellow-700" :
                          "border-red-300 bg-red-50 text-red-700"
                        )}
                      >
                        {product.margin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.trend > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-green-600 text-sm font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5" />+{product.trend}%
                        </span>
                      ) : product.trend < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-destructive text-sm font-medium">
                          <ArrowDownRight className="w-3.5 h-3.5" />{product.trend}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground"><Minus className="w-3.5 h-3.5 inline" /></span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Sales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sprzedaż wg pracownika</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Pracownik</TableHead>
                  <TableHead className="text-center">Sprzedano szt.</TableHead>
                  <TableHead className="text-right">Przychód</TableHead>
                  <TableHead className="text-right">Prowizja</TableHead>
                  <TableHead>Udział</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.staffSales.map((staff, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell className="text-center">{staff.unitsSold}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(staff.revenue)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(staff.commission)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={(staff.revenue / data.totalRevenue) * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {((staff.revenue / data.totalRevenue) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, Package, Percent, Download, Calendar, Coins, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProducts } from "./types";
import { cn } from "@/lib/utils";

const LABOR_COST_PER_HOUR = 35; // zł/h szacunkowy koszt pracy

// Mock sales data for demo — with estimated service duration (minutes)
const mockSalesData = [
  { productId: "1", sold: 8, revenue: 3600, cost: 2240, durationMin: 45 },
  { productId: "2", sold: 5, revenue: 1400, cost: 750, durationMin: 30 },
  { productId: "3", sold: 12, revenue: 2160, cost: 1140, durationMin: 20 },
  { productId: "4", sold: 3, revenue: 195, cost: 105, durationMin: 15 },
];

type Period = "week" | "month" | "quarter" | "year";

export function ProductSalesReport({ isDemo = false }: { isDemo?: boolean }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("month");

  // W realnym panelu nie pokazujemy danych przykładowych — czekamy na pierwszą sprzedaż produktu.
  const salesSource = isDemo ? mockSalesData : [];

  const salesWithProducts = salesSource.map((sale) => {
    const product = mockProducts.find((p) => p.id === sale.productId);
    const margin = sale.revenue - sale.cost;
    const marginPercent = sale.revenue > 0 ? (margin / sale.revenue) * 100 : 0;
    const laborCost = (sale.durationMin / 60) * LABOR_COST_PER_HOUR * sale.sold;
    const trueProfit = sale.revenue - sale.cost - laborCost;
    return {
      ...sale,
      product,
      margin,
      marginPercent,
      laborCost,
      trueProfit,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totals = salesWithProducts.reduce(
    (acc, sale) => ({
      sold: acc.sold + sale.sold,
      revenue: acc.revenue + sale.revenue,
      cost: acc.cost + sale.cost,
      margin: acc.margin + sale.margin,
      laborCost: acc.laborCost + sale.laborCost,
      trueProfit: acc.trueProfit + sale.trueProfit,
    }),
    { sold: 0, revenue: 0, cost: 0, margin: 0, laborCost: 0, trueProfit: 0 }
  );

  const avgMarginPercent = totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0;
  const trueProfitPercent = totals.revenue > 0 ? (totals.trueProfit / totals.revenue) * 100 : 0;

  const handleExport = () => {
    console.log("Exporting product sales report...");
  };

  const isEmpty = salesWithProducts.length === 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          value={`${totals.revenue.toLocaleString()} zł`}
          label={t("products.totalRevenue")}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100"
          value={`${totals.margin.toLocaleString()} zł`}
          valueColor="text-green-600"
          label={t("products.totalMargin")}
        />
        <StatCard
          icon={<Percent className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
          value={`${avgMarginPercent.toFixed(1)}%`}
          label={t("products.avgMargin")}
        />
        <StatCard
          icon={<Package className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
          value={String(totals.sold)}
          label={t("products.totalSold")}
        />
        <Card className="col-span-2 md:col-span-1 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{totals.trueProfit.toLocaleString()} zł</p>
                <p className="text-sm text-muted-foreground">True Profit</p>
                <p className="text-[10px] text-muted-foreground">materiały + praca ({trueProfitPercent.toFixed(0)}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Report Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t("products.salesReport")}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="week">{t("products.thisWeek")}</SelectItem>
                  <SelectItem value="month">{t("products.thisMonth")}</SelectItem>
                  <SelectItem value="quarter">{t("products.thisQuarter")}</SelectItem>
                  <SelectItem value="year">{t("products.thisYear")}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                {t("common.export")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("products.product")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("products.brand")}</TableHead>
                  <TableHead className="text-center">{t("products.sold")}</TableHead>
                  <TableHead className="text-right">{t("products.revenue")}</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">{t("products.cost")}</TableHead>
                  <TableHead className="text-right">{t("products.margin")}</TableHead>
                  <TableHead className="text-right hidden md:table-cell">{t("products.marginPercent")}</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">True Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesWithProducts.map((sale) => (
                  <TableRow key={sale.productId} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{sale.product?.name || "-"}</p>
                        {sale.product?.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {sale.product.sku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{sale.product?.brand || "-"}</TableCell>
                    <TableCell className="text-center font-medium">{sale.sold}</TableCell>
                    <TableCell className="text-right font-medium">{sale.revenue.toLocaleString()} zł</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                      {sale.cost.toLocaleString()} zł
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {sale.margin.toLocaleString()} zł
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <span className={cn(
                        "font-medium",
                        sale.marginPercent >= 40 && "text-green-600",
                        sale.marginPercent < 40 && sale.marginPercent >= 20 && "text-yellow-600",
                        sale.marginPercent < 20 && "text-destructive"
                      )}>
                        {sale.marginPercent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <span className={cn(
                        "font-bold",
                        sale.trueProfit >= 0 ? "text-primary" : "text-destructive"
                      )}>
                        {sale.trueProfit.toLocaleString()} zł
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>{t("common.total")}</TableCell>
                  <TableCell className="text-center">{totals.sold}</TableCell>
                  <TableCell className="text-right">{totals.revenue.toLocaleString()} zł</TableCell>
                  <TableCell className="text-right hidden sm:table-cell">{totals.cost.toLocaleString()} zł</TableCell>
                  <TableCell className="text-right text-green-600">{totals.margin.toLocaleString()} zł</TableCell>
                  <TableCell className="text-right hidden md:table-cell">{avgMarginPercent.toFixed(1)}%</TableCell>
                  <TableCell className="text-right hidden lg:table-cell text-primary">{totals.trueProfit.toLocaleString()} zł</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Small helper to reduce repetition in stat cards
function StatCard({ icon, iconBg, value, valueColor, label }: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  valueColor?: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", iconBg)}>
            {icon}
          </div>
          <div>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

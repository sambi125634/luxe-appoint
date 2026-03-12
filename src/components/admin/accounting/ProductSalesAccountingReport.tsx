import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  Package, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { 
  exportToCSV, 
  ProductExportData, 
  exportProductSales 
} from "@/lib/csvExport";

interface ProductSalesAccountingReportProps {
  dateRange: { from: Date; to: Date };
}

// Mock data for product sales — dates relative to today
const today = new Date();
const ddAgo = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

const mockProductSales = [
  {
    id: "ps1",
    date: ddAgo(0),
    productId: "p1",
    productName: "Serum witaminowe C",
    category: "Kosmetyki",
    brand: "La Roche-Posay",
    sku: "LRP-SER-001",
    quantity: 5,
    unitPriceNet: 97.56,
    unitPriceGross: 120,
    vatRate: 23,
    totalNet: 487.80,
    totalGross: 600,
    vatAmount: 112.20,
    costPrice: 65,
    profit: 162.80,
    profitMargin: 33.4,
    staffId: "s1",
    staffName: "Maria Kowalczyk",
    paymentMethod: "karta",
    clientName: "Anna Kowalska",
  },
  {
    id: "ps2",
    date: ddAgo(0),
    productId: "p2",
    productName: "Krem nawilżający premium",
    category: "Kosmetyki",
    brand: "Avène",
    sku: "AVN-KRM-002",
    quantity: 3,
    unitPriceNet: 153.66,
    unitPriceGross: 189,
    vatRate: 23,
    totalNet: 460.98,
    totalGross: 567,
    vatAmount: 106.02,
    costPrice: 95,
    profit: 175.98,
    profitMargin: 38.2,
    staffId: "s2",
    staffName: "Aleksandra Wiśniewska",
    paymentMethod: "gotówka",
    clientName: "Katarzyna Nowak",
  },
  {
    id: "ps3",
    date: ddAgo(1),
    productId: "p3",
    productName: "Olejek do masażu",
    category: "Akcesoria",
    brand: "Bio-Oil",
    sku: "BIO-OLE-003",
    quantity: 8,
    unitPriceNet: 48.78,
    unitPriceGross: 60,
    vatRate: 23,
    totalNet: 390.24,
    totalGross: 480,
    vatAmount: 89.76,
    costPrice: 28,
    profit: 166.24,
    profitMargin: 42.6,
    staffId: "s1",
    staffName: "Maria Kowalczyk",
    paymentMethod: "karta",
    clientName: "Magdalena Wiśniewska",
  },
  {
    id: "ps4",
    date: "2024-01-14",
    productId: "p4",
    productName: "Maska do włosów",
    category: "Pielęgnacja włosów",
    brand: "Kérastase",
    sku: "KER-MSK-004",
    quantity: 2,
    unitPriceNet: 162.60,
    unitPriceGross: 200,
    vatRate: 23,
    totalNet: 325.20,
    totalGross: 400,
    vatAmount: 74.80,
    costPrice: 110,
    profit: 105.20,
    profitMargin: 32.3,
    staffId: "s3",
    staffName: "Natalia Kamińska",
    paymentMethod: "online",
    clientName: "Joanna Lewandowska",
  },
  {
    id: "ps5",
    date: "2024-01-13",
    productId: "p1",
    productName: "Serum witaminowe C",
    category: "Kosmetyki",
    brand: "La Roche-Posay",
    sku: "LRP-SER-001",
    quantity: 3,
    unitPriceNet: 97.56,
    unitPriceGross: 120,
    vatRate: 23,
    totalNet: 292.68,
    totalGross: 360,
    vatAmount: 67.32,
    costPrice: 65,
    profit: 97.68,
    profitMargin: 33.4,
    staffId: "s2",
    staffName: "Aleksandra Wiśniewska",
    paymentMethod: "karta",
    clientName: "Ewa Dąbrowska",
  },
];

// Aggregate data by product
const aggregateByProduct = (sales: typeof mockProductSales) => {
  const map = new Map<string, {
    productName: string;
    category: string;
    brand: string;
    sku: string;
    totalQuantity: number;
    totalGross: number;
    totalNet: number;
    totalVat: number;
    totalProfit: number;
    avgMargin: number;
  }>();
  
  sales.forEach(sale => {
    const existing = map.get(sale.productId);
    if (existing) {
      existing.totalQuantity += sale.quantity;
      existing.totalGross += sale.totalGross;
      existing.totalNet += sale.totalNet;
      existing.totalVat += sale.vatAmount;
      existing.totalProfit += sale.profit;
    } else {
      map.set(sale.productId, {
        productName: sale.productName,
        category: sale.category,
        brand: sale.brand,
        sku: sale.sku,
        totalQuantity: sale.quantity,
        totalGross: sale.totalGross,
        totalNet: sale.totalNet,
        totalVat: sale.vatAmount,
        totalProfit: sale.profit,
        avgMargin: sale.profitMargin,
      });
    }
  });
  
  return Array.from(map.entries()).map(([id, data]) => ({
    productId: id,
    ...data,
    avgMargin: (data.totalProfit / data.totalNet) * 100,
  })).sort((a, b) => b.totalGross - a.totalGross);
};

// Aggregate data by staff
const aggregateByStaff = (sales: typeof mockProductSales) => {
  const map = new Map<string, {
    staffName: string;
    salesCount: number;
    totalQuantity: number;
    totalGross: number;
    totalProfit: number;
  }>();
  
  sales.forEach(sale => {
    const existing = map.get(sale.staffId);
    if (existing) {
      existing.salesCount += 1;
      existing.totalQuantity += sale.quantity;
      existing.totalGross += sale.totalGross;
      existing.totalProfit += sale.profit;
    } else {
      map.set(sale.staffId, {
        staffName: sale.staffName,
        salesCount: 1,
        totalQuantity: sale.quantity,
        totalGross: sale.totalGross,
        totalProfit: sale.profit,
      });
    }
  });
  
  return Array.from(map.entries()).map(([id, data]) => ({
    staffId: id,
    ...data,
  })).sort((a, b) => b.totalGross - a.totalGross);
};

export function ProductSalesAccountingReport({ dateRange }: ProductSalesAccountingReportProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"transactions" | "products" | "staff">("transactions");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  // Filter sales by category
  const filteredSales = categoryFilter === "all" 
    ? mockProductSales 
    : mockProductSales.filter(s => s.category === categoryFilter);

  // Calculate totals
  const totals = filteredSales.reduce(
    (acc, sale) => ({
      quantity: acc.quantity + sale.quantity,
      gross: acc.gross + sale.totalGross,
      net: acc.net + sale.totalNet,
      vat: acc.vat + sale.vatAmount,
      profit: acc.profit + sale.profit,
    }),
    { quantity: 0, gross: 0, net: 0, vat: 0, profit: 0 }
  );

  const avgMargin = totals.net > 0 ? (totals.profit / totals.net) * 100 : 0;

  // Get unique categories for filter
  const categories = [...new Set(mockProductSales.map(s => s.category))];

  // Aggregated data
  const productAggregates = aggregateByProduct(filteredSales);
  const staffAggregates = aggregateByStaff(filteredSales);

  const handleExportCSV = () => {
    const exportData: ProductExportData[] = filteredSales.map(sale => ({
      date: sale.date,
      productName: sale.productName,
      category: sale.category,
      brand: sale.brand,
      sku: sale.sku,
      quantity: sale.quantity,
      unitPriceGross: sale.unitPriceGross,
      totalGross: sale.totalGross,
      vatRate: sale.vatRate,
      vatAmount: sale.vatAmount,
      profit: sale.profit,
      staffName: sale.staffName,
      clientName: sale.clientName,
      paymentMethod: sale.paymentMethod,
    }));
    exportProductSales(exportData);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              {t('accounting.productSales.totalRevenue')}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totals.gross)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ShoppingBag className="w-4 h-4" />
              {t('accounting.productSales.soldItems')}
            </div>
            <p className="text-2xl font-bold">{totals.quantity}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              {t('accounting.productSales.profit')}
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.profit)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <ArrowUpRight className="w-4 h-4" />
              {t('accounting.productSales.avgMargin')}
            </div>
            <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Package className="w-4 h-4" />
              {t('accounting.productSales.vatAmount')}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totals.vat)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactions">{t('accounting.productSales.viewTransactions')}</SelectItem>
              <SelectItem value="products">{t('accounting.productSales.viewByProduct')}</SelectItem>
              <SelectItem value="staff">{t('accounting.productSales.viewByStaff')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('accounting.productSales.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('accounting.productSales.allCategories')}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" />
          {t('accounting.exportCsv')}
        </Button>
      </div>

      {/* Data Tables */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {viewMode === "transactions" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.date')}</TableHead>
                <TableHead>{t('accounting.productSales.product')}</TableHead>
                <TableHead>{t('accounting.productSales.category')}</TableHead>
                <TableHead className="text-center">{t('accounting.productSales.qty')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.unitPrice')}</TableHead>
                <TableHead className="text-right">{t('accounting.grossAmount')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.vat')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.profit')}</TableHead>
                <TableHead>{t('accounting.employee')}</TableHead>
                <TableHead>{t('accounting.paymentMethod')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.date), "dd.MM.yyyy")}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sale.productName}</p>
                      <p className="text-xs text-muted-foreground">{sale.brand} • {sale.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{sale.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{sale.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.unitPriceGross)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(sale.totalGross)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(sale.vatAmount)}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">{formatCurrency(sale.profit)}</span>
                    <span className="text-xs text-muted-foreground ml-1">({sale.profitMargin.toFixed(0)}%)</span>
                  </TableCell>
                  <TableCell>{sale.staffName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.paymentMethod}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={3}>{t('accounting.total')}</TableCell>
                <TableCell className="text-center">{totals.quantity}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{formatCurrency(totals.gross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.vat)}</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(totals.profit)}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

        {viewMode === "products" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.productSales.product')}</TableHead>
                <TableHead>{t('accounting.productSales.category')}</TableHead>
                <TableHead className="text-center">{t('accounting.productSales.soldQty')}</TableHead>
                <TableHead className="text-right">{t('accounting.grossAmount')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.vat')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.profit')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.margin')}</TableHead>
                <TableHead>{t('accounting.productSales.share')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productAggregates.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.brand} • {product.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{product.totalQuantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(product.totalGross)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(product.totalVat)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(product.totalProfit)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.avgMargin > 35 ? "default" : "secondary"}>
                      {product.avgMargin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(product.totalGross / totals.gross) * 100} 
                        className="w-16 h-2" 
                      />
                      <span className="text-xs text-muted-foreground">
                        {((product.totalGross / totals.gross) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {viewMode === "staff" && (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.employee')}</TableHead>
                <TableHead className="text-center">{t('accounting.productSales.transactions')}</TableHead>
                <TableHead className="text-center">{t('accounting.productSales.soldItems')}</TableHead>
                <TableHead className="text-right">{t('accounting.grossAmount')}</TableHead>
                <TableHead className="text-right">{t('accounting.productSales.profit')}</TableHead>
                <TableHead>{t('accounting.productSales.share')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAggregates.map((staff) => (
                <TableRow key={staff.staffId}>
                  <TableCell className="font-medium">{staff.staffName}</TableCell>
                  <TableCell className="text-center">{staff.salesCount}</TableCell>
                  <TableCell className="text-center">{staff.totalQuantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(staff.totalGross)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(staff.totalProfit)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(staff.totalGross / totals.gross) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-xs text-muted-foreground">
                        {((staff.totalGross / totals.gross) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

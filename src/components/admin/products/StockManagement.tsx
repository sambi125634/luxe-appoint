import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Warehouse, AlertTriangle, Package, TrendingDown, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StockCorrectionModal } from "./modals/StockCorrectionModal";
import { type Product } from "./types";
import { useProducts, type Product as DBProduct } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { cn } from "@/lib/utils";

type StockFilter = "all" | "low" | "out" | "ok";

interface StockManagementProps {
  salonId?: string;
}

// Helper to convert DB product to component Product type
const toProduct = (p: DBProduct): Product => ({
  id: p.id,
  salon_id: p.salon_id,
  supplier_id: p.supplier_id ?? undefined,
  name: p.name,
  brand: p.brand ?? undefined,
  category: p.category,
  sku: p.sku ?? undefined,
  ean: p.ean ?? undefined,
  variant: p.variant ?? undefined,
  sale_price_gross: p.sale_price_gross,
  purchase_price_net: p.purchase_price_net ?? undefined,
  vat_rate: p.vat_rate,
  min_stock: p.min_stock,
  current_stock: p.current_stock,
  is_active: p.is_active,
  is_for_internal_use: p.is_for_internal_use,
  image_url: p.image_url ?? undefined,
  description: p.description ?? undefined,
  created_at: p.created_at,
  updated_at: p.updated_at,
});

export function StockManagement({ salonId }: StockManagementProps) {
  const { t } = useTranslation();
  const { products: dbProducts, isLoading } = useProducts(salonId);
  const { createCorrection } = useStockMovements(salonId);
  const products = dbProducts.map(toProduct);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (stockFilter === "low") {
      matchesFilter = product.current_stock <= product.min_stock && product.current_stock > 0;
    } else if (stockFilter === "out") {
      matchesFilter = product.current_stock === 0;
    } else if (stockFilter === "ok") {
      matchesFilter = product.current_stock > product.min_stock;
    }

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: products.length,
    ok: products.filter((p) => p.current_stock > p.min_stock).length,
    low: products.filter((p) => p.current_stock <= p.min_stock && p.current_stock > 0).length,
    out: products.filter((p) => p.current_stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.current_stock * (p.purchase_price_net || 0), 0),
  };

  const getStockLevel = (product: Product) => {
    if (product.min_stock === 0) return 100;
    return Math.min((product.current_stock / (product.min_stock * 2)) * 100, 100);
  };

  const getStockColor = (product: Product) => {
    if (product.current_stock === 0) return "bg-destructive";
    if (product.current_stock <= product.min_stock) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleStockCorrection = (productId: string, quantity: number, note: string) => {
    if (salonId) {
      createCorrection.mutate({
        salon_id: salonId,
        product_id: productId,
        quantity,
        note,
      });
    }
    setIsCorrectionModalOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter("all")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">{t("products.totalProducts")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter("ok")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Warehouse className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
                <p className="text-sm text-muted-foreground">OK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter("low")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.low}</p>
                <p className="text-sm text-muted-foreground">{t("products.lowStock")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockFilter("out")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.out}</p>
                <p className="text-sm text-muted-foreground">{t("products.outOfStock")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} zł</p>
              <p className="text-sm text-muted-foreground">{t("products.stockValue")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5" />
              {t("products.stock")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("products.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="low">{t("products.lowStock")}</SelectItem>
                <SelectItem value="out">{t("products.outOfStock")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("products.product")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("products.brand")}</TableHead>
                  <TableHead className="text-center">{t("products.currentStock")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("products.stockLevel")}</TableHead>
                  <TableHead className="text-right">{t("products.stockValue")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("products.noProducts")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{product.brand || "-"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            "text-lg font-bold",
                            product.current_stock === 0 && "text-destructive",
                            product.current_stock <= product.min_stock && product.current_stock > 0 && "text-yellow-600"
                          )}>
                            {product.current_stock}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            min: {product.min_stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="w-full max-w-[120px]">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", getStockColor(product))}
                              style={{ width: `${getStockLevel(product)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(product.current_stock * (product.purchase_price_net || 0)).toLocaleString()} zł
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsCorrectionModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t("products.correction")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StockCorrectionModal
        open={isCorrectionModalOpen}
        onOpenChange={(open) => {
          setIsCorrectionModalOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleStockCorrection}
      />
    </div>
  );
}

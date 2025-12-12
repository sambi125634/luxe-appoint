import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, AlertTriangle, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductFormModal } from "./modals/ProductFormModal";
import { productCategories, type Product } from "./types";
import { useProducts, type Product as DBProduct } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface ProductsCatalogProps {
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

export function ProductsCatalog({ salonId }: ProductsCatalogProps) {
  const { t } = useTranslation();
  const { products: dbProducts, isLoading, createProduct, updateProduct, deleteProduct } = useProducts(salonId);
  const products = dbProducts.map(toProduct);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter((p) => p.current_stock <= p.min_stock && p.current_stock > 0).length;
  const outOfStockCount = products.filter((p) => p.current_stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.current_stock * (p.purchase_price_net || 0), 0);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct.mutate({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        ean: product.ean,
        variant: product.variant,
        sale_price_gross: product.sale_price_gross,
        purchase_price_net: product.purchase_price_net,
        vat_rate: product.vat_rate,
        min_stock: product.min_stock,
        current_stock: product.current_stock,
        is_active: product.is_active,
        is_for_internal_use: product.is_for_internal_use,
        image_url: product.image_url,
        description: product.description,
        supplier_id: product.supplier_id,
      });
    } else if (salonId) {
      createProduct.mutate({
        salon_id: salonId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sku: product.sku,
        ean: product.ean,
        variant: product.variant,
        sale_price_gross: product.sale_price_gross,
        purchase_price_net: product.purchase_price_net,
        vat_rate: product.vat_rate,
        min_stock: product.min_stock,
        current_stock: product.current_stock,
        is_active: product.is_active,
        is_for_internal_use: product.is_for_internal_use,
        image_url: product.image_url,
        description: product.description,
        supplier_id: product.supplier_id,
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct.mutate(id);
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return { label: t("products.outOfStock"), color: "bg-destructive/10 text-destructive" };
    }
    if (product.current_stock <= product.min_stock) {
      return { label: t("products.lowStock"), color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "OK", color: "bg-green-100 text-green-800" };
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">{t("products.totalProducts")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">{t("products.lowStock")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Package className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
                <p className="text-sm text-muted-foreground">{t("products.outOfStock")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-bold">{totalValue.toLocaleString()} zł</p>
              <p className="text-sm text-muted-foreground">{t("products.stockValue")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t("products.catalog")}
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("products.addProduct")}
            </Button>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t("products.allCategories")} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                <SelectItem value="all">{t("products.allCategories")}</SelectItem>
                {productCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("products.name")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("products.brand")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("products.category")}</TableHead>
                  <TableHead className="text-right">{t("products.price")}</TableHead>
                  <TableHead className="text-center">{t("products.stock")}</TableHead>
                  <TableHead className="text-center">{t("products.status")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("products.noProducts")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getStockStatus(product);
                    return (
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
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {product.sale_price_gross.toLocaleString()} zł
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium",
                            product.current_stock === 0 && "text-destructive",
                            product.current_stock <= product.min_stock && product.current_stock > 0 && "text-yellow-600"
                          )}>
                            {product.current_stock}
                          </span>
                          <span className="text-muted-foreground text-sm"> / {product.min_stock}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border">
                              <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Truck, Plus, Search, Calendar, FileText, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeliveryFormModal } from "./modals/DeliveryFormModal";
import { stockMovementTypes, type StockMovement, type Product, type Supplier } from "./types";
import { useProducts, type Product as DBProduct } from "@/hooks/useProducts";
import { useSuppliers, type Supplier as DBSupplier } from "@/hooks/useSuppliers";
import { useStockMovements } from "@/hooks/useStockMovements";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DeliveriesManagementProps {
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

// Helper to convert DB supplier to component Supplier type
const toSupplier = (s: DBSupplier): Supplier => ({
  id: s.id,
  salon_id: s.salon_id,
  name: s.name,
  contact_person: s.contact_person ?? undefined,
  email: s.email ?? undefined,
  phone: s.phone ?? undefined,
  address: s.address ?? undefined,
  payment_terms: s.payment_terms ?? undefined,
  discount_info: s.discount_info ?? undefined,
  notes: s.notes ?? undefined,
  is_active: s.is_active,
  created_at: s.created_at,
  updated_at: s.updated_at,
});

export function DeliveriesManagement({ salonId }: DeliveriesManagementProps) {
  const { t } = useTranslation();
  const { products: dbProducts, isLoading: productsLoading } = useProducts(salonId);
  const { suppliers: dbSuppliers, isLoading: suppliersLoading } = useSuppliers(salonId);
  const { movements: dbMovements, isLoading: movementsLoading, createDelivery } = useStockMovements(salonId, "delivery");
  
  const products = dbProducts.map(toProduct);
  const suppliers = dbSuppliers.map(toSupplier);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoading = productsLoading || suppliersLoading || movementsLoading;

  const filteredMovements = dbMovements.filter((movement) => {
    const product = movement.products;
    const supplier = movement.suppliers;
    return (
      product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalDeliveryValue = dbMovements.reduce((sum, m) => sum + (m.total_value || 0), 0);
  const totalItems = dbMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  const handleAddDelivery = (delivery: Omit<StockMovement, "id" | "created_at">) => {
    if (salonId) {
      createDelivery.mutate({
        salon_id: salonId,
        product_id: delivery.product_id,
        quantity: delivery.quantity,
        unit_price: delivery.unit_price,
        supplier_id: delivery.supplier_id,
        invoice_number: delivery.invoice_number,
        expiry_date: delivery.expiry_date,
        note: delivery.note,
      });
    }
    setIsModalOpen(false);
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dbMovements.length}</p>
                <p className="text-sm text-muted-foreground">{t("products.totalDeliveries")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-sm text-muted-foreground">{t("products.totalItems")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-2xl font-bold">{totalDeliveryValue.toLocaleString()} zł</p>
              <p className="text-sm text-muted-foreground">{t("products.totalValue")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {t("products.deliveries")}
            </CardTitle>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("products.addDelivery")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("products.searchDeliveries")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("products.date")}</TableHead>
                  <TableHead>{t("products.product")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("products.supplier")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("products.invoice")}</TableHead>
                  <TableHead className="text-center">{t("products.quantity")}</TableHead>
                  <TableHead className="text-right">{t("products.value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("products.noDeliveries")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => {
                    const product = movement.products;
                    const supplier = movement.suppliers;

                    return (
                      <TableRow key={movement.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {format(new Date(movement.created_at), "d MMM yyyy", { locale: pl })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product?.name || "-"}</p>
                            {product?.brand && (
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {supplier?.name || "-"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {movement.invoice_number ? (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span>{movement.invoice_number}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("text-xs", stockMovementTypes.delivery.color)}>
                            +{movement.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.total_value?.toLocaleString() || "-"} zł
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

      <DeliveryFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        products={products}
        suppliers={suppliers}
        onSave={handleAddDelivery}
      />
    </div>
  );
}

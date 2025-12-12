import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Truck, Plus, Search, Calendar, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeliveryFormModal } from "./modals/DeliveryFormModal";
import { mockStockMovements, mockProducts, mockSuppliers, stockMovementTypes, type StockMovement } from "./types";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DeliveriesManagement() {
  const { t } = useTranslation();
  const [movements, setMovements] = useState<StockMovement[]>(
    mockStockMovements.filter((m) => m.type === "delivery")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMovements = movements.filter((movement) => {
    const product = mockProducts.find((p) => p.id === movement.product_id);
    const supplier = movement.supplier_id ? mockSuppliers.find((s) => s.id === movement.supplier_id) : null;
    return (
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalDeliveryValue = movements.reduce((sum, m) => sum + (m.total_value || 0), 0);
  const totalItems = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  const handleAddDelivery = (delivery: Omit<StockMovement, "id" | "created_at">) => {
    const newMovement: StockMovement = {
      ...delivery,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setMovements([newMovement, ...movements]);
    setIsModalOpen(false);
  };

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
                <p className="text-2xl font-bold">{movements.length}</p>
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
                    const product = mockProducts.find((p) => p.id === movement.product_id);
                    const supplier = movement.supplier_id
                      ? mockSuppliers.find((s) => s.id === movement.supplier_id)
                      : null;

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
        products={mockProducts}
        suppliers={mockSuppliers}
        onSave={handleAddDelivery}
      />
    </div>
  );
}

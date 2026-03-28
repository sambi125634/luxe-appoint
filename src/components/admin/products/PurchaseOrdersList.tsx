import { useState } from "react";
import { Eye, FileText, RotateCcw, CheckCircle, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePurchaseOrders, type PurchaseOrderItem } from "@/hooks/usePurchaseOrders";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PurchaseOrdersListProps {
  salonId?: string;
  onReorder: (orderId: string) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Szkic", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  sent: { label: "Wysłane", className: "bg-blue-100 text-blue-800 border-blue-200" },
  confirmed: { label: "Potwierdzone", className: "bg-blue-100 text-blue-800 border-blue-200" },
  delivered: { label: "Dostarczone", className: "bg-green-100 text-green-800 border-green-200" },
  cancelled: { label: "Anulowane", className: "bg-red-100 text-red-800 border-red-200" },
};

export function PurchaseOrdersList({ salonId, onReorder }: PurchaseOrdersListProps) {
  const { orders, isLoading, getOrderItems, receiveDelivery, updateOrderStatus } = usePurchaseOrders(salonId);
  const [receiveModal, setReceiveModal] = useState<{
    orderId: string;
    orderNumber: string;
    items: (PurchaseOrderItem & { editQty: number })[];
  } | null>(null);
  const [detailModal, setDetailModal] = useState<{
    order: typeof orders[0];
    items: PurchaseOrderItem[];
  } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openReceiveModal = async (orderId: string, orderNumber: string) => {
    setLoadingId(orderId);
    try {
      const items = await getOrderItems(orderId);
      setReceiveModal({
        orderId,
        orderNumber,
        items: items.map((i) => ({ ...i, editQty: i.quantity_ordered })),
      });
    } catch {
      toast.error("Nie udało się pobrać pozycji zamówienia");
    }
    setLoadingId(null);
  };

  const openDetailModal = async (order: typeof orders[0]) => {
    setLoadingId(order.id);
    try {
      const items = await getOrderItems(order.id);
      setDetailModal({ order, items });
    } catch {
      toast.error("Nie udało się pobrać pozycji zamówienia");
    }
    setLoadingId(null);
  };

  const handleReceive = async () => {
    if (!receiveModal || !salonId) return;
    await receiveDelivery.mutateAsync({
      orderId: receiveModal.orderId,
      salonId,
      items: receiveModal.items.map((i) => ({
        id: i.id,
        product_id: i.product_id,
        quantity_delivered: i.editQty,
        unit_price_net: i.unit_price_net,
      })),
    });
    setReceiveModal(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Historia zamówień
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>#</TableHead>
                  <TableHead>Dostawca</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Wartość brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Brak zamówień
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const cfg = statusConfig[order.status] || statusConfig.draft;
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-sm">
                          {order.order_number || "—"}
                        </TableCell>
                        <TableCell>{order.suppliers?.name || "—"}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(order.created_at), "d MMM yyyy", { locale: pl })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {order.total_gross?.toFixed(2) || "0.00"} zł
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", cfg.className)}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openDetailModal(order)}
                              disabled={loadingId === order.id}
                            >
                              {loadingId === order.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </Button>
                            {(order.status === "sent" || order.status === "confirmed") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600"
                                onClick={() => openReceiveModal(order.id, order.order_number || "")}
                                disabled={loadingId === order.id}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onReorder(order.id)}
                              disabled={loadingId === order.id}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          </div>
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

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Zamówienie {detailModal?.order.order_number || ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Dostawca:</span>{" "}
                {detailModal?.order.suppliers?.name || "—"}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                {statusConfig[detailModal?.order.status || "draft"]?.label}
              </div>
              <div>
                <span className="text-muted-foreground">Wartość netto:</span>{" "}
                {detailModal?.order.total_net?.toFixed(2)} zł
              </div>
              <div>
                <span className="text-muted-foreground">Wartość brutto:</span>{" "}
                {detailModal?.order.total_gross?.toFixed(2)} zł
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-center">Zamówiono</TableHead>
                    <TableHead className="text-center">Dostarczono</TableHead>
                    <TableHead className="text-right">Cena netto</TableHead>
                    <TableHead className="text-right">Razem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailModal?.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
                      <TableCell className="text-center">{item.quantity_ordered}</TableCell>
                      <TableCell className="text-center">{item.quantity_delivered}</TableCell>
                      <TableCell className="text-right">{item.unit_price_net?.toFixed(2)} zł</TableCell>
                      <TableCell className="text-right">{item.total_net?.toFixed(2)} zł</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Delivery Modal */}
      <Dialog open={!!receiveModal} onOpenChange={() => setReceiveModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Przyjęcie dostawy {receiveModal?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Produkt</TableHead>
                  <TableHead className="text-center">Zamówiono</TableHead>
                  <TableHead className="text-center w-28">Dostarczone</TableHead>
                  <TableHead className="text-center">Różnica</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receiveModal?.items.map((item) => {
                  const diff = item.editQty - item.quantity_ordered;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
                      <TableCell className="text-center">{item.quantity_ordered}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={item.editQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setReceiveModal((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    items: prev.items.map((i) =>
                                      i.id === item.id ? { ...i, editQty: val } : i
                                    ),
                                  }
                                : null
                            );
                          }}
                          className="h-8 text-center w-20 mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {diff !== 0 && (
                          <span className={diff < 0 ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                            {diff > 0 ? "+" : ""}{diff}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {receiveModal?.items.some((i) => i.editQty < i.quantity_ordered) && (
            <p className="text-sm text-muted-foreground">
              ⚠️ Brakujące produkty zostaną odnotowane jako niedostarczone.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveModal(null)}>Anuluj</Button>
            <Button onClick={handleReceive} disabled={receiveDelivery.isPending} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Potwierdź przyjęcie dostawy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

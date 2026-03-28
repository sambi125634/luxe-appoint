import { useState, useMemo } from "react";
import { Package, Plus, Trash2, AlertTriangle, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { format } from "date-fns";

interface OrderItem {
  tempId: string;
  product_id: string | null;
  product_name: string;
  current_stock: number;
  min_stock: number;
  quantity: number;
  unit_price_net: number;
  vat_rate: number;
}

interface BulkOrderFormProps {
  salonId?: string;
  onClose: () => void;
}

export function BulkOrderForm({ salonId, onClose }: BulkOrderFormProps) {
  const { products } = useProducts(salonId);
  const { suppliers } = useSuppliers(salonId);
  const { createOrder } = usePurchaseOrders(salonId);

  const [supplierId, setSupplierId] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState(
    `ZAM/${format(new Date(), "yyyy")}/${String(Date.now()).slice(-4)}`
  );
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);

  const usedProductIds = new Set(items.map((i) => i.product_id));

  const availableProducts = products.filter(
    (p) => p.is_active && !usedProductIds.has(p.id)
  );

  const addEmptyRow = () => {
    setItems((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        product_id: null,
        product_name: "",
        current_stock: 0,
        min_stock: 0,
        quantity: 1,
        unit_price_net: 0,
        vat_rate: 23,
      },
    ]);
  };

  const selectProduct = (tempId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const suggestedQty = Math.max(0, product.min_stock * 2 - product.current_stock);
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId
          ? {
              ...item,
              product_id: product.id,
              product_name: product.name,
              current_stock: product.current_stock,
              min_stock: product.min_stock,
              quantity: suggestedQty || 1,
              unit_price_net: product.purchase_price_net ?? 0,
              vat_rate: product.vat_rate,
            }
          : item
      )
    );
  };

  const updateItem = (tempId: string, field: keyof OrderItem, value: number | string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (tempId: string) => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const addBelowMinimum = () => {
    const belowMin = products.filter(
      (p) => p.is_active && p.current_stock < p.min_stock && !usedProductIds.has(p.id)
    );
    if (belowMin.length === 0) {
      toast.info("Wszystkie produkty mają stan powyżej minimum");
      return;
    }
    const newItems: OrderItem[] = belowMin.map((p) => ({
      tempId: crypto.randomUUID(),
      product_id: p.id,
      product_name: p.name,
      current_stock: p.current_stock,
      min_stock: p.min_stock,
      quantity: Math.max(1, p.min_stock * 2 - p.current_stock),
      unit_price_net: p.purchase_price_net ?? 0,
      vat_rate: p.vat_rate,
    }));
    setItems((prev) => [...prev, ...newItems]);
    toast.success(`Dodano ${newItems.length} produktów poniżej minimum`);
  };

  const addFromSupplier = () => {
    if (!supplierId) {
      toast.info("Wybierz najpierw dostawcę");
      return;
    }
    const supplierProducts = products.filter(
      (p) => p.is_active && p.supplier_id === supplierId && !usedProductIds.has(p.id)
    );
    if (supplierProducts.length === 0) {
      toast.info("Brak produktów przypisanych do tego dostawcy");
      return;
    }
    const newItems: OrderItem[] = supplierProducts.map((p) => ({
      tempId: crypto.randomUUID(),
      product_id: p.id,
      product_name: p.name,
      current_stock: p.current_stock,
      min_stock: p.min_stock,
      quantity: Math.max(1, p.min_stock * 2 - p.current_stock),
      unit_price_net: p.purchase_price_net ?? 0,
      vat_rate: p.vat_rate,
    }));
    setItems((prev) => [...prev, ...newItems]);
    toast.success(`Dodano ${newItems.length} produktów od dostawcy`);
  };

  const summary = useMemo(() => {
    const totalProducts = items.filter((i) => i.product_id).length;
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const totalNet = items.reduce((s, i) => s + i.quantity * i.unit_price_net, 0);
    const totalVat = items.reduce(
      (s, i) => s + i.quantity * i.unit_price_net * (i.vat_rate / 100),
      0
    );
    return { totalProducts, totalQty, totalNet, totalVat, totalGross: totalNet + totalVat };
  }, [items]);

  const handleSave = async (status: "draft" | "sent") => {
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Dodaj przynajmniej jeden produkt");
      return;
    }
    if (!salonId) return;

    await createOrder.mutateAsync({
      salon_id: salonId,
      supplier_id: supplierId || null,
      order_number: orderNumber,
      notes: notes || undefined,
      status,
      ordered_at: status === "sent" ? new Date().toISOString() : undefined,
      total_net: summary.totalNet,
      total_gross: summary.totalGross,
      items: validItems.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity_ordered: i.quantity,
        unit_price_net: i.unit_price_net,
        vat_rate: i.vat_rate,
        total_net: i.quantity * i.unit_price_net,
      })),
    });

    if (status === "sent") {
      const supplier = suppliers.find((s) => s.id === supplierId);
      if (supplier?.email) {
        const productList = validItems
          .map((i) => `${i.product_name} — ${i.quantity} szt.`)
          .join("\n");
        const subject = encodeURIComponent(`Zamówienie ${orderNumber}`);
        const body = encodeURIComponent(
          `Dzień dobry,\n\nProszę o realizację zamówienia ${orderNumber}:\n\n${productList}\n\nŁączna wartość netto: ${summary.totalNet.toFixed(2)} zł\n\nPozdrawiam`
        );
        window.open(`mailto:${supplier.email}?subject=${subject}&body=${body}`);
      }
      toast.success(`Zamówienie ${orderNumber} wysłane`);
    }

    onClose();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Nowe zamówienie zbiorcze
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dostawca</label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz dostawcę..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nr zamówienia</label>
              <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notatki</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Opcjonalne uwagi..." />
          </div>
        </CardContent>
      </Card>

      {/* Quick fill buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={addBelowMinimum}>
          <AlertTriangle className="w-4 h-4" />
          Dodaj wszystkie poniżej minimum
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={addFromSupplier}>
          <Building2 className="w-4 h-4" />
          Dodaj od dostawcy
        </Button>
        {items.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => setItems([])}>
            <Trash2 className="w-4 h-4" />
            Wyczyść tabelę
          </Button>
        )}
      </div>

      {/* Items table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-[200px]">Produkt</TableHead>
                  <TableHead className="text-center w-20">Stan</TableHead>
                  <TableHead className="text-center w-20">Min.</TableHead>
                  <TableHead className="text-center w-24">Zamów</TableHead>
                  <TableHead className="text-right w-28">Cena netto</TableHead>
                  <TableHead className="text-center w-20">VAT</TableHead>
                  <TableHead className="text-right w-28">Razem</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Dodaj produkty do zamówienia
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>
                        {item.product_id ? (
                          <span className="font-medium text-sm">{item.product_name}</span>
                        ) : (
                          <Select onValueChange={(v) => selectProduct(item.tempId, v)}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Wybierz produkt..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} {p.brand ? `(${p.brand})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.current_stock < item.min_stock ? "destructive" : "secondary"} className="text-xs">
                          {item.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {item.min_stock}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.tempId, "quantity", parseInt(e.target.value) || 1)}
                          className="h-8 text-center w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price_net}
                          onChange={(e) => updateItem(item.tempId, "unit_price_net", parseFloat(e.target.value) || 0)}
                          className="h-8 text-right w-24"
                        />
                      </TableCell>
                      <TableCell className="text-center text-sm">{item.vat_rate}%</TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {(item.quantity * item.unit_price_net).toFixed(2)} zł
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.tempId)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={addEmptyRow}>
              <Plus className="w-4 h-4" />
              Dodaj produkt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {items.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Produktów</p>
                <p className="text-lg font-bold">{summary.totalProducts}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Łącznie sztuk</p>
                <p className="text-lg font-bold">{summary.totalQty}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wartość netto</p>
                <p className="text-lg font-bold">{summary.totalNet.toFixed(2)} zł</p>
              </div>
              <div>
                <p className="text-muted-foreground">VAT</p>
                <p className="text-lg font-bold">{summary.totalVat.toFixed(2)} zł</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wartość brutto</p>
                <p className="text-lg font-bold text-primary">{summary.totalGross.toFixed(2)} zł</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>Anuluj</Button>
        <Button variant="secondary" onClick={() => handleSave("draft")} disabled={createOrder.isPending}>
          Zapisz szkic
        </Button>
        <Button onClick={() => handleSave("sent")} disabled={createOrder.isPending} className="gap-2">
          <Mail className="w-4 h-4" />
          Wyślij do dostawcy
        </Button>
      </div>
    </div>
  );
}

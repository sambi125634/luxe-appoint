import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Supplier, StockMovement } from "../types";

interface DeliveryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  onSave: (delivery: Omit<StockMovement, "id" | "created_at">) => void;
}

export function DeliveryFormModal({ open, onOpenChange, products, suppliers, onSave }: DeliveryFormModalProps) {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    product_id: "",
    supplier_id: "",
    quantity: 1,
    unit_price: 0,
    invoice_number: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      salon_id: "demo",
      product_id: formData.product_id,
      supplier_id: formData.supplier_id || undefined,
      type: "delivery",
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      total_value: formData.quantity * formData.unit_price,
      invoice_number: formData.invoice_number || undefined,
    });

    // Reset form
    setFormData({
      product_id: "",
      supplier_id: "",
      quantity: 1,
      unit_price: 0,
      invoice_number: "",
    });
  };

  const selectedProduct = products.find((p) => p.id === formData.product_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("products.addDelivery")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("products.product")} *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => {
                const product = products.find((p) => p.id === value);
                setFormData({
                  ...formData,
                  product_id: value,
                  unit_price: product?.purchase_price_net || 0,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.selectProduct")} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} {product.brand && `(${product.brand})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("products.supplier")}</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("products.selectSupplier")} />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("products.quantity")} *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">{t("products.unitPrice")} (netto)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">{t("products.totalValue")}: </span>
            <span className="font-bold">
              {(formData.quantity * formData.unit_price).toLocaleString()} zł
            </span>
            {selectedProduct && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("products.currentStock")}: {selectedProduct.current_stock} → {selectedProduct.current_stock + formData.quantity}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_number">{t("products.invoiceNumber")}</Label>
            <Input
              id="invoice_number"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              placeholder="np. FV/2024/001"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!formData.product_id}>
              {t("products.addDelivery")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

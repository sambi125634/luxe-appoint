import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { productCategories, type Product } from "../types";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

export function ProductFormModal({ open, onOpenChange, product, onSave }: ProductFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!product;

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    brand: "",
    category: "",
    sku: "",
    ean: "",
    variant: "",
    sale_price_gross: 0,
    purchase_price_net: 0,
    vat_rate: 23,
    min_stock: 0,
    current_stock: 0,
    is_active: true,
    is_for_internal_use: false,
    description: "",
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        brand: "",
        category: "",
        sku: "",
        ean: "",
        variant: "",
        sale_price_gross: 0,
        purchase_price_net: 0,
        vat_rate: 23,
        min_stock: 0,
        current_stock: 0,
        is_active: true,
        is_for_internal_use: false,
        description: "",
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: product?.id || "",
      salon_id: product?.salon_id || "demo",
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Product);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("products.editProduct") : t("products.addProduct")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("products.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">{t("products.brand")}</Label>
              <Input
                id="brand"
                value={formData.brand || ""}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("products.category")} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("products.selectCategory")} />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {productCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">{t("products.variant")}</Label>
              <Input
                id="variant"
                value={formData.variant || ""}
                onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                placeholder="np. 50ml, 200ml"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ean">EAN</Label>
              <Input
                id="ean"
                value={formData.ean || ""}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price_gross">{t("products.salePrice")} (brutto) *</Label>
              <Input
                id="sale_price_gross"
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price_gross}
                onChange={(e) => setFormData({ ...formData, sale_price_gross: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price_net">{t("products.purchasePrice")} (netto)</Label>
              <Input
                id="purchase_price_net"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price_net || ""}
                onChange={(e) => setFormData({ ...formData, purchase_price_net: parseFloat(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_rate">{t("products.vatRate")} (%)</Label>
              <Select
                value={formData.vat_rate?.toString()}
                onValueChange={(value) => setFormData({ ...formData, vat_rate: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="23">23%</SelectItem>
                  <SelectItem value="8">8%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="0">0%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">{t("products.minStock")}</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="current_stock">{t("products.initialStock")}</Label>
                <Input
                  id="current_stock"
                  type="number"
                  min="0"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("products.description")}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">{t("products.active")}</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_for_internal_use"
                checked={formData.is_for_internal_use}
                onCheckedChange={(checked) => setFormData({ ...formData, is_for_internal_use: checked })}
              />
              <Label htmlFor="is_for_internal_use">{t("products.internalUseOnly")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              {isEditing ? t("common.save") : t("products.addProduct")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

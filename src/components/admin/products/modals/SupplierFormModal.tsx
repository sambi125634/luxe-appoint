import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Supplier } from "../types";
import { useSalonId } from "@/hooks/useSalonId";

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSave: (supplier: Supplier) => void;
}

export function SupplierFormModal({ open, onOpenChange, supplier, onSave }: SupplierFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!supplier;

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    payment_terms: "",
    discount_info: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        payment_terms: "",
        discount_info: "",
        notes: "",
        is_active: true,
      });
    }
  }, [supplier, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: supplier?.id || "",
      salon_id: supplier?.salon_id || "demo",
      created_at: supplier?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Supplier);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("products.editSupplier") : t("products.addSupplier")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("products.supplierName")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">{t("products.contactPerson")}</Label>
            <Input
              id="contact_person"
              value={formData.contact_person || ""}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("products.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("products.phone")}</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("products.address")}</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_terms">{t("products.paymentTerms")}</Label>
            <Input
              id="payment_terms"
              value={formData.payment_terms || ""}
              onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
              placeholder="np. Przelew 14 dni"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_info">{t("products.discountInfo")}</Label>
            <Input
              id="discount_info"
              value={formData.discount_info || ""}
              onChange={(e) => setFormData({ ...formData, discount_info: e.target.value })}
              placeholder="np. Rabat 15% od 2000 PLN"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("products.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">
              {isEditing ? t("common.save") : t("products.addSupplier")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

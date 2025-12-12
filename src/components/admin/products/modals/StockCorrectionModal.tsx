import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Product } from "../types";

interface StockCorrectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (productId: string, quantity: number, note: string) => void;
}

export function StockCorrectionModal({ open, onOpenChange, product, onSave }: StockCorrectionModalProps) {
  const { t } = useTranslation();
  const [correctionType, setCorrectionType] = useState<"add" | "subtract">("add");
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    const finalQuantity = correctionType === "subtract" ? -quantity : quantity;
    onSave(product.id, finalQuantity, note);
    
    // Reset form
    setCorrectionType("add");
    setQuantity(1);
    setNote("");
  };

  if (!product) return null;

  const newStock = product.current_stock + (correctionType === "subtract" ? -quantity : quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("products.stockCorrection")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {t("products.currentStock")}: <span className="font-medium">{product.current_stock}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("products.correctionType")}</Label>
            <RadioGroup
              value={correctionType}
              onValueChange={(v) => setCorrectionType(v as "add" | "subtract")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="cursor-pointer">
                  {t("products.addStock")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subtract" id="subtract" />
                <Label htmlFor="subtract" className="cursor-pointer">
                  {t("products.subtractStock")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("products.quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={correctionType === "subtract" ? product.current_stock : 9999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
            />
          </div>

          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">{t("products.newStock")}: </span>
            <span className={`font-bold ${newStock < 0 ? "text-destructive" : newStock <= product.min_stock ? "text-yellow-600" : "text-green-600"}`}>
              {newStock}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t("products.correctionNote")}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("products.correctionNotePlaceholder")}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={newStock < 0}>
              {t("products.applyCorrection")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

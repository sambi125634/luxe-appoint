import { useState } from "react";
import { format } from "date-fns";
import { Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ManualEntryModalProps {
  onAddTransaction: (transaction: ManualTransaction) => void;
}

export interface ManualTransaction {
  date: string;
  time: string;
  itemType: "usługa" | "produkt";
  itemCategory: string;
  itemName: string;
  quantity: number;
  unitPriceBrutto: number;
  discountAmount: number;
  vatRate: number;
  paymentMethod: "gotówka" | "karta" | "online" | "voucher" | "depozyt";
  tipAmount: number;
  clientName: string;
  staffName: string;
  notes: string;
}

const CATEGORIES = [
  "Twarz",
  "Ciało",
  "Depilacja",
  "Kosmetyki",
  "Włosy",
  "Paznokcie",
  "Inne",
];

const STAFF_MEMBERS = [
  "Maria Kowalczyk",
  "Aleksandra Wiśniewska",
  "Natalia Kamińska",
];

export function ManualEntryModal({ onAddTransaction }: ManualEntryModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ManualTransaction>({
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    itemType: "usługa",
    itemCategory: "Twarz",
    itemName: "",
    quantity: 1,
    unitPriceBrutto: 0,
    discountAmount: 0,
    vatRate: 23,
    paymentMethod: "gotówka",
    tipAmount: 0,
    clientName: "",
    staffName: "",
    notes: "",
  });

  const calculateNetAndVat = () => {
    const gross = formData.unitPriceBrutto * formData.quantity - formData.discountAmount;
    const net = gross / (1 + formData.vatRate / 100);
    const vat = gross - net;
    return { net: net.toFixed(2), vat: vat.toFixed(2), gross: gross.toFixed(2) };
  };

  const { net, vat, gross } = calculateNetAndVat();

  const handleSubmit = () => {
    if (!formData.itemName || formData.unitPriceBrutto <= 0) {
      toast({
        title: t('accounting.validationError'),
        description: t('accounting.fillNameAndPrice'),
        variant: "destructive",
      });
      return;
    }

    onAddTransaction(formData);
    toast({
      title: t('accounting.transactionAdded'),
      description: `${formData.itemName} - ${gross} PLN`,
    });
    setOpen(false);
    // Reset form
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      itemType: "usługa",
      itemCategory: "Twarz",
      itemName: "",
      quantity: 1,
      unitPriceBrutto: 0,
      discountAmount: 0,
      vatRate: 23,
      paymentMethod: "gotówka",
      tipAmount: 0,
      clientName: "",
      staffName: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('accounting.addManually')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {t('accounting.addManualTransaction')}
          </DialogTitle>
          <DialogDescription>
            {t('accounting.manualTransactionDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('accounting.date')}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">{t('accounting.time')}</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('accounting.type')}</Label>
              <Select
                value={formData.itemType}
                onValueChange={(v: "usługa" | "produkt") =>
                  setFormData({ ...formData, itemType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usługa">{t('accounting.services')}</SelectItem>
                  <SelectItem value="produkt">{t('accounting.products')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('accounting.category')}</Label>
              <Select
                value={formData.itemCategory}
                onValueChange={(v) => setFormData({ ...formData, itemCategory: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">{t('accounting.serviceProductName')} *</Label>
            <Input
              id="itemName"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder={t('accounting.serviceProductPlaceholder')}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t('accounting.quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{t('accounting.grossPrice')} *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPriceBrutto || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPriceBrutto: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">{t('accounting.discountPln')}</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* VAT & Payment */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('accounting.vatRate')}</Label>
              <Select
                value={formData.vatRate.toString()}
                onValueChange={(v) => setFormData({ ...formData, vatRate: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="23">23%</SelectItem>
                  <SelectItem value="8">8%</SelectItem>
                  <SelectItem value="0">0% ({t('accounting.exempt')})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('accounting.paymentMethod')}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gotówka">{t('accounting.cash')}</SelectItem>
                  <SelectItem value="karta">{t('accounting.card')}</SelectItem>
                  <SelectItem value="online">{t('accounting.onlineBlik')}</SelectItem>
                  <SelectItem value="voucher">{t('accounting.voucher')}</SelectItem>
                  <SelectItem value="depozyt">{t('accounting.deposit')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip">{t('accounting.tipPln')}</Label>
              <Input
                id="tip"
                type="number"
                min="0"
                step="0.01"
                value={formData.tipAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Client & Staff */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">{t('accounting.clientOptional')}</Label>
              <Input
                id="client"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder={t('accounting.nameAndSurname')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('accounting.employee')}</Label>
              <Select
                value={formData.staffName}
                onValueChange={(v) => setFormData({ ...formData, staffName: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('accounting.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_MEMBERS.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('accounting.notesField')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('accounting.additionalInfo')}
              rows={2}
            />
          </div>

          {/* Calculation Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">{t('accounting.calculationSummary')}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('accounting.net')}:</span>
                <span className="ml-2 font-medium">{net} PLN</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('accounting.vat')} ({formData.vatRate}%):</span>
                <span className="ml-2 font-medium">{vat} PLN</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('accounting.gross')}:</span>
                <span className="ml-2 font-bold text-primary">{gross} PLN</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>{t('accounting.addTransaction')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
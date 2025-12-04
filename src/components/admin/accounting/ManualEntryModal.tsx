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
        title: "Błąd walidacji",
        description: "Uzupełnij nazwę i cenę pozycji.",
        variant: "destructive",
      });
      return;
    }

    onAddTransaction(formData);
    toast({
      title: "Dodano transakcję",
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
          Dodaj ręcznie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Dodaj transakcję ręcznie
          </DialogTitle>
          <DialogDescription>
            Wprowadź dane transakcji, które nie zostały zarejestrowane automatycznie.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Godzina</Label>
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
              <Label>Typ</Label>
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
                  <SelectItem value="usługa">Usługa</SelectItem>
                  <SelectItem value="produkt">Produkt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategoria</Label>
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
            <Label htmlFor="itemName">Nazwa usługi / produktu *</Label>
            <Input
              id="itemName"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="np. Mezoterapia twarzy, Krem nawilżający"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Ilość</Label>
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
              <Label htmlFor="price">Cena brutto (PLN) *</Label>
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
              <Label htmlFor="discount">Rabat (PLN)</Label>
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
              <Label>Stawka VAT</Label>
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
                  <SelectItem value="0">0% (zw.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Metoda płatności</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(v: any) => setFormData({ ...formData, paymentMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gotówka">Gotówka</SelectItem>
                  <SelectItem value="karta">Karta</SelectItem>
                  <SelectItem value="online">Online / BLIK</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="depozyt">Depozyt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tip">Napiwek (PLN)</Label>
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
              <Label htmlFor="client">Klient (opcjonalnie)</Label>
              <Input
                id="client"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Imię i nazwisko"
              />
            </div>
            <div className="space-y-2">
              <Label>Pracownik</Label>
              <Select
                value={formData.staffName}
                onValueChange={(v) => setFormData({ ...formData, staffName: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz pracownika" />
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
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Dodatkowe informacje o transakcji..."
              rows={2}
            />
          </div>

          {/* Calculation Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Podsumowanie kalkulacji</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Netto:</span>
                <span className="ml-2 font-medium">{net} PLN</span>
              </div>
              <div>
                <span className="text-muted-foreground">VAT ({formData.vatRate}%):</span>
                <span className="ml-2 font-medium">{vat} PLN</span>
              </div>
              <div>
                <span className="text-muted-foreground">Brutto:</span>
                <span className="ml-2 font-bold text-primary">{gross} PLN</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit}>Dodaj transakcję</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

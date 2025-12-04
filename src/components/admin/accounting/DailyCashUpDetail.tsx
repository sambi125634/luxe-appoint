import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft, Lock, Banknote, CreditCard, Globe, Ticket, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailyClosing, Transaction, PaymentMethodSummary } from "./types";
import { mockTransactions } from "./mockData";
import { cn } from "@/lib/utils";

interface DailyCashUpDetailProps {
  day: DailyClosing;
  onBack: () => void;
  onCloseDay: (dayId: string, actualCash: number) => void;
}

export function DailyCashUpDetail({ day, onBack, onCloseDay }: DailyCashUpDetailProps) {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [actualCash, setActualCash] = useState<string>("");

  const dayTransactions = mockTransactions.filter(
    (t) => t.dateTime.split("T")[0] === day.date
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const paymentSummary: PaymentMethodSummary[] = [
    { method: "Gotówka", transactionCount: dayTransactions.filter(t => t.paymentMethod === "gotówka").length, totalGross: day.cashGross },
    { method: "Karta", transactionCount: dayTransactions.filter(t => t.paymentMethod === "karta").length, totalGross: day.cardGross },
    { method: "Online", transactionCount: dayTransactions.filter(t => t.paymentMethod === "online").length, totalGross: day.onlineGross },
    { method: "Vouchery", transactionCount: dayTransactions.filter(t => t.paymentMethod === "voucher").length, totalGross: day.voucherGross },
    { method: "Depozyty", transactionCount: dayTransactions.filter(t => t.paymentMethod === "depozyt").length, totalGross: day.depositGross },
  ];

  const totalGross = day.totalServicesGross + day.totalProductsGross;
  const cashDifference = actualCash ? parseFloat(actualCash) - day.expectedCashInDrawer : null;

  const handleCloseDay = () => {
    if (actualCash) {
      onCloseDay(day.id, parseFloat(actualCash));
      setShowCloseModal(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "Gotówka": return <Banknote className="w-4 h-4" />;
      case "Karta": return <CreditCard className="w-4 h-4" />;
      case "Online": return <Globe className="w-4 h-4" />;
      case "Vouchery": return <Ticket className="w-4 h-4" />;
      case "Depozyty": return <PiggyBank className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">
              {format(new Date(day.date), "EEEE, dd MMMM yyyy", { locale: pl })}
            </h2>
            <p className="text-sm text-muted-foreground">Raport kasowy dnia</p>
          </div>
        </div>
        {day.status === "otwarte" && (
          <Button onClick={() => setShowCloseModal(true)} className="gap-2">
            <Lock className="w-4 h-4" />
            Zamknij dzień
          </Button>
        )}
        {day.status === "zamknięte" && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Zamknięte przez {day.closedByUserName}
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Łączna sprzedaż</p>
          <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Usługi</p>
          <p className="text-2xl font-bold">{formatCurrency(day.totalServicesGross)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Produkty</p>
          <p className="text-2xl font-bold">{formatCurrency(day.totalProductsGross)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Napiwki</p>
          <p className="text-2xl font-bold">{formatCurrency(day.totalTips)}</p>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Podział wg metod płatności</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Metoda płatności</TableHead>
              <TableHead className="text-right">Liczba transakcji</TableHead>
              <TableHead className="text-right">Suma brutto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentSummary.map((ps) => (
              <TableRow key={ps.method}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(ps.method)}
                    {ps.method}
                  </div>
                </TableCell>
                <TableCell className="text-right">{ps.transactionCount}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(ps.totalGross)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Transactions List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Transakcje dnia ({dayTransactions.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Godzina</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead className="text-right">Kwota brutto</TableHead>
              <TableHead className="text-right">VAT</TableHead>
              <TableHead>Metoda</TableHead>
              <TableHead>Pracownik</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dayTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-sm">
                  {format(new Date(t.dateTime), "HH:mm")}
                </TableCell>
                <TableCell>{t.clientName || "—"}</TableCell>
                <TableCell>
                  <Badge variant={t.itemType === "usługa" ? "default" : "secondary"}>
                    {t.itemType}
                  </Badge>
                </TableCell>
                <TableCell>{t.itemName}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(t.grossAmount)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(t.vatAmount)}</TableCell>
                <TableCell className="capitalize">{t.paymentMethod}</TableCell>
                <TableCell>{t.staffName || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Close Day Modal */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zamknij dzień</DialogTitle>
            <DialogDescription>
              Wprowadź rzeczywistą ilość gotówki w kasie, aby zamknąć dzień.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Oczekiwana gotówka w kasie:</span>
              <span className="font-semibold">{formatCurrency(day.expectedCashInDrawer)}</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualCash">Rzeczywista gotówka w kasie</Label>
              <Input
                id="actualCash"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
              />
            </div>
            {cashDifference !== null && (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                cashDifference === 0 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : cashDifference > 0 
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              )}>
                <span className="text-sm">Różnica:</span>
                <span className={cn(
                  "font-semibold",
                  cashDifference === 0 
                    ? "text-green-700 dark:text-green-400" 
                    : cashDifference > 0 
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-red-700 dark:text-red-400"
                )}>
                  {cashDifference > 0 ? "+" : ""}{formatCurrency(cashDifference)}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseModal(false)}>
              Anuluj
            </Button>
            <Button onClick={handleCloseDay} disabled={!actualCash}>
              Zamknij dzień
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

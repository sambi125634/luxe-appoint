import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Download, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction, VatSummary } from "./types";
import { mockTransactions } from "./mockData";

interface SalesVatReportProps {
  dateRange: { from: Date; to: Date };
}

export function SalesVatReport({ dateRange }: SalesVatReportProps) {
  const [isDailyView, setIsDailyView] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVat, setFilterVat] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  // Filter transactions
  let filteredTransactions = mockTransactions.filter((t) => t.status === "opłacone");
  
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.itemType === filterType);
  }
  if (filterVat !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.vatRate === parseInt(filterVat));
  }
  if (filterPayment !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.paymentMethod === filterPayment);
  }
  if (filterStaff !== "all") {
    filteredTransactions = filteredTransactions.filter((t) => t.staffId === filterStaff);
  }

  // Calculate totals
  const totalGross = filteredTransactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalNet = filteredTransactions.reduce((sum, t) => sum + t.netAmount, 0);
  const totalVat = filteredTransactions.reduce((sum, t) => sum + t.vatAmount, 0);

  // VAT breakdown
  const vatRates = [...new Set(filteredTransactions.map((t) => t.vatRate))].sort((a, b) => b - a);
  const vatSummaries: VatSummary[] = vatRates.map((rate) => {
    const rateTransactions = filteredTransactions.filter((t) => t.vatRate === rate);
    return {
      rate,
      netAmount: rateTransactions.reduce((sum, t) => sum + t.netAmount, 0),
      vatAmount: rateTransactions.reduce((sum, t) => sum + t.vatAmount, 0),
      grossAmount: rateTransactions.reduce((sum, t) => sum + t.grossAmount, 0),
    };
  });

  // Daily aggregation
  const dailyData = isDailyView
    ? Object.entries(
        filteredTransactions.reduce((acc, t) => {
          const date = t.dateTime.split("T")[0];
          if (!acc[date]) {
            acc[date] = { date, net: 0, vat: 0, gross: 0, count: 0 };
          }
          acc[date].net += t.netAmount;
          acc[date].vat += t.vatAmount;
          acc[date].gross += t.grossAmount;
          acc[date].count += 1;
          return acc;
        }, {} as Record<string, { date: string; net: number; vat: number; gross: number; count: number }>)
      )
        .map(([, data]) => data)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  // Unique staff for filter
  const staffList = [...new Set(mockTransactions.filter((t) => t.staffId).map((t) => ({ id: t.staffId!, name: t.staffName! })))];
  const uniqueStaff = staffList.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Obrót brutto</p>
          <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Obrót netto</p>
          <p className="text-2xl font-bold">{formatCurrency(totalNet)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">VAT należny</p>
          <p className="text-2xl font-bold">{formatCurrency(totalVat)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Transakcji</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>
      </div>

      {/* VAT Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vatSummaries.map((vs) => (
          <div key={vs.rate} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-sm">
                VAT {vs.rate}%
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Netto:</span>
                <span>{formatCurrency(vs.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT:</span>
                <span>{formatCurrency(vs.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-border">
                <span>Brutto:</span>
                <span>{formatCurrency(vs.grossAmount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="usługa">Usługi</SelectItem>
            <SelectItem value="produkt">Produkty</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterVat} onValueChange={setFilterVat}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stawka VAT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie stawki</SelectItem>
            <SelectItem value="23">23%</SelectItem>
            <SelectItem value="8">8%</SelectItem>
            <SelectItem value="0">0%</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Metoda płatności" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie metody</SelectItem>
            <SelectItem value="gotówka">Gotówka</SelectItem>
            <SelectItem value="karta">Karta</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="voucher">Voucher</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStaff} onValueChange={setFilterStaff}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pracownik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy pracownicy</SelectItem>
            {uniqueStaff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Switch
            id="view-mode"
            checked={isDailyView}
            onCheckedChange={setIsDailyView}
          />
          <Label htmlFor="view-mode" className="text-sm">
            Widok dzienny
          </Label>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Eksport CSV
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isDailyView ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Liczba transakcji</TableHead>
                <TableHead className="text-right">Wartość netto</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Wartość brutto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyData.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {format(new Date(day.date), "EEEE, dd MMM yyyy", { locale: pl })}
                  </TableCell>
                  <TableCell className="text-right">{day.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(day.net)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(day.vat)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(day.gross)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>Godz.</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead className="text-right">Ilość</TableHead>
                <TableHead className="text-right">Cena jedn.</TableHead>
                <TableHead className="text-right">Rabat</TableHead>
                <TableHead className="text-right">Netto</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-center">Stawka</TableHead>
                <TableHead className="text-right">Brutto</TableHead>
                <TableHead>Metoda</TableHead>
                <TableHead>Pracownik</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    {format(new Date(t.dateTime), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(t.dateTime), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.itemType === "usługa" ? "default" : "secondary"} className="text-xs">
                      {t.itemType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{t.itemCategory}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{t.itemName}</TableCell>
                  <TableCell className="text-right">{t.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(t.unitPriceBrutto)}</TableCell>
                  <TableCell className="text-right">
                    {t.discountAmount > 0 ? (
                      <span className="text-red-600">-{formatCurrency(t.discountAmount)}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(t.netAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(t.vatAmount)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {t.vatRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(t.grossAmount)}</TableCell>
                  <TableCell className="capitalize text-sm">{t.paymentMethod}</TableCell>
                  <TableCell className="text-sm">{t.staffName || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

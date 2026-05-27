import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { Download } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import { exportToCSV } from "@/lib/csvExport";
import { useToast } from "@/hooks/use-toast";

interface SalesVatReportProps {
  dateRange: { from: Date; to: Date };
  isDemo?: boolean;
  transactions?: Transaction[];
}

export function SalesVatReport({ dateRange, isDemo = false, transactions }: SalesVatReportProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isDailyView, setIsDailyView] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVat, setFilterVat] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterStaff, setFilterStaff] = useState<string>("all");
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  // Filter transactions by dateRange first, then by other filters
  const filteredTransactions = useMemo(() => {
    const source = transactions ?? (isDemo ? mockTransactions : []);
    let filtered = source.filter((tx) => {
      if (tx.status !== "opłacone") return false;
      const txDate = new Date(tx.dateTime);
      return isWithinInterval(txDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
    });

    if (filterType !== "all") {
      filtered = filtered.filter((tx) => tx.itemType === filterType);
    }
    if (filterVat !== "all") {
      filtered = filtered.filter((tx) => tx.vatRate === parseInt(filterVat));
    }
    if (filterPayment !== "all") {
      filtered = filtered.filter((tx) => tx.paymentMethod === filterPayment);
    }
    if (filterStaff !== "all") {
      filtered = filtered.filter((tx) => tx.staffId === filterStaff);
    }
    return filtered;
  }, [dateRange, filterType, filterVat, filterPayment, filterStaff, transactions, isDemo]);

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

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast({ title: "Brak danych do eksportu", variant: "destructive" });
      return;
    }
    exportToCSV({
      filename: "sprzedaz_vat",
      headers: [
        "Data", "Godzina", "Typ", "Kategoria", "Nazwa", "Ilość",
        "Cena jedn. brutto (zł)", "Rabat (zł)", "Netto (zł)", "VAT (zł)",
        "Stawka VAT (%)", "Brutto (zł)", "Metoda płatności", "Pracownik"
      ],
      rows: filteredTransactions.map(tx => [
        tx.dateTime.split("T")[0],
        tx.dateTime.split("T")[1]?.substring(0, 5) || "",
        tx.itemType,
        tx.itemCategory,
        tx.itemName,
        tx.quantity,
        tx.unitPriceBrutto,
        tx.discountAmount,
        Math.round(tx.netAmount * 100) / 100,
        Math.round(tx.vatAmount * 100) / 100,
        tx.vatRate,
        tx.grossAmount,
        tx.paymentMethod,
        tx.staffName || ""
      ])
    });
    toast({ title: "Eksport CSV zakończony", description: "Plik został pobrany." });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.grossRevenue')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.netRevenue')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totalNet)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.vatDue')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totalVat)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.transactions')}</p>
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
                <span className="text-muted-foreground">{t('accounting.net')}:</span>
                <span>{formatCurrency(vs.netAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('accounting.vat')}:</span>
                <span>{formatCurrency(vs.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-medium pt-1 border-t border-border">
                <span>{t('accounting.gross')}:</span>
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
            <SelectValue placeholder={t('accounting.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('accounting.allTypes')}</SelectItem>
            <SelectItem value="usługa">{t('accounting.services')}</SelectItem>
            <SelectItem value="produkt">{t('accounting.products')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterVat} onValueChange={setFilterVat}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('accounting.vatRate')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('accounting.allRates')}</SelectItem>
            <SelectItem value="23">23%</SelectItem>
            <SelectItem value="8">8%</SelectItem>
            <SelectItem value="0">0%</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('accounting.paymentMethod')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('accounting.allMethods')}</SelectItem>
            <SelectItem value="gotówka">{t('accounting.cash')}</SelectItem>
            <SelectItem value="karta">{t('accounting.card')}</SelectItem>
            <SelectItem value="online">{t('accounting.online')}</SelectItem>
            <SelectItem value="voucher">{t('accounting.voucher')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStaff} onValueChange={setFilterStaff}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('accounting.employee')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('accounting.allEmployees')}</SelectItem>
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
            {t('accounting.dailyView')}
          </Label>
        </div>

        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" />
          {t('accounting.exportCsv')}
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isDailyView ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.date')}</TableHead>
                <TableHead className="text-right">{t('accounting.transactionCount')}</TableHead>
                <TableHead className="text-right">{t('accounting.netValue')}</TableHead>
                <TableHead className="text-right">{t('accounting.vat')}</TableHead>
                <TableHead className="text-right">{t('accounting.grossValue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyData.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {format(new Date(day.date), "EEEE, dd MMM yyyy", { locale: dateLocale })}
                  </TableCell>
                  <TableCell className="text-right">{day.count}</TableCell>
                  <TableCell className="text-right">{formatCurrency(day.net)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(day.vat)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(day.gross)}</TableCell>
                </TableRow>
              ))}
              {dailyData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Brak transakcji w wybranym zakresie dat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{t('accounting.date')}</TableHead>
                <TableHead>{t('accounting.time')}</TableHead>
                <TableHead>{t('accounting.type')}</TableHead>
                <TableHead>{t('accounting.category')}</TableHead>
                <TableHead>{t('accounting.name')}</TableHead>
                <TableHead className="text-right">{t('accounting.quantity')}</TableHead>
                <TableHead className="text-right">{t('accounting.unitPrice')}</TableHead>
                <TableHead className="text-right">{t('accounting.discount')}</TableHead>
                <TableHead className="text-right">{t('accounting.net')}</TableHead>
                <TableHead className="text-right">{t('accounting.vat')}</TableHead>
                <TableHead className="text-center">{t('accounting.rate')}</TableHead>
                <TableHead className="text-right">{t('accounting.gross')}</TableHead>
                <TableHead>{t('accounting.method')}</TableHead>
                <TableHead>{t('accounting.employee')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">
                    {format(new Date(tx.dateTime), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(tx.dateTime), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.itemType === "usługa" ? "default" : "secondary"} className="text-xs">
                      {tx.itemType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{tx.itemCategory}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{tx.itemName}</TableCell>
                  <TableCell className="text-right">{tx.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.unitPriceBrutto)}</TableCell>
                  <TableCell className="text-right">
                    {tx.discountAmount > 0 ? (
                      <span className="text-red-600">-{formatCurrency(tx.discountAmount)}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.netAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.vatAmount)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {tx.vatRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(tx.grossAmount)}</TableCell>
                  <TableCell className="capitalize text-sm">{tx.paymentMethod}</TableCell>
                  <TableCell className="text-sm">{tx.staffName || "—"}</TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                    Brak transakcji w wybranym zakresie dat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

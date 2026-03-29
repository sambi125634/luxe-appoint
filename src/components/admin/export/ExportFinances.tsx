import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toCSV, downloadCSV, downloadJSON, formatDate, TRANSACTION_COLUMNS, mapTransactionsForExport } from "./exportHelpers";

interface ExportFinancesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
}

const REVENUE_COLUMNS = [
  { key: "data", label: "Data" },
  { key: "przychod_brutto", label: "Przychód brutto (zł)" },
  { key: "liczba_wizyt", label: "Liczba wizyt" },
  { key: "srednia_wizyta", label: "Średnia wizyta (zł)" },
];

export function ExportFinances({ open, onOpenChange, salonId, salonName }: ExportFinancesProps) {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("revenue");

  const handleExportRevenue = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("start_time, price, status")
        .eq("salon_id", salonId)
        .eq("status", "completed")
        .gte("start_time", `${dateFrom}T00:00:00`)
        .lte("start_time", `${dateTo}T23:59:59`)
        .order("start_time");

      if (error) throw error;

      // Group by day
      const byDay = new Map<string, { total: number; count: number }>();
      (data || []).forEach(apt => {
        const day = formatDate(apt.start_time);
        const existing = byDay.get(day) || { total: 0, count: 0 };
        existing.total += apt.price || 0;
        existing.count += 1;
        byDay.set(day, existing);
      });

      const rows = Array.from(byDay.entries()).map(([day, val]) => ({
        data: day,
        przychod_brutto: val.total.toFixed(2).replace(".", ","),
        liczba_wizyt: val.count,
        srednia_wizyta: val.count > 0 ? (val.total / val.count).toFixed(2).replace(".", ",") : "0,00",
      }));

      downloadCSV(toCSV(rows, REVENUE_COLUMNS), `przychody_${salonName}`);
      toast.success(`✓ Wyeksportowano przychody za ${rows.length} dni`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas eksportu przychodów");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTransactions = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("salon_id", salonId)
        .gte("transaction_date", `${dateFrom}T00:00:00`)
        .lte("transaction_date", `${dateTo}T23:59:59`)
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      const rows = mapTransactionsForExport(data || []);
      downloadCSV(toCSV(rows, TRANSACTION_COLUMNS), `transakcje_${salonName}`);
      toast.success(`✓ Wyeksportowano ${rows.length} transakcji`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas eksportu transakcji");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Eksport danych finansowych</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs">Od</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Do</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="revenue" className="flex-1">Przychody</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transakcje</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Eksport dziennych przychodów z zakończonych wizyt w wybranym okresie.
              </p>
              <Button onClick={handleExportRevenue} disabled={isExporting} className="w-full gap-2">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Pobierz raport przychodów
              </Button>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Pełna lista transakcji: usługi, sprzedaż produktów, płatności.
              </p>
              <Button onClick={handleExportTransactions} disabled={isExporting} className="w-full gap-2">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Pobierz transakcje
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

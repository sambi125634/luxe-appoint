import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toCSV, downloadCSV, downloadJSON, formatDate } from "./exportHelpers";

const ALL_COLUMNS = [
  { key: "imie", label: "Imię", group: "basic" },
  { key: "nazwisko", label: "Nazwisko", group: "basic" },
  { key: "telefon", label: "Telefon", group: "basic" },
  { key: "email", label: "Email", group: "contact" },
  { key: "data_pierwszej_wizyty", label: "Pierwsza wizyta", group: "history" },
  { key: "data_ostatniej_wizyty", label: "Ostatnia wizyta", group: "history" },
  { key: "liczba_wizyt", label: "Liczba wizyt", group: "history" },
  { key: "laczna_wartosc_zl", label: "Łączna wartość (zł)", group: "history" },
  { key: "srednia_wizyta_zl", label: "Średnia wizyta (zł)", group: "history" },
  { key: "tagi", label: "Tagi CRM", group: "segment" },
  { key: "vip", label: "Status VIP", group: "segment" },
  { key: "problematyczna", label: "Problematyczna", group: "segment" },
  { key: "zgoda_rodo", label: "Zgoda RODO", group: "marketing" },
  { key: "zgoda_marketing", label: "Zgoda marketing", group: "marketing" },
  { key: "zrodlo", label: "Źródło pozyskania", group: "marketing" },
  { key: "notatki", label: "Notatki wewnętrzne ⚠️", group: "notes" },
];

interface ExportClientsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
}

export function ExportClients({ open, onOpenChange, salonId, salonName }: ExportClientsProps) {
  const [exportFilter, setExportFilter] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ALL_COLUMNS.filter(c => c.group !== "notes").map(c => c.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let query = supabase
        .from("clients")
        .select("*, appointments(id, start_time, price, status)")
        .eq("salon_id", salonId)
        .order("last_name");

      if (exportFilter === "active") {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        query = query.gte("last_visit_at", cutoff.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data || []).map(client => {
        const apts = client.appointments || [];
        const completed = apts.filter((a: any) => a.status === "completed");
        const totalSpent = completed.reduce((s: number, a: any) => s + (a.price || 0), 0);
        const sorted = [...apts].sort((a: any, b: any) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        return {
          imie: client.first_name,
          nazwisko: client.last_name,
          telefon: client.phone,
          email: client.email || "",
          data_pierwszej_wizyty: formatDate(sorted[0]?.start_time || null),
          data_ostatniej_wizyty: formatDate(client.last_visit_at),
          liczba_wizyt: completed.length,
          laczna_wartosc_zl: totalSpent.toFixed(2).replace(".", ","),
          srednia_wizyta_zl: completed.length > 0 ? (totalSpent / completed.length).toFixed(2).replace(".", ",") : "0,00",
          tagi: (client.tags || []).join("; "),
          vip: client.is_vip ? "TAK" : "NIE",
          problematyczna: client.is_problematic ? "TAK" : "NIE",
          zgoda_rodo: client.rodo_consent ? "TAK" : "NIE",
          zgoda_marketing: client.marketing_consent ? "TAK" : "NIE",
          zrodlo: client.source || "",
          notatki: selectedColumns.includes("notatki") ? (client.notes || "") : undefined,
        };
      });

      const columns = ALL_COLUMNS.filter(c => selectedColumns.includes(c.key));

      if (exportFormat === "csv") {
        downloadCSV(toCSV(rows, columns), `klientki_${salonName}`);
      } else {
        downloadJSON(rows, `klientki_${salonName}`);
      }

      toast.success(`✓ Wyeksportowano ${rows.length} klientek`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas eksportu klientek");
    } finally {
      setIsExporting(false);
    }
  };

  const groups = [
    { id: "basic", label: "Podstawowe" },
    { id: "contact", label: "Kontaktowe" },
    { id: "history", label: "Historia" },
    { id: "segment", label: "Segmentacja" },
    { id: "marketing", label: "Marketing" },
    { id: "notes", label: "Notatki" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Eksport bazy klientek</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-2">Które klientki eksportować?</p>
            <RadioGroup value={exportFilter} onValueChange={setExportFilter}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Wszystkie klientki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Tylko aktywne (wizyta w ostatnich 12 mies.)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Kolumny do eksportu:</p>
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{group.label}</p>
                  <div className="space-y-1">
                    {ALL_COLUMNS.filter(c => c.group === group.id).map(col => (
                      <div key={col.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={col.key}
                          checked={selectedColumns.includes(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                          disabled={col.group === "basic"}
                        />
                        <Label htmlFor={col.key} className="text-sm">{col.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Format:</p>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV — Excel, Google Sheets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON — dla developerów</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Eksportowanie..." : "Pobierz eksport klientek"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

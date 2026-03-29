import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toCSV, downloadCSV, downloadJSON, APPOINTMENT_COLUMNS, mapAppointmentsForExport } from "./exportHelpers";

interface ExportAppointmentsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
}

const STATUS_OPTIONS = [
  { value: "completed", label: "Zakończone" },
  { value: "booked", label: "Zarezerwowane" },
  { value: "cancelled", label: "Anulowane" },
  { value: "no_show", label: "No-show" },
];

export function ExportAppointments({ open, onOpenChange, salonId, salonName }: ExportAppointmentsProps) {
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
  const [dateTo, setDateTo] = useState(now.toISOString().split("T")[0]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["completed", "booked", "cancelled", "no_show"]);
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const setPreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "month":
        setDateFrom(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "3months":
        setDateFrom(new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "year":
        setDateFrom(new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0]);
        setDateTo(today.toISOString().split("T")[0]);
        break;
      case "all":
        setDateFrom("2020-01-01");
        setDateTo(today.toISOString().split("T")[0]);
        break;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients(first_name, last_name, phone), services(name, duration), staff_members(name)")
        .eq("salon_id", salonId)
        .gte("start_time", `${dateFrom}T00:00:00`)
        .lte("start_time", `${dateTo}T23:59:59`)
        .in("status", selectedStatuses)
        .order("start_time", { ascending: false });

      if (error) throw error;

      const rows = mapAppointmentsForExport(data || []);

      if (exportFormat === "csv") {
        downloadCSV(toCSV(rows, APPOINTMENT_COLUMNS), `wizyty_${salonName}`);
      } else {
        downloadJSON(rows, `wizyty_${salonName}`);
      }

      toast.success(`✓ Wyeksportowano ${rows.length} wizyt`);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas eksportu wizyt");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Eksport historii wizyt</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium mb-2">Zakres dat:</p>
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
            <div className="flex flex-wrap gap-1 mt-2">
              {[
                { key: "month", label: "Ten miesiąc" },
                { key: "3months", label: "Ostatnie 3 mies." },
                { key: "year", label: "Ten rok" },
                { key: "all", label: "Wszystkie" },
              ].map(p => (
                <Badge key={p.key} variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setPreset(p.key)}>
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Status wizyt:</p>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map(s => (
                <div key={s.value} className="flex items-center space-x-2">
                  <Checkbox id={s.value} checked={selectedStatuses.includes(s.value)} onCheckedChange={() => toggleStatus(s.value)} />
                  <Label htmlFor={s.value} className="text-sm">{s.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Eksportowanie..." : "Pobierz eksport wizyt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

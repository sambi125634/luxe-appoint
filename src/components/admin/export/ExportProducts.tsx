import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toCSV, downloadCSV, PRODUCT_COLUMNS, mapProductsForExport, formatDate } from "./exportHelpers";

interface ExportProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId: string;
  salonName: string;
}

const MOVEMENT_COLUMNS = [
  { key: "data", label: "Data" },
  { key: "produkt", label: "Produkt" },
  { key: "typ_ruchu", label: "Typ ruchu" },
  { key: "ilosc", label: "Ilość" },
  { key: "cena_jednostkowa", label: "Cena jedn. (zł)" },
  { key: "notatki", label: "Notatki" },
];

export function ExportProducts({ open, onOpenChange, salonId, salonName }: ExportProductsProps) {
  const [exportType, setExportType] = useState("catalog");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportType === "catalog") {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("salon_id", salonId)
          .order("name");

        if (error) throw error;
        const rows = mapProductsForExport(data || []);
        downloadCSV(toCSV(rows, PRODUCT_COLUMNS), `produkty_${salonName}`);
        toast.success(`✓ Wyeksportowano ${rows.length} produktów`);
      } else {
        const { data, error } = await supabase
          .from("stock_movements")
          .select("*, products(name)")
          .eq("salon_id", salonId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const rows = (data || []).map((m: any) => ({
          data: formatDate(m.created_at),
          produkt: m.products?.name || "",
          typ_ruchu: m.type || "",
          ilosc: m.quantity,
          cena_jednostkowa: m.unit_price?.toFixed(2).replace(".", ",") || "",
          notatki: m.note || "",
        }));

        downloadCSV(toCSV(rows, MOVEMENT_COLUMNS), `ruchy_magazynowe_${salonName}`);
        toast.success(`✓ Wyeksportowano ${rows.length} ruchów magazynowych`);
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Błąd podczas eksportu produktów");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eksport katalogu produktów</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <RadioGroup value={exportType} onValueChange={setExportType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="catalog" id="catalog" />
              <Label htmlFor="catalog">Katalog produktów (stan na dziś)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="movements" id="movements" />
              <Label htmlFor="movements">Historia ruchów magazynowych</Label>
            </div>
          </RadioGroup>

          <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Eksportowanie..." : "Pobierz eksport"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

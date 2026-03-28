import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface InvoiceItem {
  name: string;
  brand: string | null;
  quantity: number;
  unit_price_net: number;
  vat_rate: number;
  unit_price_gross: number;
  ean: string | null;
  matched_product_id: string | null;
  include: boolean;
  create_new: boolean;
}

interface InvoiceResult {
  items: InvoiceItem[];
  invoice_number: string | null;
  invoice_date: string | null;
  supplier_name: string | null;
  total_net: number;
  total_gross: number;
}

const SCAN_MESSAGES = [
  "Odczytuję pozycje z faktury...",
  "Rozpoznaję nazwy produktów...",
  "Dopasowuję do Twojego katalogu...",
  "Sprawdzam ceny zakupu...",
  "Przygotowuję podgląd zmian...",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salonId?: string;
}

export function InvoiceAIScanner({ open, onOpenChange, salonId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [updatePrices, setUpdatePrices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { products } = useProducts(salonId);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedFile(null);
      setResult(null);
      setScanMessageIndex(0);
      setProgress(0);
    }
  }, [open]);

  // Rotate scan messages
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setScanMessageIndex((i) => (i + 1) % SCAN_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  // Progress bar animation
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 300);
    return () => clearInterval(interval);
  }, [step]);

  const handleFileSelect = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Nieobsługiwany format pliku. Użyj PDF, JPG lub PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Plik jest za duży. Maksymalny rozmiar to 10 MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile || !salonId) return;
    setStep(2);
    setProgress(0);
    setScanMessageIndex(0);

    try {
      const existingProducts = (products || []).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        ean: p.ean,
      }));

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("salon_id", salonId);
      formData.append("existing_products", JSON.stringify(existingProducts));

      const { data, error } = await supabase.functions.invoke("parse-invoice-ai", {
        body: formData,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const items: InvoiceItem[] = (data.items || []).map((item: Record<string, unknown>) => ({
        ...item,
        include: true,
        create_new: !item.matched_product_id,
      }));

      setResult({ ...data, items });
      setProgress(100);
      setStep(3);
    } catch (err) {
      console.error("Invoice scan error:", err);
      toast.error("Nie udało się przeanalizować faktury. Spróbuj ponownie.");
      setStep(1);
    }
  };

  const handleConfirm = async () => {
    if (!result || !salonId) return;
    setSaving(true);
    let updated = 0;
    let created = 0;

    try {
      for (const item of result.items) {
        if (!item.include) continue;

        if (item.matched_product_id && !item.create_new) {
          // Update existing product stock
          const product = products?.find((p) => p.id === item.matched_product_id);
          if (product) {
            const updateData: Record<string, unknown> = {
              current_stock: product.current_stock + item.quantity,
              updated_at: new Date().toISOString(),
            };
            if (updatePrices && item.unit_price_net > 0) {
              updateData.purchase_price_net = item.unit_price_net;
            }
            await supabase
              .from("products")
              .update(updateData)
              .eq("id", item.matched_product_id);

            // Stock movement
            await supabase.from("stock_movements").insert({
              product_id: item.matched_product_id,
              salon_id: salonId,
              type: "delivery",
              quantity: item.quantity,
              unit_price: item.unit_price_net,
              total_value: item.unit_price_net * item.quantity,
              invoice_number: result.invoice_number,
              note: `Faktura od ${result.supplier_name || "dostawcy"}`,
            });
            updated++;
          }
        } else if (item.create_new) {
          // Create new product
          const { data: newProduct } = await supabase
            .from("products")
            .insert({
              salon_id: salonId,
              name: item.name,
              brand: item.brand,
              purchase_price_net: item.unit_price_net,
              vat_rate: item.vat_rate || 23,
              current_stock: item.quantity,
              ean: item.ean,
              sale_price_gross: item.unit_price_gross || item.unit_price_net * 1.5,
              category: "Inne",
              min_stock: 1,
            })
            .select("id")
            .single();

          if (newProduct) {
            await supabase.from("stock_movements").insert({
              product_id: newProduct.id,
              salon_id: salonId,
              type: "delivery",
              quantity: item.quantity,
              unit_price: item.unit_price_net,
              total_value: item.unit_price_net * item.quantity,
              invoice_number: result.invoice_number,
              note: `Faktura od ${result.supplier_name || "dostawcy"}`,
            });
            created++;
          }
        }
      }

      setUpdatedCount(updated);
      setCreatedCount(created);
      setStep(4);

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["stock-alerts"] });

      toast.success(`Zaktualizowano ${updated} produktów, dodano ${created} nowych`);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Wystąpił błąd podczas zapisywania zmian.");
    } finally {
      setSaving(false);
    }
  };

  const matchedCount = result?.items.filter((i) => i.matched_product_id && !i.create_new).length || 0;
  const newCount = result?.items.filter((i) => i.create_new).length || 0;
  const activeItems = result?.items.filter((i) => i.include) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>🧾</span> Wgraj fakturę zakupową
              </DialogTitle>
              <DialogDescription>
                AI odczyta produkty i zaproponuje aktualizację stanów magazynowych
              </DialogDescription>
            </DialogHeader>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              <Upload className="w-10 h-10 mx-auto text-primary/60 mb-3" />
              <p className="font-medium text-foreground">
                {selectedFile ? selectedFile.name : "Przeciągnij fakturę lub kliknij"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, JPG, PNG — faktury online, paragon, potwierdzenie zamówienia
              </p>
              {selectedFile && (
                <Badge variant="secondary" className="mt-2">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </Badge>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-muted/50 text-sm">
              <span>💡</span>
              <span className="text-muted-foreground">
                Działa z fakturami z Hurtowni Kosmetycznej, Notino, Douglas, Rossmann, Sephora, Allegro
                i większości sklepów internetowych.
              </span>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAnalyze} disabled={!selectedFile} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Analizuj fakturę AI
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-foreground">AI analizuje fakturę...</p>
            <p className="text-sm text-muted-foreground animate-pulse">{SCAN_MESSAGES[scanMessageIndex]}</p>
            <Progress value={progress} className="w-64" />
          </div>
        )}

        {step === 3 && result && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                AI odczytało fakturę
              </DialogTitle>
              <DialogDescription>
                {result.invoice_number && `Faktura: ${result.invoice_number}`}
                {result.invoice_date && ` · ${result.invoice_date}`}
                {result.supplier_name && ` · ${result.supplier_name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 text-sm">
              <Badge variant="outline">Pozycji: {result.items.length}</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                Dopasowano: {matchedCount}
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                Nowe: {newCount}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Produkt z faktury</TableHead>
                    <TableHead>Dopasowanie</TableHead>
                    <TableHead className="text-right">Ilość</TableHead>
                    <TableHead className="text-right">Cena netto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.items.map((item, idx) => {
                    const matched = item.matched_product_id && !item.create_new;
                    const matchedProduct = matched
                      ? products?.find((p) => p.id === item.matched_product_id)
                      : null;

                    return (
                      <TableRow
                        key={idx}
                        className={
                          matched
                            ? "bg-green-50/50 dark:bg-green-950/20"
                            : "bg-amber-50/50 dark:bg-amber-950/20"
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={item.include}
                            onCheckedChange={(checked) => {
                              const newItems = [...result.items];
                              newItems[idx] = { ...newItems[idx], include: !!checked };
                              setResult({ ...result, items: newItems });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{item.name}</div>
                          {item.brand && (
                            <span className="text-xs text-muted-foreground">{item.brand}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {matched && matchedProduct ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs text-green-700">{matchedProduct.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs text-amber-700">Nowy produkt</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...result.items];
                              newItems[idx] = { ...newItems[idx], quantity: Number(e.target.value) || 0 };
                              setResult({ ...result, items: newItems });
                            }}
                            className="w-16 text-right h-8"
                            min={0}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.unit_price_net}
                            onChange={(e) => {
                              const newItems = [...result.items];
                              newItems[idx] = { ...newItems[idx], unit_price_net: Number(e.target.value) || 0 };
                              setResult({ ...result, items: newItems });
                            }}
                            className="w-24 text-right h-8"
                            min={0}
                            step={0.01}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 text-sm border rounded-lg p-4 bg-muted/30">
              <p className="font-medium">Po zatwierdzeniu:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Zaktualizujesz stan {activeItems.filter((i) => i.matched_product_id && !i.create_new).length} istniejących produktów</li>
                <li>• Dodasz {activeItems.filter((i) => i.create_new).length} nowych produktów do katalogu</li>
                <li>• Zapiszesz fakturę w historii zakupów</li>
              </ul>

              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <Checkbox checked={updatePrices} onCheckedChange={(c) => setUpdatePrices(!!c)} />
                <span>Zaktualizuj ceny zakupu na podstawie faktury</span>
              </label>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => { setStep(1); setResult(null); }} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Wgraj inną fakturę
              </Button>
              <Button onClick={handleConfirm} disabled={saving || activeItems.length === 0} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Zatwierdź i zaktualizuj
              </Button>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="text-xl font-semibold text-foreground">Stany magazynowe zaktualizowane!</p>
            <p className="text-muted-foreground text-sm">
              Zaktualizowano {updatedCount} produktów · Dodano {createdCount} nowych
            </p>
            <Button onClick={() => onOpenChange(false)}>Zamknij</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

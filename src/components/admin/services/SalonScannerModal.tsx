import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Wand2, Download, Gift, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Mode = "import" | "enrich" | "extras";

interface ScannedService {
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface ScanResultData {
  services: ScannedService[];
  opening_hours?: Record<string, string>;
  description?: string;
  address?: string;
  phone?: string;
  avg_rating?: number;
  existing_reviews_count?: number;
}

interface ExistingService {
  id: string;
  name: string;
  description?: string | null;
}

interface SalonRow {
  id: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isDemo: boolean;
  salonId: string | null;
  salon: SalonRow | null;
  existingServices: ExistingService[];
  existingCategories: { id: string; name: string }[];
  /** Fired after we successfully insert services / update salon — caller refetches queries. */
  onDataChanged: () => void;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function SalonScannerModal({
  open, onOpenChange, isDemo, salonId, salon,
  existingServices, existingCategories, onDataChanged,
}: Props) {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("import");
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Import tab state
  const [selectedScanned, setSelectedScanned] = useState<Set<number>>(new Set());
  const [updateDuplicates, setUpdateDuplicates] = useState(false);
  const [importing, setImporting] = useState(false);

  // Enrich tab state
  const [onlyEmptyDescriptions, setOnlyEmptyDescriptions] = useState(true);
  const [enriching, setEnriching] = useState(false);

  // Extras tab state
  const [pickDesc, setPickDesc] = useState(true);
  const [pickAddress, setPickAddress] = useState(true);
  const [pickPhone, setPickPhone] = useState(true);
  const [savingExtras, setSavingExtras] = useState(false);

  const existingNames = useMemo(
    () => new Set(existingServices.map(s => norm(s.name))),
    [existingServices]
  );

  const reset = () => {
    setUrl("");
    setScanResult(null);
    setScanError(null);
    setSelectedScanned(new Set());
  };

  const handleClose = (v: boolean) => {
    if (scanning || importing || enriching || savingExtras) return;
    if (!v) reset();
    onOpenChange(v);
  };

  const guardDemo = () => {
    if (isDemo) {
      toast({
        title: "Tryb Demo",
        description: "Skaner salonu dostępny po rejestracji konta.",
      });
      return true;
    }
    return false;
  };

  const runScan = async () => {
    if (guardDemo()) return;
    if (!url.trim()) {
      toast({ title: "Brak linku", description: "Wklej link do swojego profilu (Booksy, własna strona, Google Maps).", variant: "destructive" });
      return;
    }
    setScanning(true);
    setScanError(null);
    setScanResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-profile-scanner", {
        body: { urls: [url.trim()], salon_type: "multi" },
      });
      if (error) throw error;
      if (!data?.success) {
        const errType = data?.error;
        const msg =
          errType === "inactive_salon"
            ? data?.message || "Ten profil nie jest już aktywny. Sprawdź link."
            : errType === "no_services_found"
            ? data?.message || "Nie znaleziono usług na tej stronie."
            : data?.error || "Nie udało się pobrać danych ze strony.";
        setScanError(msg);
        return;
      }
      const res = data.data as ScanResultData;
      setScanResult(res);
      // Pre-select all non-duplicates
      const preselect = new Set<number>();
      res.services?.forEach((s, i) => {
        if (!existingNames.has(norm(s.name))) preselect.add(i);
      });
      setSelectedScanned(preselect);
    } catch (e) {
      console.error(e);
      setScanError("Błąd połączenia ze skanerem. Spróbuj ponownie za chwilę.");
    } finally {
      setScanning(false);
    }
  };

  // ---------- IMPORT ----------
  const handleImport = async () => {
    if (guardDemo() || !salonId || !scanResult) return;
    const picked = (scanResult.services || []).filter((_, i) => selectedScanned.has(i));
    if (picked.length === 0) {
      toast({ title: "Nic nie zaznaczono", description: "Wybierz przynajmniej jedną usługę do importu.", variant: "destructive" });
      return;
    }
    setImporting(true);
    try {
      // Build category map (existing + create missing)
      const catByName = new Map(existingCategories.map(c => [norm(c.name), c.id]));
      const neededCats = Array.from(new Set(
        picked.map(s => s.category?.trim()).filter(Boolean).filter(c => !catByName.has(norm(c!)))
      )) as string[];

      if (neededCats.length > 0) {
        const catRows = neededCats.map((name, i) => ({
          salon_id: salonId,
          name,
          icon: "✨",
          sort_order: existingCategories.length + i,
        }));
        const { data: createdCats, error: catErr } = await (supabase
          .from("service_categories") as any)
          .insert(catRows)
          .select("id, name");
        if (catErr) throw catErr;
        (createdCats as { id: string; name: string }[] | null)?.forEach(c => catByName.set(norm(c.name), c.id));
      }

      const toInsert: Array<{ salon_id: string; name: string; price: number; duration: number; category_id: string | null }> = [];
      const toUpdate: Array<{ id: string; price: number; duration: number }> = [];
      const existingByName = new Map(existingServices.map(s => [norm(s.name), s]));

      for (const s of picked) {
        const existing = existingByName.get(norm(s.name));
        const catId = s.category ? catByName.get(norm(s.category)) ?? null : null;
        if (existing && updateDuplicates) {
          toUpdate.push({ id: existing.id, price: s.price, duration: s.duration });
        } else if (!existing) {
          toInsert.push({
            salon_id: salonId,
            name: s.name,
            price: s.price,
            duration: s.duration,
            category_id: catId,
          });
        }
      }

      let insertedIds: string[] = [];
      if (toInsert.length > 0) {
        const { data: ins, error: insErr } = await (supabase.from("services") as any).insert(toInsert).select("id");
        if (insErr) throw insErr;
        insertedIds = ((ins as { id: string }[] | null) ?? []).map(r => r.id);
      }
      for (const u of toUpdate) {
        await supabase.from("services").update({ price: u.price, duration: u.duration }).eq("id", u.id);
      }

      // Auto-assign new services to owner
      if (insertedIds.length > 0) {
        const { data: ownerStaff } = await supabase
          .from("staff_members")
          .select("id")
          .eq("salon_id", salonId)
          .eq("is_owner", true)
          .maybeSingle();
        if (ownerStaff) {
          await supabase.from("staff_services").insert(
            insertedIds.map(sid => ({ staff_id: ownerStaff.id, service_id: sid }))
          );
        }
      }

      toast({
        title: "Zaimportowano usługi",
        description: `Dodano ${toInsert.length}${toUpdate.length > 0 ? `, zaktualizowano ${toUpdate.length}` : ""}.`,
      });
      onDataChanged();
      handleClose(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Błąd", description: "Nie udało się zaimportować usług.", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  // ---------- ENRICH ----------
  const handleEnrich = async () => {
    if (guardDemo()) return;
    if (!url.trim()) {
      toast({ title: "Brak linku", description: "Wklej link do profilu salonu.", variant: "destructive" });
      return;
    }
    const candidates = existingServices.filter(s =>
      onlyEmptyDescriptions ? !s.description || s.description.trim().length < 20 : true
    );
    if (candidates.length === 0) {
      toast({ title: "Brak usług do wzbogacenia", description: "Wszystkie usługi mają już opisy." });
      return;
    }
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich-service-descriptions", {
        body: {
          url: url.trim(),
          services: candidates.map(s => ({ id: s.id, name: s.name })),
        },
      });
      if (error) throw error;
      if (!data?.success) {
        toast({ title: "Błąd", description: data?.error || "Nie udało się wzbogacić opisów.", variant: "destructive" });
        return;
      }
      const matches: { id: string; description: string; benefits?: string[] }[] = data.matches || [];
      let updated = 0;
      for (const m of matches) {
        const current = existingServices.find(s => s.id === m.id);
        if (!current) continue;
        if (onlyEmptyDescriptions && current.description && current.description.trim().length >= 20) continue;
        const payload: Record<string, unknown> = { description: m.description };
        if (m.benefits && m.benefits.length > 0) payload.benefits = m.benefits;
        const { error: upErr } = await supabase.from("services").update(payload).eq("id", m.id);
        if (!upErr) updated++;
      }
      toast({
        title: "Wzbogacono opisy",
        description: `Zaktualizowano ${updated} z ${candidates.length} usług.`,
      });
      onDataChanged();
      handleClose(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Błąd", description: "Nie udało się połączyć z AI.", variant: "destructive" });
    } finally {
      setEnriching(false);
    }
  };

  // ---------- EXTRAS ----------
  const handleSaveExtras = async () => {
    if (guardDemo() || !salonId || !scanResult) return;
    setSavingExtras(true);
    try {
      const payload: Record<string, unknown> = {};
      if (pickDesc && scanResult.description) payload.description = scanResult.description;
      if (pickAddress && scanResult.address) payload.address = scanResult.address;
      if (pickPhone && scanResult.phone) payload.phone = scanResult.phone;

      if (Object.keys(payload).length === 0) {
        toast({ title: "Nic nie zaznaczono", description: "Wybierz co najmniej jedno pole do zapisu." });
        setSavingExtras(false);
        return;
      }

      const { error } = await supabase.from("salons").update(payload).eq("id", salonId);
      if (error) throw error;
      toast({ title: "Zapisano", description: `Zaktualizowano ${Object.keys(payload).length} pól w profilu salonu.` });
      onDataChanged();
    } catch (e) {
      console.error(e);
      toast({ title: "Błąd", description: "Nie udało się zapisać.", variant: "destructive" });
    } finally {
      setSavingExtras(false);
    }
  };

  const busy = scanning || importing || enriching || savingExtras;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Skaner salonu
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Wklej link do swojego profilu (Booksy, Fresha, Versum, własna strona, Google Maps) — AI wyciągnie usługi, opisy i dane kontaktowe w ~30 sekund.
          </p>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="import" className="gap-2"><Download className="w-3.5 h-3.5" />Zaimportuj usługi</TabsTrigger>
            <TabsTrigger value="enrich" className="gap-2"><Wand2 className="w-3.5 h-3.5" />Wzbogać opisy</TabsTrigger>
            <TabsTrigger value="extras" className="gap-2"><Gift className="w-3.5 h-3.5" />Dodatkowe dane</TabsTrigger>
          </TabsList>

          {/* URL input + scan button (shared by import + extras) */}
          {(mode === "import" || mode === "extras") && (
            <div className="space-y-3 mt-4">
              <div>
                <Label>Link do profilu</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://booksy.com/pl-pl/..."
                    disabled={busy}
                  />
                  <Button onClick={runScan} disabled={busy || !url.trim()} variant="luxury" className="gap-2 shrink-0">
                    {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {scanning ? "Skanuję…" : "Skanuj"}
                  </Button>
                </div>
              </div>
              {scanError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>
          )}

          {/* ===== IMPORT TAB ===== */}
          <TabsContent value="import" className="space-y-4 mt-4">
            {!scanResult && !scanning && (
              <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/40 border border-border">
                Wklej link wyżej i kliknij <strong>Skanuj</strong> — AI rozpozna każdą usługę z nazwą, ceną i czasem trwania. Zobaczysz listę przed dodaniem.
              </div>
            )}
            {scanResult && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Znaleziono <strong>{scanResult.services?.length || 0}</strong> usług. Zaznaczono <strong>{selectedScanned.size}</strong>.
                  </p>
                  <div className="flex items-center gap-2">
                    <Switch checked={updateDuplicates} onCheckedChange={setUpdateDuplicates} />
                    <Label className="text-xs">Nadpisz cenę/czas istniejących</Label>
                  </div>
                </div>
                <ScrollArea className="h-72 border rounded-lg p-2">
                  <div className="space-y-1">
                    {(scanResult.services || []).map((s, i) => {
                      const isDup = existingNames.has(norm(s.name));
                      const checked = selectedScanned.has(i);
                      return (
                        <label
                          key={i}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50",
                            checked && "bg-primary/5"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const next = new Set(selectedScanned);
                              if (v) next.add(i); else next.delete(i);
                              setSelectedScanned(next);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{s.name}</span>
                              {isDup && <Badge variant="secondary" className="text-[10px]">już istnieje</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {s.category} · {s.duration} min · {s.price} zł
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          {/* ===== ENRICH TAB ===== */}
          <TabsContent value="enrich" className="space-y-4 mt-4">
            <div>
              <Label>Link do profilu salonu</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://booksy.com/pl-pl/..."
                disabled={busy}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border">
              <div className="text-sm">
                <p className="font-medium">Pomiń usługi z opisami</p>
                <p className="text-xs text-muted-foreground">Aktualizuj tylko puste / krótkie opisy</p>
              </div>
              <Switch checked={onlyEmptyDescriptions} onCheckedChange={setOnlyEmptyDescriptions} disabled={busy} />
            </div>
            <div className="text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>AI dosłownie wyciąga opisy ze strony — nie wymyśla treści. Zaktualizuje tylko te usługi, które znajdzie.</span>
            </div>
          </TabsContent>

          {/* ===== EXTRAS TAB ===== */}
          <TabsContent value="extras" className="space-y-3 mt-4">
            {!scanResult && (
              <div className="text-sm text-muted-foreground p-4 rounded-lg bg-muted/40 border border-border">
                Po przeskanowaniu pokażemy dodatkowe dane, które możesz jednym kliknięciem zapisać w profilu salonu (opis, adres, telefon).
              </div>
            )}
            {scanResult && (
              <div className="space-y-2">
                <ExtraRow
                  picked={pickDesc}
                  onPick={setPickDesc}
                  label="Opis salonu"
                  current={salon?.description ?? ""}
                  scanned={scanResult.description ?? ""}
                />
                <ExtraRow
                  picked={pickAddress}
                  onPick={setPickAddress}
                  label="Adres"
                  current={salon?.address ?? ""}
                  scanned={scanResult.address ?? ""}
                />
                <ExtraRow
                  picked={pickPhone}
                  onPick={setPickPhone}
                  label="Telefon"
                  current={salon?.phone ?? ""}
                  scanned={scanResult.phone ?? ""}
                />
                {(scanResult.avg_rating || scanResult.existing_reviews_count) && (
                  <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border">
                    Wykryta ocena z profilu: <strong>{scanResult.avg_rating?.toFixed(1) ?? "—"}/5</strong>
                    {scanResult.existing_reviews_count ? ` (${scanResult.existing_reviews_count} opinii)` : ""}
                    <span className="block mt-1 opacity-70">Social proof pojawi się wkrótce w widżecie rezerwacji.</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={busy}>
            Anuluj
          </Button>
          {mode === "import" && (
            <Button variant="luxury" onClick={handleImport} disabled={busy || !scanResult || selectedScanned.size === 0} className="gap-2">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Zaimportuj {selectedScanned.size > 0 ? `(${selectedScanned.size})` : ""}
            </Button>
          )}
          {mode === "enrich" && (
            <Button variant="luxury" onClick={handleEnrich} disabled={busy || !url.trim()} className="gap-2">
              {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {enriching ? "Skanuję…" : "Wzbogać opisy"}
            </Button>
          )}
          {mode === "extras" && (
            <Button variant="luxury" onClick={handleSaveExtras} disabled={busy || !scanResult} className="gap-2">
              {savingExtras ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Zapisz w profilu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExtraRow({
  picked, onPick, label, current, scanned,
}: { picked: boolean; onPick: (v: boolean) => void; label: string; current: string; scanned: string }) {
  if (!scanned) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border opacity-60">
        <Checkbox checked={false} disabled />
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">AI nie znalazło tej informacji na stronie.</p>
        </div>
      </div>
    );
  }
  const hasCurrent = current && current.trim().length > 0;
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border cursor-pointer hover:bg-muted/30">
      <Checkbox checked={picked} onCheckedChange={(v) => onPick(!!v)} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {hasCurrent && <Badge variant="secondary" className="text-[10px]">nadpisze obecne</Badge>}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{scanned}</p>
        {hasCurrent && (
          <p className="text-[11px] text-muted-foreground/70 line-clamp-1 mt-1">
            Obecnie: <span className="italic">{current}</span>
          </p>
        )}
      </div>
    </label>
  );
}
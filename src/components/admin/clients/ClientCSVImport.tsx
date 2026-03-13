import { useState, useCallback, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateClient } from "@/hooks/useClients";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParsedClient {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  notes: string;
  tags: string[];
  rodo_consent: boolean;
  marketing_consent: boolean;
  isValid: boolean;
  errors: string[];
}

const HEADER_MAP: Record<string, string> = {
  imie: "first_name", imię: "first_name", first_name: "first_name", "imię klienta": "first_name",
  nazwisko: "last_name", last_name: "last_name", "nazwisko klienta": "last_name",
  telefon: "phone", phone: "phone", tel: "phone", "nr telefonu": "phone", "numer telefonu": "phone",
  email: "email", "e-mail": "email", mail: "email",
  notatki: "notes", notes: "notes", uwagi: "notes", komentarz: "notes",
  tagi: "tags", tags: "tags", etykiety: "tags",
  zgoda_rodo: "rodo_consent", rodo: "rodo_consent", rodo_consent: "rodo_consent",
  zgoda_marketing: "marketing_consent", marketing: "marketing_consent", marketing_consent: "marketing_consent",
};

const TEMPLATE_CSV = `imie,nazwisko,telefon,email,notatki,tagi,zgoda_rodo,zgoda_marketing
Anna,Kowalska,+48123456789,anna@email.pl,Preferuje piątki,VIP;Stały,tak,tak
Katarzyna,Nowak,+48987654321,k.nowak@gmail.com,,Nowy,tak,nie
Magdalena,Wiśniewska,+48555123456,magda@wp.pl,Wrażliwa skóra,Stały;Wrażliwa skóra,tak,tak
Ewa,Dąbrowska,+48111222333,ewa.d@email.pl,,,tak,nie
Zofia,Lewandowska,+48444555666,zofia@gmail.com,Klientka VIP,VIP;Ambasador,tak,tak`;

function parseBool(val: string): boolean {
  const v = val.trim().toLowerCase();
  return ["tak", "yes", "true", "1", "t"].includes(v);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): ParsedClient[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);
  const mappedHeaders = rawHeaders.map(h => HEADER_MAP[h.trim().toLowerCase()] || null);

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    mappedHeaders.forEach((key, i) => {
      if (key && values[i] !== undefined) row[key] = values[i];
    });

    const errors: string[] = [];
    if (!row.first_name) errors.push("Brak imienia");
    if (!row.last_name) errors.push("Brak nazwiska");
    if (!row.phone) errors.push("Brak telefonu");

    return {
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      phone: row.phone || "",
      email: row.email || "",
      notes: row.notes || "",
      tags: row.tags ? row.tags.split(";").map(t => t.trim()).filter(Boolean) : [],
      rodo_consent: row.rodo_consent ? parseBool(row.rodo_consent) : true,
      marketing_consent: row.marketing_consent ? parseBool(row.marketing_consent) : false,
      isValid: errors.length === 0,
      errors,
    };
  });
}

interface ClientCSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDemo?: boolean;
}

export function ClientCSVImport({ open, onOpenChange, isDemo }: ClientCSVImportProps) {
  const { toast } = useToast();
  const createClient = useCreateClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "preview" | "importing">("upload");
  const [parsedClients, setParsedClients] = useState<ParsedClient[]>([]);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, errors: 0 });

  const reset = useCallback(() => {
    setStep("upload");
    setParsedClients([]);
    setImportProgress({ done: 0, total: 0, errors: 0 });
  }, []);

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const downloadTemplate = () => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "szablon_klienci.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({ title: "Błąd", description: "Wybierz plik CSV", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const clients = parseCSV(text);
      if (clients.length === 0) {
        toast({ title: "Błąd", description: "Plik jest pusty lub ma nieprawidłowy format", variant: "destructive" });
        return;
      }
      setParsedClients(clients);
      setStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const removeRow = (index: number) => {
    setParsedClients(prev => prev.filter((_, i) => i !== index));
  };

  const validClients = parsedClients.filter(c => c.isValid);
  const invalidClients = parsedClients.filter(c => !c.isValid);

  const startImport = async () => {
    if (isDemo) {
      toast({ title: "Demo", description: "W trybie demo import nie jest możliwy" });
      return;
    }

    setStep("importing");
    const toImport = validClients;
    setImportProgress({ done: 0, total: toImport.length, errors: 0 });
    let errors = 0;

    for (let i = 0; i < toImport.length; i++) {
      const c = toImport[i];
      try {
        await createClient.mutateAsync({
          first_name: c.first_name,
          last_name: c.last_name,
          phone: c.phone,
          email: c.email || undefined,
          notes: c.notes || undefined,
          tags: c.tags.length > 0 ? c.tags : undefined,
          rodo_consent: c.rodo_consent,
          marketing_consent: c.marketing_consent,
        });
      } catch {
        errors++;
      }
      setImportProgress({ done: i + 1, total: toImport.length, errors });
    }

    toast({
      title: "Import zakończony",
      description: `Zaimportowano ${toImport.length - errors} z ${toImport.length} klientów${errors > 0 ? ` (${errors} błędów)` : ""}`,
    });

    setTimeout(() => handleClose(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import klientów z CSV
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium">Przeciągnij plik CSV tutaj</p>
              <p className="text-sm text-muted-foreground mt-1">lub kliknij, aby wybrać plik</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Obsługiwane kolumny:</p>
              <div className="flex flex-wrap gap-1.5">
                {["imie", "nazwisko", "telefon", "email", "notatki", "tagi", "zgoda_rodo", "zgoda_marketing"].map(col => (
                  <Badge key={col} variant="secondary" className="text-xs">{col}</Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Tagi rozdzielaj średnikiem (;). Zgody: tak/nie. Wymagane: imię, nazwisko, telefon.
              </p>
            </div>

            <Button variant="outline" onClick={downloadTemplate} className="gap-2 w-full">
              <Download className="w-4 h-4" />
              Pobierz szablon CSV z przykładami
            </Button>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-3 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {validClients.length} poprawnych
              </Badge>
              {invalidClients.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {invalidClients.length} z błędami
                </Badge>
              )}
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imię</TableHead>
                    <TableHead>Nazwisko</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tagi</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedClients.map((client, i) => (
                    <TableRow key={i} className={client.isValid ? "" : "bg-destructive/5"}>
                      <TableCell className="font-medium">{client.first_name || <span className="text-destructive text-xs">brak</span>}</TableCell>
                      <TableCell>{client.last_name || <span className="text-destructive text-xs">brak</span>}</TableCell>
                      <TableCell>{client.phone || <span className="text-destructive text-xs">brak</span>}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{client.email || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {client.tags.map((tag, ti) => (
                            <Badge key={ti} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(i)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${importProgress.total > 0 ? (importProgress.done / importProgress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Importowanie... {importProgress.done} / {importProgress.total}
              {importProgress.errors > 0 && <span className="text-destructive"> ({importProgress.errors} błędów)</span>}
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => handleClose(false)}>Anuluj</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset}>Cofnij</Button>
              <Button onClick={startImport} disabled={validClients.length === 0} className="gap-2">
                <Upload className="w-4 h-4" />
                Importuj {validClients.length} klientów
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

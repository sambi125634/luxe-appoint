import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ImportedService {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  isValid: boolean;
  errors: string[];
}

interface Category {
  id: string;
  name: string;
}

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (services: Omit<ImportedService, "id" | "isValid" | "errors">[]) => void;
  categories: Category[];
}

export function CSVImport({ isOpen, onClose, onImport, categories }: CSVImportProps) {
  const [step, setStep] = useState<"upload" | "preview" | "edit">("upload");
  const [importedServices, setImportedServices] = useState<ImportedService[]>([]);
  const [editingService, setEditingService] = useState<ImportedService | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadExampleCSV = () => {
    const exampleData = [
      ["nazwa", "kategoria", "czas", "cena", "opis"],
      ["Peeling kawitacyjny", "Twarz", "60", "150", "Głębokie oczyszczanie skóry twarzy z użyciem ultradźwięków"],
      ["Mezoterapia igłowa", "Twarz", "45", "350", "Regeneracja i nawilżenie skóry poprzez mikroiniekcje"],
      ["Masaż relaksacyjny", "Ciało", "90", "200", "Pełen relaks dla ciała i umysłu z użyciem aromaterapii"],
      ["Depilacja laserowa - nogi", "Depilacja", "60", "400", "Trwałe usuwanie owłosienia laserem diodowym"],
      ["Manicure hybrydowy", "Paznokcie", "75", "120", "Stylizacja paznokci z użyciem lakieru hybrydowego"],
      ["Mikrodermabrazja", "Twarz", "50", "180", "Złuszczanie naskórka kryształkami korundowymi"],
      ["Lifting RF", "Twarz", "45", "280", "Nieinwazyjne liftingowanie skóry falami radiowymi"],
      ["Drenaż limfatyczny", "Ciało", "60", "160", "Masaż wspomagający odpływ limfy i redukcję obrzęków"],
    ];
    
    const csvContent = exampleData.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "przyklad_uslugi.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateService = (service: Partial<ImportedService>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!service.name?.trim()) errors.push("Brak nazwy");
    if (!service.duration || service.duration <= 0) errors.push("Nieprawidłowy czas");
    if (service.price === undefined || service.price < 0) errors.push("Nieprawidłowa cena");
    return { isValid: errors.length === 0, errors };
  };

  const parseCSV = (content: string) => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    const nameIndex = headers.findIndex(h => h.includes("nazwa") || h.includes("name"));
    const categoryIndex = headers.findIndex(h => h.includes("kategoria") || h.includes("category"));
    const durationIndex = headers.findIndex(h => h.includes("czas") || h.includes("duration") || h.includes("min"));
    const priceIndex = headers.findIndex(h => h.includes("cena") || h.includes("price"));
    const descriptionIndex = headers.findIndex(h => h.includes("opis") || h.includes("description"));

    const services: ImportedService[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      
      const service: Partial<ImportedService> = {
        id: `import-${i}-${Date.now()}`,
        name: nameIndex >= 0 ? values[nameIndex] : "",
        category: categoryIndex >= 0 ? values[categoryIndex] : categories[0]?.id || "",
        duration: durationIndex >= 0 ? parseInt(values[durationIndex]) || 60 : 60,
        price: priceIndex >= 0 ? parseFloat(values[priceIndex]) || 0 : 0,
        description: descriptionIndex >= 0 ? values[descriptionIndex] : "",
      };

      // Try to match category name to ID
      if (service.category && !categories.find(c => c.id === service.category)) {
        const matchedCategory = categories.find(c => 
          c.name.toLowerCase() === service.category?.toLowerCase()
        );
        if (matchedCategory) {
          service.category = matchedCategory.id;
        } else {
          service.category = categories[0]?.id || "";
        }
      }

      const validation = validateService(service);
      services.push({
        ...service,
        isValid: validation.isValid,
        errors: validation.errors,
      } as ImportedService);
    }

    return services;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setImportedServices(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleEditService = (service: ImportedService) => {
    setEditingService(service);
    setStep("edit");
  };

  const saveEditedService = () => {
    if (!editingService) return;
    
    const validation = validateService(editingService);
    const updated = {
      ...editingService,
      isValid: validation.isValid,
      errors: validation.errors,
    };
    
    setImportedServices(prev => 
      prev.map(s => s.id === updated.id ? updated : s)
    );
    setEditingService(null);
    setStep("preview");
  };

  const removeService = (id: string) => {
    setImportedServices(prev => prev.filter(s => s.id !== id));
  };

  const handleImport = () => {
    const validServices = importedServices
      .filter(s => s.isValid)
      .map(({ id, isValid, errors, ...service }) => service);
    
    onImport(validServices);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("upload");
    setImportedServices([]);
    setEditingService(null);
    onClose();
  };

  const validCount = importedServices.filter(s => s.isValid).length;
  const invalidCount = importedServices.filter(s => !s.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            {step === "upload" && "Import usług z CSV"}
            {step === "preview" && "Podgląd importu"}
            {step === "edit" && "Edycja usługi"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Upload step */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Wybierz plik CSV</p>
                <p className="text-sm text-muted-foreground">lub przeciągnij i upuść</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-medium mb-2">Format pliku CSV:</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Pierwsza linia powinna zawierać nagłówki kolumn. Obsługiwane kolumny:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code className="bg-muted px-1 rounded">nazwa</code> lub <code className="bg-muted px-1 rounded">name</code> - nazwa usługi (wymagane)</li>
                  <li>• <code className="bg-muted px-1 rounded">kategoria</code> lub <code className="bg-muted px-1 rounded">category</code> - kategoria usługi</li>
                  <li>• <code className="bg-muted px-1 rounded">czas</code> lub <code className="bg-muted px-1 rounded">duration</code> - czas trwania w minutach</li>
                  <li>• <code className="bg-muted px-1 rounded">cena</code> lub <code className="bg-muted px-1 rounded">price</code> - cena usługi</li>
                  <li>• <code className="bg-muted px-1 rounded">opis</code> lub <code className="bg-muted px-1 rounded">description</code> - opis usługi</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Przykład: <code className="bg-muted px-1 rounded text-xs">nazwa,kategoria,czas,cena,opis</code>
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 gap-2 w-full"
                  onClick={downloadExampleCSV}
                >
                  <Download className="w-4 h-4" />
                  Pobierz przykładowy plik CSV
                </Button>
              </div>
            </div>
          )}

          {/* Preview step */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{validCount} poprawnych</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span>{invalidCount} z błędami</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {importedServices.map((service) => (
                  <div
                    key={service.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      service.isValid 
                        ? "bg-card border-border" 
                        : "bg-destructive/5 border-destructive/30"
                    )}
                  >
                    {service.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{service.name || "Bez nazwy"}</p>
                      <p className="text-sm text-muted-foreground">
                        {categories.find(c => c.id === service.category)?.name || "Bez kategorii"} • {service.duration} min • {service.price} zł
                      </p>
                      {!service.isValid && (
                        <p className="text-xs text-destructive mt-1">
                          {service.errors.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditService(service)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeService(service.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit step */}
          {step === "edit" && editingService && (
            <div className="space-y-4">
              <div>
                <Label>Nazwa usługi</Label>
                <Input
                  value={editingService.name}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="np. Peeling kawitacyjny"
                />
              </div>
              <div>
                <Label>Kategoria</Label>
                <Select
                  value={editingService.category}
                  onValueChange={(value) => setEditingService(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Czas trwania (min)</Label>
                  <Input
                    type="number"
                    value={editingService.duration}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label>Cena (zł)</Label>
                  <Input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              <div>
                <Label>Opis</Label>
                <Input
                  value={editingService.description}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Krótki opis usługi..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={resetAndClose}>Anuluj</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Wróć</Button>
              <Button 
                variant="luxury" 
                onClick={handleImport}
                disabled={validCount === 0}
              >
                Importuj {validCount} usług
              </Button>
            </>
          )}
          {step === "edit" && (
            <>
              <Button variant="outline" onClick={() => setStep("preview")}>Anuluj</Button>
              <Button variant="luxury" onClick={saveEditedService}>Zapisz</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

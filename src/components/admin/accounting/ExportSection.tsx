import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Download, Send, FileSpreadsheet, FileText, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { AccountingExport } from "./types";
import { mockAccountingExports } from "./mockData";

interface ExportSectionProps {
  dateRange: { from: Date; to: Date };
}

export function ExportSection({ dateRange }: ExportSectionProps) {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<string>("pełny");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [accountantEmail, setAccountantEmail] = useState<string>("ksiegowosc@salon.pl");
  const [exports, setExports] = useState<AccountingExport[]>(mockAccountingExports);

  const handleExport = () => {
    const newExport: AccountingExport = {
      id: `ae${Date.now()}`,
      salonId: "demo",
      generatedByUserId: "u1",
      generatedByUserName: "Admin",
      generatedAt: new Date().toISOString(),
      periodStart: dateRange.from.toISOString().split("T")[0],
      periodEnd: dateRange.to.toISOString().split("T")[0],
      type: exportType as AccountingExport["type"],
      format: exportFormat as AccountingExport["format"],
      targetEmail: null,
      downloadUrl: "#",
    };

    setExports([newExport, ...exports]);

    toast({
      title: "Raport wygenerowany",
      description: "Możesz go pobrać z listy poniżej.",
    });
  };

  const handleExportAndSend = () => {
    if (!accountantEmail) {
      toast({
        title: "Błąd",
        description: "Wprowadź adres e-mail księgowej.",
        variant: "destructive",
      });
      return;
    }

    const newExport: AccountingExport = {
      id: `ae${Date.now()}`,
      salonId: "demo",
      generatedByUserId: "u1",
      generatedByUserName: "Admin",
      generatedAt: new Date().toISOString(),
      periodStart: dateRange.from.toISOString().split("T")[0],
      periodEnd: dateRange.to.toISOString().split("T")[0],
      type: exportType as AccountingExport["type"],
      format: exportFormat as AccountingExport["format"],
      targetEmail: accountantEmail,
      downloadUrl: "#",
    };

    setExports([newExport, ...exports]);

    toast({
      title: "Raport wysłany",
      description: `Raport został wysłany na adres ${accountantEmail}`,
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
      case "xlsx":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "pełny":
        return <Badge>Pełny pakiet</Badge>;
      case "sprzedaż VAT":
        return <Badge variant="secondary">Sprzedaż VAT</Badge>;
      case "prowizje":
        return <Badge variant="outline">Prowizje</Badge>;
      case "vouchery":
        return <Badge variant="outline">Vouchery</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Eksport dla księgowej
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rodzaj eksportu</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pełny">
                    Pełny pakiet (sprzedaż, dzienne raporty, prowizje, vouchery)
                  </SelectItem>
                  <SelectItem value="sprzedaż VAT">Tylko sprzedaż & VAT</SelectItem>
                  <SelectItem value="prowizje">Tylko prowizje pracowników</SelectItem>
                  <SelectItem value="vouchery">Tylko vouchery / pakiety</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (standard)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF (podsumowanie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail księgowej</Label>
              <Input
                type="email"
                placeholder="ksiegowosc@firma.pl"
                value={accountantEmail}
                onChange={(e) => setAccountantEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Eksportuj teraz
              </Button>
              <Button onClick={handleExportAndSend} className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Eksportuj i wyślij
              </Button>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          Okres: {format(dateRange.from, "dd MMMM yyyy", { locale: pl })} -{" "}
          {format(dateRange.to, "dd MMMM yyyy", { locale: pl })}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Historia eksportów</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Data wygenerowania</TableHead>
              <TableHead>Okres</TableHead>
              <TableHead>Rodzaj</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>E-mail docelowy</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exports.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>
                  {format(new Date(exp.generatedAt), "dd.MM.yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {format(new Date(exp.periodStart), "dd.MM")} -{" "}
                  {format(new Date(exp.periodEnd), "dd.MM.yyyy")}
                </TableCell>
                <TableCell>{getTypeBadge(exp.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getFormatIcon(exp.format)}
                    <span className="uppercase text-sm">{exp.format}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {exp.targetEmail ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {exp.targetEmail}
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Pobierz
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

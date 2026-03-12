import { useState } from "react";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
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
import { mockAccountingExports, mockTransactions, mockEmployeeCommissions, mockVouchers } from "./mockData";
import { useTranslation } from "react-i18next";
import { exportToCSV } from "@/lib/csvExport";

interface ExportSectionProps {
  dateRange: { from: Date; to: Date };
}

function generateExportFile(exportType: string, dateRange: { from: Date; to: Date }) {
  switch (exportType) {
    case "sprzedaż VAT":
      exportToCSV({
        filename: "sprzedaz_vat_eksport",
        headers: ["Data", "Typ", "Kategoria", "Nazwa", "Ilość", "Netto (zł)", "VAT (zł)", "Stawka VAT (%)", "Brutto (zł)", "Metoda płatności", "Pracownik"],
        rows: mockTransactions.map(tx => [
          tx.dateTime.split("T")[0], tx.itemType, tx.itemCategory, tx.itemName, tx.quantity,
          Math.round(tx.netAmount * 100) / 100, Math.round(tx.vatAmount * 100) / 100,
          tx.vatRate, tx.grossAmount, tx.paymentMethod, tx.staffName || ""
        ])
      });
      break;
    case "prowizje":
      exportToCSV({
        filename: "prowizje_eksport",
        headers: ["Pracownik", "Usługi brutto (zł)", "Produkty brutto (zł)", "Napiwki (zł)", "Prowizja od usług (zł)", "Prowizja od produktów (zł)", "Prowizja łącznie (zł)", "Do wypłaty (zł)"],
        rows: mockEmployeeCommissions.map(ec => [
          ec.staffName, ec.servicesGross, ec.productsGross, ec.tipsTotal,
          ec.commissionServices, ec.commissionProducts, ec.totalCommission, ec.totalPayout
        ])
      });
      break;
    case "vouchery":
      exportToCSV({
        filename: "vouchery_eksport",
        headers: ["Kod", "Typ", "Klient", "Data wydania", "Data ważności", "Wartość oryginalna (zł)", "Pozostała wartość (zł)", "Status"],
        rows: mockVouchers.map(v => [
          v.code, v.type, v.clientName || "", v.issueDate, v.expiryDate || "",
          v.originalValue, v.remainingValue, v.status
        ])
      });
      break;
    default: // "pełny"
      exportToCSV({
        filename: "pelny_raport_eksport",
        headers: ["Data", "Godzina", "Typ", "Kategoria", "Nazwa", "Ilość", "Netto (zł)", "VAT (zł)", "Stawka VAT (%)", "Brutto (zł)", "Metoda płatności", "Pracownik", "Klient", "Napiwek (zł)"],
        rows: mockTransactions.map(tx => [
          tx.dateTime.split("T")[0], tx.dateTime.split("T")[1]?.substring(0, 5) || "",
          tx.itemType, tx.itemCategory, tx.itemName, tx.quantity,
          Math.round(tx.netAmount * 100) / 100, Math.round(tx.vatAmount * 100) / 100,
          tx.vatRate, tx.grossAmount, tx.paymentMethod, tx.staffName || "",
          tx.clientName || "", tx.tipAmount
        ])
      });
      break;
  }
}

export function ExportSection({ dateRange }: ExportSectionProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [exportType, setExportType] = useState<string>("pełny");
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [accountantEmail, setAccountantEmail] = useState<string>("ksiegowosc@salon.pl");
  const [exports, setExports] = useState<AccountingExport[]>(mockAccountingExports);
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  const handleExport = () => {
    generateExportFile(exportType, dateRange);

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
      title: t('accounting.reportGenerated'),
      description: "Plik CSV został pobrany.",
    });
  };

  const handleExportAndSend = () => {
    if (!accountantEmail) {
      toast({
        title: t('accounting.error'),
        description: t('accounting.enterAccountantEmail'),
        variant: "destructive",
      });
      return;
    }

    generateExportFile(exportType, dateRange);

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
      title: t('accounting.reportSent'),
      description: t('accounting.reportSentTo', { email: accountantEmail }),
    });
  };

  const handleDownloadExport = (exp: AccountingExport) => {
    generateExportFile(exp.type, {
      from: new Date(exp.periodStart),
      to: new Date(exp.periodEnd),
    });
    toast({ title: "Plik pobrany", description: `Raport ${exp.type} został pobrany.` });
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
        return <Badge>{t('accounting.fullPackage').split(' ')[0]} {t('accounting.fullPackage').split(' ')[1]}</Badge>;
      case "sprzedaż VAT":
        return <Badge variant="secondary">{t('accounting.salesVat')}</Badge>;
      case "prowizje":
        return <Badge variant="outline">{t('accounting.commissions')}</Badge>;
      case "vouchery":
        return <Badge variant="outline">{t('accounting.vouchers')}</Badge>;
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
          {t('accounting.exportForAccountant')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('accounting.exportType')}</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pełny">
                    {t('accounting.fullPackage')}
                  </SelectItem>
                  <SelectItem value="sprzedaż VAT">{t('accounting.salesVatOnly')}</SelectItem>
                  <SelectItem value="prowizje">{t('accounting.commissionsOnly')}</SelectItem>
                  <SelectItem value="vouchery">{t('accounting.vouchersOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('accounting.format')}</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">{t('accounting.csvStandard')}</SelectItem>
                  <SelectItem value="xlsx">{t('accounting.excelXlsx')}</SelectItem>
                  <SelectItem value="pdf">{t('accounting.pdfSummary')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('accounting.accountantEmail')}</Label>
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
                {t('accounting.exportNow')}
              </Button>
              <Button onClick={handleExportAndSend} className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                {t('accounting.exportAndSend')}
              </Button>
            </div>
          </div>
        </div>

        {/* Period Info */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          {t('accounting.period')}: {format(dateRange.from, "dd MMMM yyyy", { locale: dateLocale })} -{" "}
          {format(dateRange.to, "dd MMMM yyyy", { locale: dateLocale })}
        </div>
      </div>

      {/* Export History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">{t('accounting.exportHistory')}</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('accounting.generatedDate')}</TableHead>
              <TableHead>{t('accounting.period')}</TableHead>
              <TableHead>{t('accounting.exportType')}</TableHead>
              <TableHead>{t('accounting.format')}</TableHead>
              <TableHead>{t('accounting.targetEmail')}</TableHead>
              <TableHead className="text-right">{t('accounting.actions')}</TableHead>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownloadExport(exp)}
                  >
                    <Download className="w-4 h-4" />
                    {t('accounting.download')}
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

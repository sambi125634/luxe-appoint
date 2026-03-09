import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Calculator, Receipt, Users, Ticket, Download, BarChart3, Package, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingFiltersBar } from "./AccountingFilters";
import { AccountingCharts } from "./AccountingCharts";
import { DailyCashUp } from "./DailyCashUp";
import { SalesVatReport } from "./SalesVatReport";
import { EmployeeCommissions } from "./EmployeeCommissions";
import { VouchersReport } from "./VouchersReport";
import { ExportSection } from "./ExportSection";
import { ProductSalesAccountingReport } from "./ProductSalesAccountingReport";
import { ManualEntryModal, ManualTransaction } from "./ManualEntryModal";
import { AccountingFilters, Transaction } from "./types";
import { mockTransactions } from "./mockData";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { SectionGuide } from "../SectionGuide";

interface AccountingModuleProps {
  isDemo?: boolean;
}

export function AccountingModule({ isDemo = false }: AccountingModuleProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("charts");
  const [transactions, setTransactions] = useState<Transaction[]>(isDemo ? mockTransactions : []);
  const [filters, setFilters] = useState<AccountingFilters>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
    location: null,
    reportType: "daily",
  });

  const handleExportCSV = () => {
    toast({
      title: t('accounting.exportCsv'),
      description: t('accounting.canDownloadBelow'),
    });
  };

  const handleExportPDF = () => {
    toast({
      title: t('accounting.exportPdf'),
      description: t('accounting.canDownloadBelow'),
    });
  };

  const handleAddManualTransaction = (manualTx: ManualTransaction) => {
    const newTransaction: Transaction = {
      id: `manual-${Date.now()}`,
      salonId: "demo",
      dateTime: `${manualTx.date}T${manualTx.time}:00`,
      clientId: null,
      clientName: manualTx.clientName || null,
      staffId: null,
      staffName: manualTx.staffName || null,
      locationId: null,
      itemType: manualTx.itemType,
      itemCategory: manualTx.itemCategory,
      itemName: manualTx.itemName,
      quantity: manualTx.quantity,
      unitPriceBrutto: manualTx.unitPriceBrutto,
      discountAmount: manualTx.discountAmount,
      vatRate: manualTx.vatRate,
      netAmount: (manualTx.unitPriceBrutto * manualTx.quantity - manualTx.discountAmount) / (1 + manualTx.vatRate / 100),
      vatAmount: (manualTx.unitPriceBrutto * manualTx.quantity - manualTx.discountAmount) - 
        (manualTx.unitPriceBrutto * manualTx.quantity - manualTx.discountAmount) / (1 + manualTx.vatRate / 100),
      grossAmount: manualTx.unitPriceBrutto * manualTx.quantity - manualTx.discountAmount,
      paymentMethod: manualTx.paymentMethod,
      tipAmount: manualTx.tipAmount,
      relatedVoucherId: null,
      status: "opłacone",
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // Empty state for production mode
  if (!isDemo && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="accounting" />
        <div className="glass-card p-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Brak danych księgowych</h3>
            <p className="text-muted-foreground text-sm">
              Raporty i statystyki finansowe pojawią się automatycznie po zrealizowaniu pierwszych wizyt i transakcji w Twoim salonie.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Filters + Manual Entry */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="flex-1 w-full">
          <AccountingFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        </div>
        <ManualEntryModal onAddTransaction={handleAddManualTransaction} />
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-flex">
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.charts')}</span>
            <span className="sm:hidden">{t('accounting.charts')}</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <Calculator className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.dailyReport')}</span>
            <span className="sm:hidden">{t('accounting.dailyReport')}</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Receipt className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.salesVat')}</span>
            <span className="sm:hidden">{t('accounting.salesVat')}</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.productSales.title')}</span>
            <span className="sm:hidden">{t('accounting.productSales.title')}</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2">
            <Users className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.commissions')}</span>
            <span className="sm:hidden">{t('accounting.commissions')}</span>
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2">
            <Ticket className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.vouchers')}</span>
            <span className="sm:hidden">{t('accounting.vouchers')}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">{t('accounting.export')}</span>
            <span className="sm:hidden">{t('accounting.export')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="mt-6">
          <AccountingCharts transactions={transactions} dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <DailyCashUp dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesVatReport dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductSalesAccountingReport dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="commissions" className="mt-6">
          <EmployeeCommissions dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="vouchers" className="mt-6">
          <VouchersReport dateRange={filters.dateRange} />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ExportSection dateRange={filters.dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Calculator, Receipt, Users, Ticket, Download, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingFiltersBar } from "./AccountingFilters";
import { AccountingCharts } from "./AccountingCharts";
import { DailyCashUp } from "./DailyCashUp";
import { SalesVatReport } from "./SalesVatReport";
import { EmployeeCommissions } from "./EmployeeCommissions";
import { VouchersReport } from "./VouchersReport";
import { ExportSection } from "./ExportSection";
import { ManualEntryModal, ManualTransaction } from "./ManualEntryModal";
import { AccountingFilters, Transaction } from "./types";
import { mockTransactions } from "./mockData";
import { useToast } from "@/hooks/use-toast";

export function AccountingModule() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("charts");
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
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
      title: "Eksport CSV",
      description: "Raport został wygenerowany i jest gotowy do pobrania.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Eksport PDF",
      description: "Podsumowanie PDF zostało wygenerowane.",
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
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Wykresy</span>
            <span className="sm:hidden">Wykresy</span>
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <Calculator className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Dzienny raport</span>
            <span className="sm:hidden">Dzienny</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Receipt className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Sprzedaż & VAT</span>
            <span className="sm:hidden">Sprzedaż</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="gap-2">
            <Users className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Prowizje</span>
            <span className="sm:hidden">Prowizje</span>
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2">
            <Ticket className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Vouchery</span>
            <span className="sm:hidden">Vouchery</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="w-4 h-4 hidden sm:inline" />
            <span className="hidden sm:inline">Eksport</span>
            <span className="sm:hidden">Eksport</span>
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

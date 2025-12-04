import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { Calculator, Receipt, Users, Ticket, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountingFiltersBar } from "./AccountingFilters";
import { DailyCashUp } from "./DailyCashUp";
import { SalesVatReport } from "./SalesVatReport";
import { EmployeeCommissions } from "./EmployeeCommissions";
import { VouchersReport } from "./VouchersReport";
import { ExportSection } from "./ExportSection";
import { AccountingFilters } from "./types";
import { useToast } from "@/hooks/use-toast";

export function AccountingModule() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("daily");
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

  return (
    <div className="space-y-6">
      {/* Global Filters */}
      <AccountingFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
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

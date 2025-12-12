import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Truck, TrendingUp, Building2 } from "lucide-react";
import { ProductsCatalog } from "./ProductsCatalog";
import { StockManagement } from "./StockManagement";
import { DeliveriesManagement } from "./DeliveriesManagement";
import { ProductSalesReport } from "./ProductSalesReport";
import { SuppliersManagement } from "./SuppliersManagement";
import type { ProductTab } from "./types";

export function ProductsModule() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ProductTab>("catalog");

  const tabs = [
    { id: "catalog" as ProductTab, label: t("products.catalog"), icon: Package },
    { id: "stock" as ProductTab, label: t("products.stock"), icon: Warehouse },
    { id: "deliveries" as ProductTab, label: t("products.deliveries"), icon: Truck },
    { id: "sales-report" as ProductTab, label: t("products.salesReport"), icon: TrendingUp },
    { id: "suppliers" as ProductTab, label: t("products.suppliers"), icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProductTab)}>
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          <ProductsCatalog />
        </TabsContent>

        <TabsContent value="stock" className="mt-6">
          <StockManagement />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6">
          <DeliveriesManagement />
        </TabsContent>

        <TabsContent value="sales-report" className="mt-6">
          <ProductSalesReport />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <SuppliersManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

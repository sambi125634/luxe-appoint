import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Truck, TrendingUp, Building2, FlaskConical, BarChart3 } from "lucide-react";
import { ProductsCatalog } from "./ProductsCatalog";
import { StockManagement } from "./StockManagement";
import { DeliveriesManagement } from "./DeliveriesManagement";
import { ProductSalesReport } from "./ProductSalesReport";
import { SuppliersManagement } from "./SuppliersManagement";
import { ServiceRecipes } from "@/modules/inventory/ServiceRecipes";
import InventoryStats from "@/modules/inventory/InventoryStats";
import { useSalonId } from "@/hooks/useSalonId";
import { useProducts } from "@/hooks/useProducts";
import { SectionGuide } from "../SectionGuide";
import type { ProductTab } from "./types";

// Demo salon ID for mock data
const DEMO_SALON_ID = "demo-salon-id";

export function ProductsModule({ isDemo }: { isDemo?: boolean }) {
  const { t } = useTranslation();
  const { salonId, isLoading } = useSalonId();
  const [activeTab, setActiveTab] = useState<ProductTab>("catalog");

  const effectiveSalonId = isDemo ? DEMO_SALON_ID : (salonId || DEMO_SALON_ID);
  const { products } = useProducts(effectiveSalonId);

  const tabs = [
    { id: "catalog" as ProductTab, label: t("products.catalog"), icon: Package },
    { id: "stock" as ProductTab, label: t("products.stock"), icon: Warehouse },
    { id: "recipes" as ProductTab, label: "Receptury", icon: FlaskConical },
    { id: "deliveries" as ProductTab, label: t("products.deliveries"), icon: Truck },
    { id: "inv-stats" as ProductTab, label: "Statystyki", icon: BarChart3 },
    { id: "sales-report" as ProductTab, label: t("products.salesReport"), icon: TrendingUp },
    { id: "suppliers" as ProductTab, label: t("products.suppliers"), icon: Building2 },
  ];

  const statsProducts = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    current_stock: p.current_stock,
    purchase_price_net: p.purchase_price_net ?? null,
    sale_price_gross: p.sale_price_gross,
    min_stock: p.min_stock,
  }));

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="products" />
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
          <ProductsCatalog salonId={effectiveSalonId} />
        </TabsContent>

        <TabsContent value="stock" className="mt-6">
          <StockManagement salonId={effectiveSalonId} />
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <ServiceRecipes salonId={effectiveSalonId} />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6">
          <DeliveriesManagement salonId={effectiveSalonId} />
        </TabsContent>

        <TabsContent value="inv-stats" className="mt-6">
          <InventoryStats salonId={effectiveSalonId} products={statsProducts} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="sales-report" className="mt-6">
          <ProductSalesReport />
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <SuppliersManagement salonId={effectiveSalonId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

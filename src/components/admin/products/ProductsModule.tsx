import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Truck, TrendingUp, Building2, FlaskConical, BarChart3, Loader2, ShoppingCart, FileText, Coins } from "lucide-react";
import { ProductsCatalog } from "./ProductsCatalog";
import { StockManagement } from "./StockManagement";
import { DeliveriesManagement } from "./DeliveriesManagement";
import { ProductSalesReport } from "./ProductSalesReport";
import { SuppliersManagement } from "./SuppliersManagement";
import { BulkOrderForm } from "./BulkOrderForm";
import { PurchaseOrdersList } from "./PurchaseOrdersList";
import { InvoiceAIScanner } from "./InvoiceAIScanner";
import ServiceRecipes from "@/modules/inventory/ServiceRecipes";
import InventoryStats from "@/modules/inventory/InventoryStats";
import { TrueProfitDashboard } from "@/modules/analytics/TrueProfitDashboard";
import { useSalonId } from "@/hooks/useSalonId";
import { useProducts } from "@/hooks/useProducts";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { SectionGuide } from "../SectionGuide";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList } from "lucide-react";
import type { ProductTab } from "./types";

// Demo salon ID for mock data
const DEMO_SALON_ID = "demo-salon-id";

export function ProductsModule({ isDemo }: { isDemo?: boolean }) {
  const { t } = useTranslation();
  const { salonId, isLoading } = useSalonId();
  const [activeTab, setActiveTab] = useState<ProductTab>("catalog");
  const [ordersView, setOrdersView] = useState<"list" | "new">("list");
  const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = useState(false);

  const effectiveSalonId = isDemo ? DEMO_SALON_ID : (salonId ?? undefined);
  const { products } = useProducts(effectiveSalonId);
  const { getOrderItems } = usePurchaseOrders(effectiveSalonId);

  if (!isDemo && isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isDemo && !salonId) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Błąd: nie można załadować danych salonu. Odśwież stronę.
      </div>
    );
  }

  const tabs = [
    { id: "catalog" as ProductTab, label: t("products.catalog"), icon: Package },
    { id: "stock" as ProductTab, label: t("products.stock"), icon: Warehouse },
    { id: "recipes" as ProductTab, label: "Receptury", icon: FlaskConical },
    { id: "deliveries" as ProductTab, label: t("products.deliveries"), icon: Truck },
    { id: "orders" as ProductTab, label: "Zamówienia", icon: ShoppingCart },
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

  const handleReorder = async (orderId: string) => {
    // Switch to new order form — reorder logic could pre-fill items
    setOrdersView("new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionGuide sectionKey={activeTab === 'recipes' ? 'recipes' : 'products'} />
        <Button variant="outline" onClick={() => setIsInvoiceUploadOpen(true)} className="gap-2">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Wgraj fakturę</span>
        </Button>
      </div>
      <InvoiceAIScanner
        open={isInvoiceUploadOpen}
        onOpenChange={setIsInvoiceUploadOpen}
        salonId={effectiveSalonId}
      />
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ProductTab); if (v === "orders") setOrdersView("list"); }}>
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
          <ServiceRecipes salonId={effectiveSalonId} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="deliveries" className="mt-6">
          <DeliveriesManagement salonId={effectiveSalonId} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="space-y-4">
            {ordersView === "list" && (
              <>
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setOrdersView("new")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nowe zamówienie
                  </Button>
                </div>
                <PurchaseOrdersList salonId={effectiveSalonId} onReorder={handleReorder} />
              </>
            )}
            {ordersView === "new" && (
              <BulkOrderForm salonId={effectiveSalonId} onClose={() => setOrdersView("list")} />
            )}
          </div>
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

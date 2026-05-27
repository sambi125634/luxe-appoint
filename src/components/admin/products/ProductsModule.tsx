import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Truck, TrendingUp, Building2, FlaskConical, BarChart3, Loader2, ShoppingCart, FileText, Sparkles, ScanLine, ArrowRight } from "lucide-react";
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
      <div className="grid gap-4 lg:grid-cols-5 items-stretch">
        <div className="lg:col-span-3 min-w-0">
          <SectionGuide sectionKey={activeTab === 'recipes' ? 'recipes' : 'products'} />
        </div>
        <button
          type="button"
          onClick={() => setIsInvoiceUploadOpen(true)}
          className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5 text-left transition-all hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80" aria-hidden />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ScanLine className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3 w-3" />
                  AI Skaner
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold leading-tight">
                Wgraj fakturę — AI zaktualizuje stany
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Zrób zdjęcie lub wgraj PDF. System odczyta produkty, ilości i ceny, a magazyn zaktualizuje się w sekundę.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 mt-3" />
          </div>
        </button>
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

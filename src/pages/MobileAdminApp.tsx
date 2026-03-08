import { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { MobileAdminBottomBar } from "@/components/mobile-admin/MobileAdminBottomBar";
import { MobileDashboard } from "@/components/mobile-admin/MobileDashboard";
import { MobileCalendar } from "@/components/mobile-admin/MobileCalendar";
import { MobileClients } from "@/components/mobile-admin/MobileClients";
import { MobileNotifications } from "@/components/mobile-admin/MobileNotifications";
import { MobileMoreMenu } from "@/components/mobile-admin/MobileMoreMenu";
import { MobileModuleWrapper } from "@/components/mobile-admin/MobileModuleWrapper";

// Lazy load desktop components for mobile reuse
const ServicesManagement = lazy(() => import("@/components/admin/ServicesManagement").then(m => ({ default: m.ServicesManagement })));
const StaffManagement = lazy(() => import("@/components/admin/StaffManagement").then(m => ({ default: m.StaffManagement })));
const TimeOffManagement = lazy(() => import("@/components/admin/TimeOffManagement").then(m => ({ default: m.TimeOffManagement })));
const ProductsModule = lazy(() => import("@/components/admin/products/ProductsModule").then(m => ({ default: m.ProductsModule })));
const PipelineModule = lazy(() => import("@/components/admin/pipeline/PipelineModule").then(m => ({ default: m.PipelineModule })));
const ConversationsModule = lazy(() => import("@/components/admin/conversations/ConversationsModule").then(m => ({ default: m.ConversationsModule })));
const WidgetsManagement = lazy(() => import("@/components/admin/widgets/WidgetsManagement").then(m => ({ default: m.WidgetsManagement })));
const AccountingModule = lazy(() => import("@/components/admin/accounting/AccountingModule").then(m => ({ default: m.AccountingModule })));
const StatsModule = lazy(() => import("@/components/admin/StatsModule").then(m => ({ default: m.StatsModule })));
const SettingsModule = lazy(() => import("@/components/admin/settings/SettingsModule").then(m => ({ default: m.SettingsModule })));
const SupportModule = lazy(() => import("@/components/admin/support/SupportModule").then(m => ({ default: m.SupportModule })));

const moduleConfig: Record<string, { title: string }> = {
  services: { title: "Usługi" },
  staff: { title: "Personel" },
  "time-off": { title: "Urlopy" },
  products: { title: "Produkty" },
  pipeline: { title: "Pipeline" },
  conversations: { title: "Konwersacje" },
  widgets: { title: "Widgety" },
  accounting: { title: "Księgowość" },
  stats: { title: "Statystyki" },
  settings: { title: "Ustawienia" },
  support: { title: "Pomoc" },
};

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function MobileModule({ tab }: { tab: string }) {
  const config = moduleConfig[tab] || { title: tab };
  
  const renderModule = () => {
    switch (tab) {
      case "services": return <ServicesManagement />;
      case "staff": return <StaffManagement />;
      case "time-off": return <TimeOffManagement />;
      case "products": return <ProductsModule />;
      case "pipeline": return <PipelineModule />;
      case "conversations": return <ConversationsModule />;
      case "widgets": return <WidgetsManagement />;
      case "accounting": return <AccountingModule />;
      case "stats": return <StatsModule />;
      case "settings": return <SettingsModule />;
      case "support": return <SupportModule />;
      default: return <p className="text-center text-muted-foreground py-10">Moduł niedostępny</p>;
    }
  };

  return (
    <MobileModuleWrapper title={config.title}>
      <Suspense fallback={<ModuleLoader />}>
        {renderModule()}
      </Suspense>
    </MobileModuleWrapper>
  );
}

function MobileModuleRoute() {
  // Extract tab from URL
  const tab = window.location.pathname.split("/m/module/")[1] || "";
  return <MobileModule tab={tab} />;
}

export default function MobileAdminApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { role, isLoading: roleLoading, onboardingCompleted } = useUserRole();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth?redirect=/m");
      } else {
        setIsAuthenticated(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth?redirect=/m");
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (!roleLoading && role === "salon_owner" && !onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [roleLoading, role, onboardingCompleted, navigate]);

  if (!isAuthenticated || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route index element={<MobileDashboard />} />
        <Route path="calendar" element={<MobileCalendar />} />
        <Route path="clients" element={<MobileClients />} />
        <Route path="notifications" element={<MobileNotifications />} />
        <Route path="more" element={<MobileMoreMenu />} />
        <Route path="module/:tab" element={<MobileModuleRoute />} />
      </Routes>
      <MobileAdminBottomBar />
    </div>
  );
}

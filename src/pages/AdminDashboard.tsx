import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronRight, Bell, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar, TabType } from "@/components/admin/AdminSidebar";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { ClientsManagement } from "@/components/admin/ClientsManagement";
import { ServicesManagement } from "@/components/admin/ServicesManagement";
import { StaffManagement } from "@/components/admin/StaffManagement";
import { TimeOffManagement } from "@/components/admin/TimeOffManagement";
import { StatsModule } from "@/components/admin/StatsModule";
import { ConversationsModule } from "@/components/admin/conversations/ConversationsModule";
import { PipelineModule } from "@/components/admin/pipeline";
import { AccountingModule } from "@/components/admin/accounting";
import { WidgetsManagement } from "@/components/admin/widgets";
import { SettingsModule } from "@/components/admin/settings";
import { ProductsModule } from "@/components/admin/products";
import { SupportModule } from "@/components/admin/support";
import { RetentionDashboard } from "@/modules/retention";
import { InventoryDashboard } from "@/modules/inventory";
import { PixelDashboard } from "@/modules/pixel";
import { TrueProfitDashboard } from "@/modules/analytics";
import { ConsultationModule } from "@/modules/consultation";
import { ReferralEngine } from "@/modules/referral";
import { GuidedTour, useAdminTourState } from "@/components/admin/GuidedTour";
import { AutopilotStatusBar } from "@/components/admin/AutopilotStatusBar";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { role, salonId, salonName, onboardingCompleted, isLoading: roleLoading } = useUserRole();
  const { showTour, setShowTour, restartTour } = useAdminTourState();

  const { data: salonSlug } = useQuery({
    queryKey: ["salon-slug", salonId],
    queryFn: async () => {
      const { data } = await supabase.from("salons").select("slug").eq("id", salonId!).single();
      return data?.slug ?? null;
    },
    enabled: !!salonId,
  });

  // Guard: redirect to onboarding if not completed
  useEffect(() => {
    if (!roleLoading && role === "salon_owner" && !onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [roleLoading, role, onboardingCompleted, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Dashboard";
      case "calendar": return "Kalendarz";
      case "widgets": return "Widgety rezerwacji";
      case "clients": return "Klienci";
      case "conversations": return "Konwersacje";
      case "pipeline": return "Pipeline sprzedażowy";
      case "accounting": return "Księgowość & Raporty";
      case "products": return "Produkty";
      case "inventory": return "Magazyn & Receptury";
      case "staff": return "Personel";
      case "services": return "Usługi";
      case "time-off": return "Urlopy i dni wolne";
      case "stats": return "Statystyki";
      case "settings": return "Ustawienia";
      case "support": return "Pomoc & AI Asystent";
      case "retention": return "Retencja klientek";
      case "pixel": return "Meta Pixel & CRM Sync";
      case "analytics": return "True Profit Analytics";
      case "consultation": return "Karty konsultacyjne";
      case "referral": return "Polecenia & Opinie";
      default: return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <DashboardHome onNavigate={(tab) => setActiveTab(tab as TabType)} />;
      case "calendar": return <ScheduleManagement />;
      case "widgets": return <WidgetsManagement />;
      case "clients": return <ClientsManagement />;
      case "conversations": return <ConversationsModule />;
      case "pipeline": return <PipelineModule />;
      case "accounting": return <AccountingModule />;
      case "products": return <ProductsModule />;
      case "inventory": return <InventoryDashboard />;
      case "services": return <ServicesManagement />;
      case "staff": return <StaffManagement />;
      case "time-off": return <TimeOffManagement />;
      case "stats": return <StatsModule />;
      case "settings": return <SettingsModule />;
      case "support": return <SupportModule />;
      case "retention": return <RetentionDashboard />;
      case "pixel": return <PixelDashboard />;
      case "analytics": return <TrueProfitDashboard />;
      case "consultation": return <ConsultationModule />;
      case "referral": return <ReferralEngine />;
      default: return null;
    }
  };

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onClose={() => setSidebarOpen(false)}
          userRole={role}
          salonName={salonName}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="font-serif text-xl font-semibold">{getPageTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={restartTour}>
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Samouczek</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
            </Button>
            <Link to="/book/demo-salon">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <ChevronRight className="w-4 h-4" />
                Zobacz widget
              </Button>
            </Link>
          </div>
        </header>

        <AutopilotStatusBar />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {showTour && (
        <GuidedTour
          onTabChange={setActiveTab}
          onComplete={() => setShowTour(false)}
        />
      )}
    </div>
  );
}

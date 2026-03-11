import { useState } from "react";
import { Menu, X, ChevronRight, Bell, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSidebar, TabType } from "@/components/admin/AdminSidebar";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { ClientsManagement } from "@/components/admin/ClientsManagement";
import { ServicesManagement } from "@/components/admin/ServicesManagement";
import { StaffManagement } from "@/components/admin/StaffManagement";
import { WidgetsManagement } from "@/components/admin/widgets";
import { TimeOffManagement } from "@/components/admin/TimeOffManagement";
import { StatsModule } from "@/components/admin/StatsModule";
import { SettingsModule } from "@/components/admin/settings";
import { ConversationsModule } from "@/components/admin/conversations";
import { PipelineModule } from "@/components/admin/pipeline";
import { AccountingModule } from "@/components/admin/accounting";
import { ProductsModule } from "@/components/admin/products";
import { SupportModule } from "@/components/admin/support";
import { GuidedTour, useTourState } from "@/components/demo/GuidedTour";
import { AutopilotStatusBar } from "@/components/admin/AutopilotStatusBar";
import { RetentionDashboard } from "@/modules/retention";
import { InventoryDashboard } from "@/modules/inventory";
import { PixelDashboard } from "@/modules/pixel";
import { TrueProfitDashboard } from "@/modules/analytics";
import { ConsultationModule } from "@/modules/consultation";
import { ReferralEngine } from "@/modules/referral";

export default function DemoPage() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const { showTour, setShowTour } = useTourState();

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Dashboard";
      case "calendar": return t("admin.calendar");
      case "widgets": return t("admin.widgets");
      case "clients": return t("admin.clients");
      case "conversations": return t("admin.conversations");
      case "pipeline": return t("admin.pipeline");
      case "accounting": return t("accounting.charts");
      case "products": return t("admin.products");
      case "staff": return t("admin.staff");
      case "services": return t("admin.services");
      case "time-off": return t("timeOff.title");
      case "stats": return t("admin.reports");
      case "settings": return t("admin.settings");
      case "retention": return "Retencja klientek";
      case "inventory": return "Magazyn & Receptury";
      case "pixel": return "Meta Pixel & CRM Sync";
      case "analytics": return "True Profit Analytics";
      case "consultation": return "Karty konsultacyjne";
      case "referral": return "Polecenia & Opinie";
      default: return "Dashboard";
    }
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case "home":
          return <DashboardHome isDemo={true} />;
        case "calendar":
          return <ScheduleManagement isDemo={true} />;
        case "widgets":
          return <WidgetsManagement isDemo={true} />;
        case "clients":
          return <ClientsManagement isDemo={true} />;
        case "services":
          return <ServicesManagement isDemo={true} />;
        case "staff":
          return <StaffManagement isDemo={true} />;
        case "time-off":
          return <TimeOffManagement isDemo={true} />;
        case "stats":
          return <StatsModule isDemo={true} />;
        case "settings":
          return <SettingsModule isDemo />;
        case "conversations":
          return <ConversationsModule isDemo={true} />;
        case "pipeline":
          return <PipelineModule isDemo={true} />;
        case "accounting":
          return <AccountingModule isDemo={true} />;
        case "products":
          return <ProductsModule isDemo />;
        case "inventory":
          return <InventoryDashboard isDemo />;
        case "support":
          return <SupportModule />;
        case "retention":
          return <RetentionDashboard isDemo />;
        case "pixel":
          return <PixelDashboard isDemo />;
        case "analytics":
          return <TrueProfitDashboard isDemo />;
        case "consultation":
          return <ConsultationModule isDemo />;
        case "referral":
          return <ReferralEngine isDemo />;
        default:
          return null;
      }
    })();

    return content;
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Guided Tour */}
      {showTour && (
        <GuidedTour 
          onTabChange={setActiveTab} 
          onComplete={handleTourComplete}
        />
      )}

      {/* Demo banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-2 px-4 text-center text-sm flex items-center justify-center gap-3 flex-wrap">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <strong>{t("demo.banner.title")}</strong> • {t("demo.banner.subtitle")}
        </span>
        <a href="/#lead-form">
          <Button variant="secondary" size="sm" className="h-7 text-xs">
            {t("demo.banner.cta")}
          </Button>
        </a>
      </div>

      <div className="flex-1 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
              </Button>
              <a href="/book/demo-salon">
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <ChevronRight className="w-4 h-4" />
                  {t("demo.fullPreview")}
                </Button>
              </a>
            </div>
          </header>

          <AutopilotStatusBar isDemo />

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Menu, X, ChevronRight, Bell, Lock, Sparkles } from "lucide-react";
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
import { DemoBenefitBanner } from "@/components/demo/DemoBenefitBanner";

// Locked tabs that require registration
const lockedTabs: TabType[] = ["time-off", "stats", "settings", "conversations", "pipeline", "accounting"];

function LockedContent({ tabName }: { tabName: string }) {
  const { t } = useTranslation();
  
  const tabLabels: Record<string, string> = {
    "time-off": t("timeOff.title"),
    "stats": t("admin.reports"),
    "settings": t("admin.settings"),
    "conversations": t("admin.conversations"),
    "pipeline": t("admin.pipeline"),
    "accounting": t("accounting.charts"),
  };

  return (
    <div className="relative">
      {/* Blurred background content */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-sm rounded-xl" />
      
      {/* Lock overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h3 className="font-serif text-2xl font-semibold mb-3">
          {tabLabels[tabName] || tabName}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t("demo.locked.description")}
        </p>
        <a href="/#lead-form">
          <Button size="lg" className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t("demo.locked.cta")}
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Dashboard";
      case "calendar": return "Kalendarz";
      case "widgets": return "Widgety rezerwacji";
      case "clients": return "Klienci";
      case "conversations": return "Konwersacje";
      case "pipeline": return "Pipeline sprzedażowy";
      case "accounting": return "Księgowość & Raporty";
      case "staff": return "Personel";
      case "services": return "Usługi";
      case "time-off": return "Urlopy i dni wolne";
      case "stats": return "Statystyki";
      case "settings": return "Ustawienia";
      default: return "Dashboard";
    }
  };

  const renderContent = () => {
    // Check if tab is locked
    if (lockedTabs.includes(activeTab)) {
      return <LockedContent tabName={activeTab} />;
    }

    const benefitKey = activeTab === "calendar" ? "calendar" : activeTab;

    const content = (() => {
      switch (activeTab) {
        case "home":
          return <DashboardHome />;
        case "calendar":
          return <ScheduleManagement />;
        case "widgets":
          return <WidgetsManagement />;
        case "clients":
          return <ClientsManagement />;
        case "services":
          return <ServicesManagement />;
        case "staff":
          return <StaffManagement />;
        default:
          return null;
      }
    })();

    return (
      <>
        <DemoBenefitBanner benefitKey={benefitKey} />
        {content}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

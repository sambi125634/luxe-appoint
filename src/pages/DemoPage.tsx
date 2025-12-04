import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Plus, ChevronRight, Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSidebar, TabType } from "@/components/admin/AdminSidebar";
import { WeeklyCalendar } from "@/components/admin/WeeklyCalendar";
import { ServicesManagement } from "@/components/admin/ServicesManagement";
import { StaffManagement } from "@/components/admin/StaffManagement";
import { DemoLockedOverlay } from "@/components/demo/DemoLockedOverlay";
import { GuidedTour } from "@/components/demo/GuidedTour";
import { DemoStats } from "@/components/demo/DemoStats";

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("demo-tour-seen");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseTour = () => {
    setShowTour(false);
    localStorage.setItem("demo-tour-seen", "true");
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "calendar": return "Kalendarz";
      case "staff": return "Personel";
      case "services": return "Usługi";
      case "stats": return "Statystyki";
      case "settings": return "Ustawienia";
      default: return "Dashboard";
    }
  };

  const isLockedTab = (tab: TabType) => {
    return tab === "stats" || tab === "settings";
  };

  const renderContent = () => {
    if (isLockedTab(activeTab)) {
      if (activeTab === "stats") {
        return (
          <DemoLockedOverlay feature="Statystyki i raporty">
            <DemoStats />
          </DemoLockedOverlay>
        );
      }
      return (
        <DemoLockedOverlay feature={getPageTitle()}>
          <div className="glass-card p-6 text-center text-muted-foreground h-96">
            <p className="font-serif text-lg mb-2">{getPageTitle()}</p>
            <p className="text-sm">Zawartość modułu...</p>
          </div>
        </DemoLockedOverlay>
      );
    }

    switch (activeTab) {
      case "calendar":
        return <WeeklyCalendar isDemo />;
      case "services":
        return <ServicesManagement isDemo />;
      case "staff":
        return <StaffManagement isDemo />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-2 px-4 flex items-center justify-center gap-3 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>To jest wersja demo • Twoje dane nie zostaną zapisane</span>
        <Link to="/">
          <Button size="sm" variant="secondary" className="ml-2 h-7 text-xs">
            Zarejestruj się
          </Button>
        </Link>
      </div>

      <div className="flex flex-1">
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
            isDemo
            lockedTabs={["stats", "settings"]}
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
              <Link to="/book/demo-salon">
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Widok klientki
                </Button>
              </Link>
              {activeTab === "calendar" && (
                <Button variant="luxury" size="sm" className="gap-2" data-tour="add-appointment">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nowa wizyta</span>
                </Button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Guided Tour */}
      {showTour && <GuidedTour onClose={handleCloseTour} />}
    </div>
  );
}

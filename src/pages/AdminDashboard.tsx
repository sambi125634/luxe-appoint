import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSidebar, TabType } from "@/components/admin/AdminSidebar";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { ScheduleManagement } from "@/components/admin/ScheduleManagement";
import { ClientsManagement } from "@/components/admin/ClientsManagement";
import { ServicesManagement } from "@/components/admin/ServicesManagement";
import { StaffManagement } from "@/components/admin/StaffManagement";
import { TimeOffManagement } from "@/components/admin/TimeOffManagement";
import { StatsModule } from "@/components/admin/StatsModule";
import { ConversationsModule } from "@/components/admin/conversations/ConversationsModule";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Dashboard";
      case "calendar": return "Kalendarz";
      case "clients": return "Klienci";
      case "conversations": return "Konwersacje";
      case "staff": return "Personel";
      case "services": return "Usługi";
      case "time-off": return "Urlopy i dni wolne";
      case "stats": return "Statystyki";
      case "settings": return "Ustawienia";
      default: return "Dashboard";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome />;
      case "calendar":
        return <ScheduleManagement />;
      case "clients":
        return <ClientsManagement />;
      case "conversations":
        return <ConversationsModule />;
      case "services":
        return <ServicesManagement />;
      case "staff":
        return <StaffManagement />;
      case "time-off":
        return <TimeOffManagement />;
      case "stats":
        return <StatsModule />;
      case "settings":
        return (
          <div className="glass-card p-6 text-center text-muted-foreground">
            <p className="font-serif text-lg mb-2">Ustawienia</p>
            <p className="text-sm">Moduł ustawień w przygotowaniu...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
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
            <Link to="/book/demo-salon">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <ChevronRight className="w-4 h-4" />
                Zobacz widget
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SuperAdminSidebar, SuperAdminTabType } from "@/components/super-admin/SuperAdminSidebar";
import { LeadsManagement } from "@/components/super-admin/LeadsManagement";
import { SalonsManagement } from "@/components/super-admin/SalonsManagement";
import { UsersManagement } from "@/components/super-admin/UsersManagement";
import { SuperAdminHome } from "@/components/super-admin/SuperAdminHome";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SuperAdminTabType>("home");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdminAccess();
  }, []);

  const checkSuperAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Musisz być zalogowany");
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .single();

      if (error || !roles) {
        toast.error("Brak uprawnień super administratora");
        navigate("/");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Error checking access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "home": return "Super Admin Panel";
      case "leads": return "Zarządzanie leadami";
      case "salons": return "Zarządzanie salonami";
      case "users": return "Zarządzanie użytkownikami";
      default: return "Super Admin Panel";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <SuperAdminHome />;
      case "leads":
        return <LeadsManagement />;
      case "salons":
        return <SalonsManagement />;
      case "users":
        return <UsersManagement />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

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
        <SuperAdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-destructive/5 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-destructive" />
              <div>
                <h1 className="font-serif text-xl font-semibold">{getPageTitle()}</h1>
                <p className="text-sm text-muted-foreground">
                  Panel zarządzania platformą
                </p>
              </div>
            </div>
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

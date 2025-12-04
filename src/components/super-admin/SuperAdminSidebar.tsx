import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, FileText, LogOut, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SuperAdminTabType = "home" | "leads" | "salons" | "users";

const navItems: { icon: typeof LayoutDashboard; label: string; tab: SuperAdminTabType }[] = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "home" },
  { icon: FileText, label: "Leady", tab: "leads" },
  { icon: Building2, label: "Salony", tab: "salons" },
  { icon: Users, label: "Użytkownicy", tab: "users" },
];

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTabType;
  onTabChange: (tab: SuperAdminTabType) => void;
  onClose?: () => void;
}

export function SuperAdminSidebar({ activeTab, onTabChange, onClose }: SuperAdminSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Wylogowano pomyślnie");
    navigate("/auth");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border bg-destructive/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-destructive to-destructive/70 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive-foreground" />
          </div>
          <div>
            <p className="font-serif font-semibold">Beauty Calendar</p>
            <p className="text-xs text-destructive font-medium">Super Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => {
                  onTabChange(item.tab);
                  onClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  activeTab === item.tab
                    ? "bg-destructive text-destructive-foreground shadow-soft" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Wyloguj się
        </Button>
      </div>
    </div>
  );
}

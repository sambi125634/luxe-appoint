import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Calendar, Users, Scissors, Settings, BarChart3, 
  LogOut, Sparkles, LayoutDashboard, UserCircle, MessageSquare, Route, Calculator, Code, Package, HelpCircle, Radar, ScanLine, Zap, ClipboardList, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStaffPermissions, type StaffPermissions } from "@/hooks/useStaffPermissions";

type TabType = "home" | "calendar" | "widgets" | "clients" | "conversations" | "pipeline" | "accounting" | "products" | "staff" | "services" | "settings" | "support" | "retention" | "consultation" | "referral";

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onClose?: () => void;
  userRole?: string | null;
  salonName?: string | null;
  isDemo?: boolean;
}

// Permission-based tab visibility mapping
const TAB_PERMISSION_MAP: Partial<Record<TabType, keyof StaffPermissions>> = {
  accounting: "can_view_finances",
  pipeline: "can_view_finances",
  settings: "can_manage_staff",
  staff: "can_manage_staff",
  widgets: "can_manage_marketing",
  retention: "can_manage_marketing",
  referral: "can_manage_marketing",
  products: "can_manage_products",
  services: "can_edit_services",
};

export function AdminSidebar({ activeTab, onTabChange, onClose, userRole, salonName, isDemo }: AdminSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  type NavItem = { icon: typeof Calendar; labelKey: string; tab: TabType; badge?: number };
  const allSections: { titleKey: string; items: NavItem[] }[] = [
    {
      titleKey: "sidebar.dailyWork",
      items: [
        { icon: LayoutDashboard, labelKey: "admin.dashboard", tab: "home" },
        { icon: Calendar, labelKey: "admin.calendar", tab: "calendar" },
        { icon: Users, labelKey: "admin.staff", tab: "staff" },
      ],
    },
    {
      titleKey: "sidebar.offer",
      items: [
        { icon: Scissors, labelKey: "admin.services", tab: "services" },
        { icon: Package, labelKey: "admin.products", tab: "products" },
      ],
    },
    {
      titleKey: "sidebar.clients",
      items: [
        { icon: UserCircle, labelKey: "admin.clients", tab: "clients" },
        { icon: MessageSquare, labelKey: "admin.conversations", tab: "conversations" },
        { icon: ClipboardList, labelKey: "admin.consultation", tab: "consultation" },
        { icon: Route, labelKey: "admin.clientJourney", tab: "pipeline" },
      ],
    },
    {
      titleKey: "sidebar.marketing",
      items: [
        { icon: Radar, labelKey: "admin.retention", tab: "retention" },
        { icon: Heart, labelKey: "admin.referral", tab: "referral" },
        
        { icon: Code, labelKey: "admin.widgets", tab: "widgets" },
      ],
    },
    {
      titleKey: "sidebar.finance",
      items: [
        { icon: Calculator, labelKey: "admin.reports", tab: "accounting" },
      ],
    },
    {
      titleKey: "sidebar.system",
      items: [
        { icon: Settings, labelKey: "admin.settings", tab: "settings" },
        { icon: HelpCircle, labelKey: "admin.support", tab: "support" },
      ],
    },
  ];

  const { permissions, isOwner } = useStaffPermissions();

  const visibleSections = isDemo
    ? allSections
    : allSections
        .map(section => ({
          ...section,
          items: isOwner
            ? section.items
            : section.items.filter(item => {
                const requiredPerm = TAB_PERMISSION_MAP[item.tab];
                if (!requiredPerm) return true;
                return permissions[requiredPerm];
              }),
        }))
        .filter(section => section.items.length > 0);

  const displayName = salonName || "Beauty Calendar";
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t("sidebar.logoutSuccess"));
    navigate("/auth");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-serif font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {userRole === "staff" ? t("sidebar.employee") : userRole === "salon_owner" ? t("sidebar.owner") : t("admin.profile")}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {visibleSections.map((section) => (
          <div key={section.titleKey}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-1">
              {t(section.titleKey)}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.tab}>
                  <button
                    onClick={() => {
                      onTabChange(item.tab);
                      onClose?.();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      activeTab === item.tab
                        ? "bg-primary text-primary-foreground shadow-soft" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{t(item.labelKey)}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={cn(
                        "w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center",
                        activeTab === item.tab 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 pb-2">
        <LanguageSwitcher className="w-full justify-center" />
      </div>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-serif text-primary-foreground text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === "staff" ? t("sidebar.employee") : t("sidebar.administrator")}
            </p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          {t("admin.logout")}
        </Button>
      </div>
    </div>
  );
}

export type { TabType };

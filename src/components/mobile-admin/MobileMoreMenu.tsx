import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Scissors, Users, CalendarOff, Calculator, Code,
  Package, MessageSquare, Workflow, Settings, HelpCircle, LogOut,
  Sparkles, ChevronRight, User, Radar, Heart, Zap, TrendingUp, ClipboardList
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  icon: typeof Scissors;
  labelKey: string;
  descriptionKey: string;
  tab: string;
  color: string;
  ownerOnly?: boolean;
}

const menuSections: { titleKey: string; items: MenuItem[] }[] = [
  {
    titleKey: "sidebar.clients",
    items: [
      { icon: MessageSquare, labelKey: "mobileMenu.conversations", descriptionKey: "mobileMenu.conversationsDesc", tab: "conversations", color: "bg-teal-500/10 text-teal-600" },
      { icon: ClipboardList, labelKey: "mobileMenu.consultation", descriptionKey: "mobileMenu.consultationDesc", tab: "consultation", color: "bg-rose-500/10 text-rose-600" },
    ],
  },
  {
    titleKey: "sidebar.marketingGrowth",
    items: [
      { icon: Radar, labelKey: "mobileMenu.retention", descriptionKey: "mobileMenu.retentionDesc", tab: "retention", color: "bg-red-500/10 text-red-600" },
      { icon: Heart, labelKey: "mobileMenu.referral", descriptionKey: "mobileMenu.referralDesc", tab: "referral", color: "bg-pink-500/10 text-pink-600" },
      { icon: Workflow, labelKey: "mobileMenu.pipeline", descriptionKey: "mobileMenu.pipelineDesc", tab: "pipeline", color: "bg-purple-500/10 text-purple-600", ownerOnly: true },
      { icon: Zap, labelKey: "mobileMenu.pixel", descriptionKey: "mobileMenu.pixelDesc", tab: "pixel", color: "bg-blue-500/10 text-blue-600" },
      { icon: Code, labelKey: "mobileMenu.widgets", descriptionKey: "mobileMenu.widgetsDesc", tab: "widgets", color: "bg-indigo-500/10 text-indigo-600", ownerOnly: true },
    ],
  },
  {
    titleKey: "sidebar.management",
    items: [
      { icon: Scissors, labelKey: "mobileMenu.services", descriptionKey: "mobileMenu.servicesDesc", tab: "services", color: "bg-pink-500/10 text-pink-600" },
      { icon: Users, labelKey: "mobileMenu.staff", descriptionKey: "mobileMenu.staffDesc", tab: "staff", color: "bg-blue-500/10 text-blue-600" },
      { icon: CalendarOff, labelKey: "mobileMenu.timeOff", descriptionKey: "mobileMenu.timeOffDesc", tab: "time-off", color: "bg-orange-500/10 text-orange-600" },
      { icon: Package, labelKey: "mobileMenu.products", descriptionKey: "mobileMenu.productsDesc", tab: "products", color: "bg-emerald-500/10 text-emerald-600" },
    ],
  },
  {
    titleKey: "sidebar.finance",
    items: [
      { icon: Calculator, labelKey: "mobileMenu.accounting", descriptionKey: "mobileMenu.accountingDesc", tab: "accounting", color: "bg-amber-500/10 text-amber-600", ownerOnly: true },
      { icon: TrendingUp, labelKey: "mobileMenu.analytics", descriptionKey: "mobileMenu.analyticsDesc", tab: "analytics", color: "bg-cyan-500/10 text-cyan-600" },
    ],
  },
  {
    titleKey: "sidebar.system",
    items: [
      { icon: Settings, labelKey: "mobileMenu.settings", descriptionKey: "mobileMenu.settingsDesc", tab: "settings", color: "bg-gray-500/10 text-gray-600", ownerOnly: true },
      { icon: HelpCircle, labelKey: "mobileMenu.support", descriptionKey: "mobileMenu.supportDesc", tab: "support", color: "bg-violet-500/10 text-violet-600" },
    ],
  },
];

export function MobileMoreMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role, salonName } = useUserRole();
  const isStaff = role === "staff";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t("sidebar.logoutSuccess"));
    navigate("/auth");
  };

  const handleTap = (tab: string) => {
    navigate(`/m/module/${tab}`);
  };

  return (
    <div className="pb-20 max-w-lg mx-auto px-4 pt-2">
      {/* Profile card */}
      <Card className="mb-5 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif font-bold text-lg truncate">{salonName || t("mobileMenu.mySalon")}</p>
            <p className="text-sm text-muted-foreground">
              {isStaff ? t("mobileMenu.employee") : t("mobileMenu.owner")}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Menu sections */}
      {menuSections.map((section) => {
        const visibleItems = section.items.filter(item => !item.ownerOnly || !isStaff);
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.titleKey} className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {t(section.titleKey)}
            </p>
            <div className="space-y-1.5">
              {visibleItems.map((item) => (
                <Card
                  key={item.tab}
                  className="active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => handleTap(item.tab)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{t(item.labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(item.descriptionKey)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Switch to desktop */}
      <Card className="mb-3 border-primary/20 bg-primary/5">
        <CardContent className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">{t("mobileMenu.desktopPanel")}</p>
            <p className="text-xs text-muted-foreground">{t("mobileMenu.desktopPanelDesc")}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary" />
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-destructive hover:text-destructive h-12"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        {t("mobileMenu.logout")}
      </Button>
    </div>
  );
}

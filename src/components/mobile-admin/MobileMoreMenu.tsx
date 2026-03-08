import { useNavigate } from "react-router-dom";
import {
  Scissors, Users, CalendarOff, BarChart3, Calculator, Code,
  Package, MessageSquare, Workflow, Settings, HelpCircle, LogOut,
  Sparkles, ChevronRight, User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  icon: typeof Scissors;
  label: string;
  description: string;
  tab: string;
  color: string;
  ownerOnly?: boolean;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Zarządzanie",
    items: [
      { icon: Scissors, label: "Usługi", description: "Kategorie i cennik", tab: "services", color: "bg-pink-500/10 text-pink-600" },
      { icon: Users, label: "Personel", description: "Pracownicy i grafiki", tab: "staff", color: "bg-blue-500/10 text-blue-600" },
      { icon: CalendarOff, label: "Urlopy", description: "Dni wolne zespołu", tab: "time-off", color: "bg-orange-500/10 text-orange-600" },
      { icon: Package, label: "Produkty", description: "Katalog i magazyn", tab: "products", color: "bg-emerald-500/10 text-emerald-600" },
    ],
  },
  {
    title: "Sprzedaż",
    items: [
      { icon: Workflow, label: "Pipeline", description: "Lejek sprzedażowy", tab: "pipeline", color: "bg-purple-500/10 text-purple-600", ownerOnly: true },
      { icon: MessageSquare, label: "Konwersacje", description: "Wiadomości", tab: "conversations", color: "bg-teal-500/10 text-teal-600" },
      { icon: Code, label: "Widgety", description: "Osadzanie rezerwacji", tab: "widgets", color: "bg-indigo-500/10 text-indigo-600", ownerOnly: true },
    ],
  },
  {
    title: "Raporty",
    items: [
      { icon: Calculator, label: "Księgowość", description: "Raporty finansowe", tab: "accounting", color: "bg-amber-500/10 text-amber-600", ownerOnly: true },
      { icon: BarChart3, label: "Statystyki", description: "Analityka biznesowa", tab: "stats", color: "bg-cyan-500/10 text-cyan-600", ownerOnly: true },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Settings, label: "Ustawienia", description: "Konfiguracja salonu", tab: "settings", color: "bg-gray-500/10 text-gray-600", ownerOnly: true },
      { icon: HelpCircle, label: "Pomoc", description: "AI Asystent", tab: "support", color: "bg-violet-500/10 text-violet-600" },
    ],
  },
];

export function MobileMoreMenu() {
  const navigate = useNavigate();
  const { role, salonName } = useUserRole();
  const isStaff = role === "staff";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Wylogowano pomyślnie");
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
            <p className="font-serif font-bold text-lg truncate">{salonName || "Mój salon"}</p>
            <p className="text-sm text-muted-foreground">
              {isStaff ? "Pracownik" : "Właścicielka"}
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
          <div key={section.title} className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
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
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
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
            <p className="text-sm font-semibold text-primary">Panel desktopowy</p>
            <p className="text-xs text-muted-foreground">Pełna wersja CRM</p>
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
        Wyloguj się
      </Button>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, CalendarCheck, Gift, Bell, Palette, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_BRANDING, DEMO_LOYALTY_REWARDS } from "../demo/demoData";

interface ConfigOverviewSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
  onNavigate?: (tab: string, settingsTab?: string) => void;
}

export function ConfigOverviewSection({ isDemo, salonId, onNavigate }: ConfigOverviewSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["client-app-config-overview", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const [salonRes, galleryRes, rewardsRes, autopilotRes] = await Promise.all([
        supabase
          .from("salons")
          .select("name, description, theme_primary_color, logo_url, welcome_message, allow_reschedule, allow_cancellation, allow_waitlist, allow_staff_selection, show_prices, payment_required, deposit_percent, advance_booking_days, cancellation_notice_hours")
          .eq("id", salonId)
          .maybeSingle(),
        supabase.from("salon_gallery").select("id", { count: "exact", head: true }).eq("salon_id", salonId),
        supabase.from("loyalty_rewards").select("id", { count: "exact", head: true }).eq("salon_id", salonId).eq("is_active", true),
        supabase.from("autopilot_config").select("vip_tomorrow_enabled, loyalty_engine_enabled, first_visit_sequence_enabled").eq("salon_id", salonId).maybeSingle(),
      ]);
      return {
        salon: salonRes.data,
        galleryCount: galleryRes.count ?? 0,
        rewardsCount: rewardsRes.count ?? 0,
        autopilot: autopilotRes.data,
      };
    },
    enabled: !!salonId && !isDemo,
  });

  const salon = isDemo
    ? {
        name: DEMO_BRANDING.salon_name,
        description: DEMO_BRANDING.description,
        theme_primary_color: DEMO_BRANDING.primary_color,
        logo_url: null,
        welcome_message: "Witaj! Cieszymy się, że dołączyłaś do naszego salonu 🌸",
        allow_reschedule: true,
        allow_cancellation: true,
        allow_waitlist: true,
        allow_staff_selection: true,
        show_prices: true,
        payment_required: false,
        deposit_percent: 0,
        advance_booking_days: 60,
        cancellation_notice_hours: 24,
      }
    : data?.salon;
  const galleryCount = isDemo ? 18 : data?.galleryCount ?? 0;
  const rewardsCount = isDemo ? DEMO_LOYALTY_REWARDS.filter((r) => r.is_active).length : data?.rewardsCount ?? 0;
  const autopilot = isDemo
    ? { vip_tomorrow_enabled: true, loyalty_engine_enabled: true, first_visit_sequence_enabled: true }
    : data?.autopilot;

  if (!isDemo && isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  const go = (tab: string, sub?: string) => {
    if (isDemo || !onNavigate) return;
    onNavigate(tab, sub);
  };

  const linkBtn = (label: string, tab: string, sub?: string) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => go(tab, sub)}
      disabled={isDemo}
      className="text-primary hover:text-primary hover:bg-primary/10 -mr-2 gap-1"
    >
      {isDemo ? <Lock className="w-3 h-3" /> : null}
      {label}
      <ArrowUpRight className="w-3.5 h-3.5" />
    </Button>
  );

  const checkmark = (on: boolean | undefined) =>
    on ? <span className="text-[#10B981]">✓</span> : <span className="text-muted-foreground">—</span>;

  return (
    <div className="space-y-4">
      <div className="px-1">
        <p className="text-sm text-muted-foreground">
          To są ustawienia z innych modułów, których aplikacja używa automatycznie. Edycja w jednym miejscu — działa wszędzie.
        </p>
      </div>

      {/* Profil salonu */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="w-4 h-4" />
              Profil salonu
            </CardTitle>
            <CardDescription>Nazwa, opis, logo, kolor przewodni i galeria</CardDescription>
          </div>
          {linkBtn("Edytuj w Ustawieniach", "settings", "profile")}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Nazwa:</span> <strong>{salon?.name ?? "—"}</strong></div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Kolor:</span>
            <span
              className="inline-block w-4 h-4 rounded-full border"
              style={{ backgroundColor: salon?.theme_primary_color ?? "#D4537E" }}
            />
            <code className="text-xs">{salon?.theme_primary_color ?? "—"}</code>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Opis:</span>{" "}
            <span className="line-clamp-2">{salon?.description || <em className="text-muted-foreground">brak</em>}</span>
          </div>
          <div><span className="text-muted-foreground">Logo:</span> {checkmark(!!salon?.logo_url)}</div>
          <div><span className="text-muted-foreground">Zdjęć w galerii:</span> <strong>{galleryCount}</strong></div>
        </CardContent>
      </Card>

      {/* Rezerwacje */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="w-4 h-4" />
              Zasady rezerwacji
            </CardTitle>
            <CardDescription>Co klientka może zrobić w aplikacji</CardDescription>
          </div>
          {linkBtn("Edytuj w Ustawieniach", "settings", "booking")}
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>{checkmark(salon?.allow_reschedule)} <span className="text-muted-foreground">Przekładanie wizyt</span></div>
          <div>{checkmark(salon?.allow_cancellation)} <span className="text-muted-foreground">Anulacja</span></div>
          <div>{checkmark(salon?.allow_waitlist)} <span className="text-muted-foreground">Lista oczekujących</span></div>
          <div>{checkmark(salon?.allow_staff_selection)} <span className="text-muted-foreground">Wybór specjalistki</span></div>
          <div>{checkmark(salon?.show_prices)} <span className="text-muted-foreground">Pokazywanie cen</span></div>
          <div>
            {checkmark(salon?.payment_required)}{" "}
            <span className="text-muted-foreground">
              Zaliczka {salon?.payment_required ? `(${salon?.deposit_percent ?? 0}%)` : ""}
            </span>
          </div>
          <div className="col-span-2 text-xs text-muted-foreground pt-1">
            Anulacja do {salon?.cancellation_notice_hours ?? 24} h przed wizytą · rezerwacja max {salon?.advance_booking_days ?? 60} dni do przodu
          </div>
        </CardContent>
      </Card>

      {/* Lojalność */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="w-4 h-4" />
              Program lojalnościowy
            </CardTitle>
            <CardDescription>Nagrody do wymiany za punkty w aplikacji</CardDescription>
          </div>
          {linkBtn("Zarządzaj", "referral")}
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">Aktywnych nagród:</span>{" "}
            <strong>{rewardsCount}</strong>
          </div>
          <p className="text-xs text-muted-foreground">1 pkt = 0,10 PLN · klientka zbiera punkty automatycznie po każdej zakończonej wizycie.</p>
        </CardContent>
      </Card>

      {/* Powiadomienia automatyczne */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" />
              Automatyczne wiadomości
            </CardTitle>
            <CardDescription>Welcome, urodziny, przypomnienia — zarządzane przez Autopilota</CardDescription>
          </div>
          {linkBtn("Otwórz Autopilota", "autopilot")}
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            {checkmark(!!salon?.welcome_message)}
            <div className="flex-1">
              <span className="text-muted-foreground">Wiadomość powitalna w aplikacji:</span>{" "}
              {salon?.welcome_message ? (
                <Badge variant="secondary" className="ml-1">{salon.welcome_message.length} znaków</Badge>
              ) : (
                <em className="text-muted-foreground">brak</em>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {checkmark(autopilot?.first_visit_sequence_enabled)}
            <span className="text-muted-foreground">Seria po pierwszej wizycie</span>
          </div>
          <div className="flex items-center gap-2">
            {checkmark(autopilot?.loyalty_engine_enabled)}
            <span className="text-muted-foreground">Silnik lojalnościowy (urodziny, kamienie milowe)</span>
          </div>
          <div className="flex items-center gap-2">
            {checkmark(autopilot?.vip_tomorrow_enabled)}
            <span className="text-muted-foreground">Przypomnienia VIP na jutro</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
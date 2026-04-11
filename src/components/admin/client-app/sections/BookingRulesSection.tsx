import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BookingRulesSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

export function BookingRulesSection({ isDemo, salonId }: BookingRulesSectionProps) {
  const queryClient = useQueryClient();

  const { data: salon } = useQuery({
    queryKey: ["salon-booking-rules", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase.from("salons").select(
        "allow_reschedule, allow_cancellation, allow_waitlist, allow_staff_selection, show_prices, show_staff_names, reschedule_notice_hours, cancellation_notice_hours, advance_booking_days, min_booking_notice_hours, buffer_minutes, payment_required, deposit_percent"
      ).eq("id", salonId).single();
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const defaults = {
    allow_reschedule: true,
    allow_cancellation: true,
    allow_waitlist: true,
    allow_staff_selection: true,
    show_prices: true,
    show_staff_names: true,
    reschedule_notice_hours: 24,
    cancellation_notice_hours: 24,
    advance_booking_days: 60,
    min_booking_notice_hours: 2,
    buffer_minutes: 15,
    payment_required: false,
    deposit_percent: 0,
  };

  const [config, setConfig] = useState(defaults);

  useEffect(() => {
    if (salon) {
      setConfig({ ...defaults, ...salon });
    }
  }, [salon]);

  const update = (key: string, value: boolean | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!salonId) return;
      await supabase.from("salons").update(config).eq("id", salonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-booking-rules"] });
      toast.success("Ustawienia zapisane ✓");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="w-5 h-5" />
          Zasady rezerwacji w aplikacji
        </CardTitle>
        <CardDescription>Kontroluj co klientki mogą robić w aplikacji</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client permissions */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Uprawnienia klientek</Label>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Zmiana terminu wizyty</p>
                <p className="text-xs text-muted-foreground">Min. {config.reschedule_notice_hours}h przed</p>
              </div>
              <Switch checked={config.allow_reschedule} onCheckedChange={(v) => update("allow_reschedule", v)} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Anulowanie wizyty</p>
                <p className="text-xs text-muted-foreground">Min. {config.cancellation_notice_hours}h przed</p>
              </div>
              <Switch checked={config.allow_cancellation} onCheckedChange={(v) => update("allow_cancellation", v)} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm">Waitlista (powiadomienia o terminach)</p>
              <Switch checked={config.allow_waitlist} onCheckedChange={(v) => update("allow_waitlist", v)} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm">Wybór specjalistki</p>
              <Switch checked={config.allow_staff_selection} onCheckedChange={(v) => update("allow_staff_selection", v)} />
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold">Płatności</Label>

            <div className="flex items-center justify-between">
              <p className="text-sm">Wymagaj płatności przy rezerwacji</p>
              <Switch checked={config.payment_required} onCheckedChange={(v) => update("payment_required", v)} />
            </div>

            {config.payment_required && (
              <div className="space-y-2">
                <Label className="text-xs">Depozyt (%)</Label>
                <Input
                  type="number"
                  value={config.deposit_percent}
                  onChange={(e) => update("deposit_percent", Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-20 text-center"
                />
                <p className="text-xs text-muted-foreground">0 = pełna płatność, &gt;0 = depozyt</p>
              </div>
            )}
          </div>
        </div>

        {/* Display settings */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-sm font-semibold">Ustawienia wyświetlania</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Dni do przodu (rezerwacja)</Label>
              <Input type="number" value={config.advance_booking_days} onChange={(e) => update("advance_booking_days", Number(e.target.value))} min={7} max={180} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Min. godzin przed wizytą</Label>
              <Input type="number" value={config.min_booking_notice_hours} onChange={(e) => update("min_booking_notice_hours", Number(e.target.value))} min={0} max={48} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bufor między wizytami (min)</Label>
              <Input type="number" value={config.buffer_minutes} onChange={(e) => update("buffer_minutes", Number(e.target.value))} min={0} max={60} className="text-center" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm">Pokaż ceny usług</p>
              <Switch checked={config.show_prices} onCheckedChange={(v) => update("show_prices", v)} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm">Pokaż imię specjalistki</p>
              <Switch checked={config.show_staff_names} onCheckedChange={(v) => update("show_staff_names", v)} />
            </div>
          </div>
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
          {saveMutation.isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
        </Button>
      </CardContent>
    </Card>
  );
}

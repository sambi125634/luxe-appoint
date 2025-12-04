import { useState, useEffect } from "react";
import { Calendar, Clock, Ban, CreditCard, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingSettings } from "@/hooks/useSalonSettings";

interface BookingSettingsPanelProps {
  settings: BookingSettings;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<BookingSettings>) => Promise<boolean>;
}

export function BookingSettingsPanel({ settings, isLoading, isSaving, onSave }: BookingSettingsPanelProps) {
  const [formData, setFormData] = useState<BookingSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Window */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Okno rezerwacji
          </CardTitle>
          <CardDescription>
            Określ jak daleko w przyszłość klienci mogą rezerwować wizyty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="advanceDays">Maksymalne wyprzedzenie (dni)</Label>
              <Select
                value={formData.advanceBookingDays.toString()}
                onValueChange={(v) => setFormData({ ...formData, advanceBookingDays: parseInt(v) })}
              >
                <SelectTrigger id="advanceDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dni</SelectItem>
                  <SelectItem value="14">14 dni</SelectItem>
                  <SelectItem value="30">30 dni</SelectItem>
                  <SelectItem value="60">60 dni</SelectItem>
                  <SelectItem value="90">90 dni</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Klienci mogą rezerwować z wyprzedzeniem do {formData.advanceBookingDays} dni
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minAdvance">Minimalne wyprzedzenie (godziny)</Label>
              <Select
                value={formData.minAdvanceHours.toString()}
                onValueChange={(v) => setFormData({ ...formData, minAdvanceHours: parseInt(v) })}
              >
                <SelectTrigger id="minAdvance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Bez limitu</SelectItem>
                  <SelectItem value="1">1 godzina</SelectItem>
                  <SelectItem value="2">2 godziny</SelectItem>
                  <SelectItem value="4">4 godziny</SelectItem>
                  <SelectItem value="24">24 godziny</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Klient musi zarezerwować co najmniej {formData.minAdvanceHours}h przed wizytą
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Sloty czasowe
          </CardTitle>
          <CardDescription>
            Konfiguracja domyślnych godzin pracy i interwałów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workStart">Domyślna godzina otwarcia</Label>
              <Input
                id="workStart"
                type="time"
                value={formData.defaultWorkingHoursStart}
                onChange={(e) => setFormData({ ...formData, defaultWorkingHoursStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">Domyślna godzina zamknięcia</Label>
              <Input
                id="workEnd"
                type="time"
                value={formData.defaultWorkingHoursEnd}
                onChange={(e) => setFormData({ ...formData, defaultWorkingHoursEnd: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slotInterval">Interwał slotów (minuty)</Label>
              <Select
                value={formData.slotInterval.toString()}
                onValueChange={(v) => setFormData({ ...formData, slotInterval: parseInt(v) })}
              >
                <SelectTrigger id="slotInterval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minut</SelectItem>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer">Bufor między wizytami (minuty)</Label>
              <Select
                value={formData.bufferBetweenAppointments.toString()}
                onValueChange={(v) => setFormData({ ...formData, bufferBetweenAppointments: parseInt(v) })}
              >
                <SelectTrigger id="buffer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Bez bufora</SelectItem>
                  <SelectItem value="5">5 minut</SelectItem>
                  <SelectItem value="10">10 minut</SelectItem>
                  <SelectItem value="15">15 minut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-primary" />
            Polityka anulowania
          </CardTitle>
          <CardDescription>
            Zasady dotyczące anulowania i zmiany rezerwacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancelPolicy">Limit anulowania (godziny przed wizytą)</Label>
            <Select
              value={formData.cancellationPolicyHours.toString()}
              onValueChange={(v) => setFormData({ ...formData, cancellationPolicyHours: parseInt(v) })}
            >
              <SelectTrigger id="cancelPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Brak limitu (zawsze można anulować)</SelectItem>
                <SelectItem value="2">2 godziny przed</SelectItem>
                <SelectItem value="4">4 godziny przed</SelectItem>
                <SelectItem value="12">12 godzin przed</SelectItem>
                <SelectItem value="24">24 godziny przed</SelectItem>
                <SelectItem value="48">48 godzin przed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Klienci mogą anulować wizytę do {formData.cancellationPolicyHours} godzin przed terminem
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Dodatkowe opcje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatyczne potwierdzanie rezerwacji</Label>
              <p className="text-xs text-muted-foreground">
                Rezerwacje są automatycznie potwierdzane bez Twojej akceptacji
              </p>
            </div>
            <Switch
              checked={formData.autoConfirmBookings}
              onCheckedChange={(checked) => setFormData({ ...formData, autoConfirmBookings: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Wymagaj potwierdzenia telefonicznego</Label>
              <p className="text-xs text-muted-foreground">
                Klient musi potwierdzić wizytę telefonicznie
              </p>
            </div>
            <Switch
              checked={formData.requirePhoneConfirmation}
              onCheckedChange={(checked) => setFormData({ ...formData, requirePhoneConfirmation: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Płatności online</Label>
              <p className="text-xs text-muted-foreground">
                Umożliw klientom płatność przy rezerwacji (wkrótce)
              </p>
            </div>
            <Switch
              checked={formData.allowOnlinePayments}
              onCheckedChange={(checked) => setFormData({ ...formData, allowOnlinePayments: checked })}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
}

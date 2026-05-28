import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, Ban, CreditCard, Save, Loader2, AlertTriangle, Percent, Banknote, HelpCircle, Zap, UserCheck, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookingSettings, PrepaymentSettings } from "@/hooks/useSalonSettings";

interface BookingSettingsPanelProps {
  settings: BookingSettings;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<BookingSettings>) => Promise<boolean>;
}

const defaultPrepayment: PrepaymentSettings = {
  enabled: false,
  type: 'fixed',
  amount: 50,
  requireForHighRisk: true,
  requireForNewClients: false,
};

type ConfirmationMode = "auto" | "manual" | "hybrid";

const InfoHint = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center justify-center text-muted-foreground/60 hover:text-primary transition-colors"
        aria-label="Wyjaśnienie"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
      {text}
    </TooltipContent>
  </Tooltip>
);

export function BookingSettingsPanel({ settings, isLoading, isSaving, onSave }: BookingSettingsPanelProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BookingSettings>({
    ...settings,
    prepayment: settings.prepayment || defaultPrepayment,
  });

  useEffect(() => {
    setFormData({
      ...settings,
      prepayment: settings.prepayment || defaultPrepayment,
    });
  }, [settings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const updatePrepayment = (updates: Partial<PrepaymentSettings>) => {
    setFormData({
      ...formData,
      prepayment: { ...formData.prepayment, ...updates },
    });
  };

  const confirmationMode: ConfirmationMode = formData.autoConfirmReturningOnly
    ? "hybrid"
    : formData.autoConfirmBookings
      ? "auto"
      : "manual";

  const setConfirmationMode = (mode: ConfirmationMode) => {
    setFormData({
      ...formData,
      autoConfirmBookings: mode !== "manual",
      autoConfirmReturningOnly: mode === "hybrid",
    });
  };

  const advanceLabel = (days: number) =>
    days === 0
      ? "Klientki mogą rezerwować bez limitu czasowego."
      : `Klientki mogą rezerwować do ${days} dni naprzód.`;

  const minAdvanceLabel = (hours: number) => {
    if (hours === 0) return "Rezerwacja możliwa nawet na ostatnią chwilę.";
    if (hours < 1) return `Klientka musi zarezerwować min. ${Math.round(hours * 60)} minut przed wizytą.`;
    if (hours === 1) return "Klientka musi zarezerwować min. 1 godzinę przed wizytą.";
    return `Klientka musi zarezerwować min. ${hours} godzin przed wizytą.`;
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
            {t("settingsModule.bookingWindow")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.bookingWindowDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="advanceDays" className="flex items-center gap-1.5">
                {t("settingsModule.maxAdvanceDays")}
                <InfoHint text="Jak daleko w przyszłość klientka może zarezerwować wizytę. Większa wartość = większa swoboda, ale też więcej rezerwacji na 'kiedyś', które łatwiej anulować. Dla salonów premium z wcześniejszym planowaniem polecamy 90-180 dni." />
              </Label>
              <Select
                value={formData.advanceBookingDays.toString()}
                onValueChange={(v) => setFormData({ ...formData, advanceBookingDays: parseInt(v) })}
              >
                <SelectTrigger id="advanceDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 {t("settingsModule.days")}</SelectItem>
                  <SelectItem value="14">14 {t("settingsModule.days")}</SelectItem>
                  <SelectItem value="30">30 {t("settingsModule.days")}</SelectItem>
                  <SelectItem value="60">60 {t("settingsModule.days")}</SelectItem>
                  <SelectItem value="90">90 {t("settingsModule.days")}</SelectItem>
                  <SelectItem value="180">180 dni (6 miesięcy)</SelectItem>
                  <SelectItem value="365">365 dni (1 rok)</SelectItem>
                  <SelectItem value="0">Bez limitu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{advanceLabel(formData.advanceBookingDays)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minAdvance" className="flex items-center gap-1.5">
                {t("settingsModule.minAdvanceHours")}
                <InfoHint text="Ile minimum musi minąć między rezerwacją a wizytą. 'Bez limitu' pozwala na rezerwację last-minute (nawet za 5 minut). 15-30 minut to dobry balans — zostawia czas na przygotowanie stanowiska." />
              </Label>
              <Select
                value={formData.minAdvanceHours.toString()}
                onValueChange={(v) => setFormData({ ...formData, minAdvanceHours: parseFloat(v) })}
              >
                <SelectTrigger id="minAdvance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("settingsModule.noLimit")}</SelectItem>
                  <SelectItem value="0.25">15 minut</SelectItem>
                  <SelectItem value="0.5">30 minut</SelectItem>
                  <SelectItem value="0.75">45 minut</SelectItem>
                  <SelectItem value="1">1 godzina</SelectItem>
                  <SelectItem value="2">2 godziny</SelectItem>
                  <SelectItem value="4">4 godziny</SelectItem>
                  <SelectItem value="12">12 godzin</SelectItem>
                  <SelectItem value="24">24 godziny</SelectItem>
                  <SelectItem value="48">48 godzin (2 dni)</SelectItem>
                  <SelectItem value="72">72 godziny (3 dni)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{minAdvanceLabel(formData.minAdvanceHours)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t("settingsModule.timeSlots")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.timeSlotsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="workStart">{t("settingsModule.defaultOpenTime")}</Label>
              <Input
                id="workStart"
                type="time"
                value={formData.defaultWorkingHoursStart}
                onChange={(e) => setFormData({ ...formData, defaultWorkingHoursStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnd">{t("settingsModule.defaultCloseTime")}</Label>
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
              <Label htmlFor="slotInterval" className="flex items-center gap-1.5">
                {t("settingsModule.slotInterval")}
                <InfoHint text="Co ile minut pojawia się nowy slot do rezerwacji. Np. interwał 15 min = klientka widzi godziny 10:00, 10:15, 10:30… Mniejszy interwał = więcej możliwości wyboru, ale też więcej drobnych okienek w grafiku." />
              </Label>
              <Select
                value={formData.slotInterval.toString()}
                onValueChange={(v) => setFormData({ ...formData, slotInterval: parseInt(v) })}
              >
                <SelectTrigger id="slotInterval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 {t("settingsModule.minutes")}</SelectItem>
                  <SelectItem value="30">30 {t("settingsModule.minutes")}</SelectItem>
                  <SelectItem value="60">60 {t("settingsModule.minutes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buffer" className="flex items-center gap-1.5">
                {t("settingsModule.bufferBetween")}
                <InfoHint text="Dodatkowy czas automatycznie blokowany po każdej wizycie — na sprzątanie stanowiska, dezynfekcję, krótką przerwę. Bufor nie jest widoczny dla klientki, ale chroni Cię przed nakładającymi się wizytami." />
              </Label>
              <Select
                value={formData.bufferBetweenAppointments.toString()}
                onValueChange={(v) => setFormData({ ...formData, bufferBetweenAppointments: parseInt(v) })}
              >
                <SelectTrigger id="buffer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("settingsModule.noBuffer")}</SelectItem>
                  <SelectItem value="5">5 {t("settingsModule.minutes")}</SelectItem>
                  <SelectItem value="10">10 {t("settingsModule.minutes")}</SelectItem>
                  <SelectItem value="15">15 {t("settingsModule.minutes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prepayment */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t("settingsModule.prepayments")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.prepaymentsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settingsModule.enablePrepayments")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settingsModule.prepaymentsRequired")}
              </p>
            </div>
            <Switch
              checked={formData.prepayment?.enabled || false}
              onCheckedChange={(checked) => updatePrepayment({ enabled: checked })}
            />
          </div>

          {formData.prepayment?.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>{t("settingsModule.prepaymentType")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={formData.prepayment.type === 'fixed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePrepayment({ type: 'fixed' })}
                    className="flex items-center gap-1"
                  >
                    <Banknote className="w-4 h-4" />
                    {t("settingsModule.fixedAmount")}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.prepayment.type === 'percentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePrepayment({ type: 'percentage' })}
                    className="flex items-center gap-1"
                  >
                    <Percent className="w-4 h-4" />
                    {t("settingsModule.percentage")}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.prepayment.type === 'full' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePrepayment({ type: 'full' })}
                    className="flex items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    {t("settingsModule.fullPrice")}
                  </Button>
                </div>
              </div>

              {formData.prepayment.type !== 'full' && (
                <div className="space-y-2">
                  <Label htmlFor="prepaymentAmount">
                    {formData.prepayment.type === 'fixed' ? t("settingsModule.fixedAmountLabel") : t("settingsModule.percentageLabel")}
                  </Label>
                  <Input
                    id="prepaymentAmount"
                    type="number"
                    min="1"
                    max={formData.prepayment.type === 'percentage' ? 100 : undefined}
                    value={formData.prepayment.amount}
                    onChange={(e) => updatePrepayment({ amount: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.prepayment.type === 'fixed'
                      ? t("settingsModule.fixedAmountDesc", { amount: formData.prepayment.amount })
                      : t("settingsModule.percentageDesc", { amount: formData.prepayment.amount })}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        {t("settingsModule.requireHighRisk")}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("settingsModule.requireHighRiskDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={formData.prepayment.requireForHighRisk}
                      onCheckedChange={(checked) => updatePrepayment({ requireForHighRisk: checked })}
                    />
                  </div>
                  {formData.prepayment.requireForHighRisk && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Kiedy klient jest uznawany za high-risk?
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 ml-1">
                        <li>2 lub więcej nieobecności (no-show) w historii</li>
                        <li>Częste anulacje w ostatniej chwili (&gt;20% wizyt)</li>
                        <li>Brak wizyty od ponad 180 dni</li>
                      </ul>
                      <p className="pt-1 text-[11px]">
                        AI oblicza wskaźnik ryzyka (0-100 pkt) po każdej wizycie. Klient z wynikiem <strong>powyżej 60 pkt</strong> jest automatycznie oznaczany jako high-risk i wymagana jest od niego zaliczka.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("settingsModule.requireNewClients")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("settingsModule.requireNewClientsDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={formData.prepayment.requireForNewClients}
                    onCheckedChange={(checked) => updatePrepayment({ requireForNewClients: checked })}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <p className="font-medium mb-1 text-primary">{t("settingsModule.howPrepaymentsWork")}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                  <li>{t("settingsModule.prepaymentInfo1")}</li>
                  <li>{t("settingsModule.prepaymentInfo2")}</li>
                  <li>{t("settingsModule.prepaymentInfo3")}</li>
                  <li>{t("settingsModule.prepaymentInfo4")}</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-primary" />
            {t("settingsModule.cancellationPolicy")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.cancellationPolicyDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cancelPolicy" className="flex items-center gap-1.5">
              {t("settingsModule.cancellationLimit")}
              <InfoHint text="Do ilu godzin przed wizytą klientka może bezpłatnie anulować rezerwację. Po tym czasie anulacja wymaga kontaktu z salonem (i może oznaczać utratę zaliczki, jeśli była pobrana)." />
            </Label>
            <Select
              value={formData.cancellationPolicyHours.toString()}
              onValueChange={(v) => setFormData({ ...formData, cancellationPolicyHours: parseInt(v) })}
            >
              <SelectTrigger id="cancelPolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("settingsModule.noLimitCancel")}</SelectItem>
                <SelectItem value="2">2 {t("settingsModule.hoursBefore")}</SelectItem>
                <SelectItem value="4">4 {t("settingsModule.hoursBefore")}</SelectItem>
                <SelectItem value="12">12 {t("settingsModule.hoursBefore12")}</SelectItem>
                <SelectItem value="24">24 {t("settingsModule.hoursBefore")}</SelectItem>
                <SelectItem value="48">48 {t("settingsModule.hoursBefore12")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settingsModule.clientsCanCancel", { hours: formData.cancellationPolicyHours })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t("settingsModule.additionalOptions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settingsModule.autoConfirmBookings")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settingsModule.autoConfirmDesc")}
              </p>
            </div>
            <Switch
              checked={formData.autoConfirmBookings}
              onCheckedChange={(checked) => setFormData({ ...formData, autoConfirmBookings: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settingsModule.requirePhoneConfirm")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settingsModule.requirePhoneConfirmDesc")}
              </p>
            </div>
            <Switch
              checked={formData.requirePhoneConfirmation}
              onCheckedChange={(checked) => setFormData({ ...formData, requirePhoneConfirmation: checked })}
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
          {isSaving ? t("settingsModule.saving") : t("settingsModule.saveChanges")}
        </Button>
      </div>
    </div>
  );
}

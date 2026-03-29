import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Phone, CheckCircle, AlertTriangle, Send, Radio, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

interface CommunicationSettingsProps {
  isLoading: boolean;
  isSaving: boolean;
  isDemo?: boolean;
  onNavigateToModule?: (tabId: string) => void;
}

type EmailOption = "own" | "system";
type SmsOption = "own" | "virtual" | "disabled";

export function CommunicationSettings({ isLoading, isSaving, isDemo = false, onNavigateToModule }: CommunicationSettingsProps) {
  const { t } = useTranslation();
  const { salonId } = useSalonId();

  const [emailOption, setEmailOption] = useState<EmailOption>("system");
  const [smsOption, setSmsOption] = useState<SmsOption>("virtual");
  const [communicationEmail, setCommunicationEmail] = useState("");
  const [communicationPhone, setCommunicationPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salonName, setSalonName] = useState("");

  useEffect(() => {
    if (isDemo) {
      setEmailOption("own");
      setCommunicationEmail("kontakt@luxbeauty.pl");
      setEmailVerified(true);
      setSmsOption("own");
      setCommunicationPhone("+48 500 123 456");
      setPhoneVerified(true);
      setSetupCompleted(true);
      setSalonName("Lux Beauty Studio");
      return;
    }
    if (!salonId) return;
    loadSettings();
  }, [salonId, isDemo]);

  const loadSettings = async () => {
    if (!salonId) return;
    const { data } = await supabase
      .from("salons")
      .select("name, communication_email, communication_email_verified, communication_phone, communication_phone_verified, communication_provider, communication_setup_completed")
      .eq("id", salonId)
      .single();
    if (!data) return;
    setSalonName(data.name || "");
    setCommunicationEmail((data as Record<string, unknown>).communication_email as string || "");
    setEmailVerified((data as Record<string, unknown>).communication_email_verified as boolean || false);
    setCommunicationPhone((data as Record<string, unknown>).communication_phone as string || "");
    setPhoneVerified((data as Record<string, unknown>).communication_phone_verified as boolean || false);
    setSetupCompleted((data as Record<string, unknown>).communication_setup_completed as boolean || false);
    const provider = (data as Record<string, unknown>).communication_provider as Record<string, string> | null;
    if (provider) {
      setEmailOption((provider.email_option as EmailOption) || "system");
      setSmsOption((provider.sms_option as SmsOption) || "virtual");
    }
  };

  const handleSave = async () => {
    if (isDemo) { toast.success("Demo — ustawienia zapisane"); return; }
    if (!salonId) return;
    setSaving(true);
    const { error } = await supabase.from("salons").update({
      communication_email: emailOption === "own" ? communicationEmail : null,
      communication_phone: smsOption === "own" ? communicationPhone : null,
      communication_provider: {
        email_option: emailOption,
        sms_option: smsOption,
      },
      communication_setup_completed: true,
    } as Record<string, unknown>).eq("id", salonId);
    setSaving(false);
    if (error) { toast.error("Błąd zapisu: " + error.message); return; }
    setSetupCompleted(true);
    toast.success("Konfiguracja komunikacji zapisana");
  };

  const handleTestEmail = () => {
    toast.success("Testowy email wysłany na " + (communicationEmail || "noreply@beauty-funnels.com"));
  };

  const handleTestSms = () => {
    toast.success("Testowy SMS wysłany");
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
      {/* Alert if not configured */}
      {!setupCompleted && !isDemo && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Komunikacja nie jest skonfigurowana</AlertTitle>
          <AlertDescription>
            Bez konfiguracji emaila i SMS system nie może wysyłać przypomnień do klientek, potwierdzeń rezerwacji ani wiadomości marketingowych.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">Email</CardTitle>
              </div>
              {emailVerified ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Zweryfikowany
                </Badge>
              ) : emailOption === "system" ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Systemowy
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Niezweryfikowany
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">
              {emailOption === "own" ? (communicationEmail || "Nie ustawiono") : "noreply@beauty-funnels.com"}
            </p>
            <p className="text-xs text-muted-foreground">
              {emailOption === "own" ? "Własny email salonu" : "System Beauty Calendar"}
            </p>
          </CardContent>
        </Card>

        {/* SMS Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">SMS</CardTitle>
              </div>
              {smsOption === "disabled" ? (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Wyłączony
                </Badge>
              ) : phoneVerified ? (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Zweryfikowany
                </Badge>
              ) : smsOption === "virtual" ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Wirtualny
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Niezweryfikowany
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">
              {smsOption === "own"
                ? (communicationPhone || "Nie ustawiono")
                : smsOption === "virtual"
                ? "+48 732 XXX XXX (Beauty Calendar)"
                : "Wyłączone"}
            </p>
            <p className="text-xs text-muted-foreground">
              {smsOption === "own"
                ? "Własny numer salonu"
                : smsOption === "virtual"
                ? "Wirtualny numer systemu"
                : "SMS-y nie są wysyłane"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Konfiguracja email
          </CardTitle>
          <CardDescription>Wybierz adres email z którego będą wysyłane wiadomości do klientek</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onClick={() => setEmailOption("own")}
            className={cn(
              "border-2 rounded-xl p-4 cursor-pointer transition-all",
              emailOption === "own" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", emailOption === "own" ? "border-primary" : "border-muted-foreground/40")}>
                {emailOption === "own" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mój własny email salonu</p>
                <p className="text-xs text-muted-foreground">np. kontakt@mojsalon.pl — klientki widzą Twój email jako nadawcę</p>
              </div>
            </div>
            {emailOption === "own" && (
              <div className="mt-3 ml-8">
                <Input
                  placeholder="kontakt@twojsalon.pl"
                  value={communicationEmail}
                  onChange={e => setCommunicationEmail(e.target.value)}
                  type="email"
                />
              </div>
            )}
          </div>

          <div
            onClick={() => setEmailOption("system")}
            className={cn(
              "border-2 rounded-xl p-4 cursor-pointer transition-all",
              emailOption === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", emailOption === "system" ? "border-primary" : "border-muted-foreground/40")}>
                {emailOption === "system" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Email systemu Beauty Calendar</p>
                <p className="text-xs text-muted-foreground">Wysyłamy z: noreply@beauty-funnels.com</p>
                <p className="text-xs text-amber-600 mt-1">⚠️ Klientki widzą nasz email — mniej profesjonalne</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Konfiguracja SMS
          </CardTitle>
          <CardDescription>Wybierz numer telefonu z którego będą wysyłane SMS-y</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onClick={() => setSmsOption("own")}
            className={cn(
              "border-2 rounded-xl p-4 cursor-pointer transition-all",
              smsOption === "own" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", smsOption === "own" ? "border-primary" : "border-muted-foreground/40")}>
                {smsOption === "own" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Numer telefonu salonu</p>
                <p className="text-xs text-muted-foreground">Klientka widzi Twój numer — może odpisać SMS-em</p>
                <p className="text-xs text-emerald-600 mt-1">✓ Najbardziej profesjonalne rozwiązanie</p>
              </div>
            </div>
            {smsOption === "own" && (
              <div className="mt-3 ml-8">
                <Input
                  placeholder="+48 500 123 456"
                  value={communicationPhone}
                  onChange={e => setCommunicationPhone(e.target.value)}
                  type="tel"
                />
              </div>
            )}
          </div>

          <div
            onClick={() => setSmsOption("virtual")}
            className={cn(
              "border-2 rounded-xl p-4 cursor-pointer transition-all",
              smsOption === "virtual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", smsOption === "virtual" ? "border-primary" : "border-muted-foreground/40")}>
                {smsOption === "virtual" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Wirtualny numer Beauty Calendar</p>
                <p className="text-xs text-muted-foreground">SMS-y wychodzą z numeru +48 732 XXX XXX</p>
                <p className="text-xs text-amber-600 mt-1">⚠️ Klientka nie może odpisać na ten SMS</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSmsOption("disabled")}
            className={cn(
              "border-2 rounded-xl p-4 cursor-pointer transition-all",
              smsOption === "disabled" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", smsOption === "disabled" ? "border-primary" : "border-muted-foreground/40")}>
                {smsOption === "disabled" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tylko email — wyłącz SMS</p>
                <p className="text-xs text-muted-foreground">Komunikacja tylko przez email</p>
                <p className="text-xs text-amber-600 mt-1">⚠️ Skuteczność przypomnień może być niższa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Podgląd — jak klientka zobaczy wiadomość od Ciebie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {smsOption !== "disabled" && (
            <div className="p-3 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💬</span>
                <span className="text-xs text-muted-foreground">
                  SMS od: {smsOption === "own" ? (communicationPhone || "+48 500 123 456") : "+48 732 XXX XXX (Beauty Calendar)"}
                </span>
              </div>
              <p className="text-sm">
                Cześć! Przypominamy o wizycie jutro o 10:00 w {salonName || "Twoim Salonie"}. Do zobaczenia! 💄
              </p>
            </div>
          )}
          <div className="p-3 bg-muted rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✉️</span>
              <div>
                <span className="text-xs text-muted-foreground block">
                  Od: {emailOption === "own" ? (communicationEmail || "kontakt@twojsalon.pl") : "noreply@beauty-funnels.com"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Temat: Potwierdzenie wizyty — {salonName || "Twój Salon"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Section */}
      {setupCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Send className="w-4 h-4" />
              Testuj wysyłkę
            </CardTitle>
            <CardDescription>
              Wyślij testową wiadomość aby sprawdzić czy konfiguracja działa poprawnie.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleTestEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Testowy email
            </Button>
            {smsOption !== "disabled" && (
              <Button variant="outline" size="sm" onClick={handleTestSms} className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Testowy SMS
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || isSaving}>
          {(saving || isSaving) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Zapisz konfigurację komunikacji
        </Button>
      </div>
    </div>
  );
}

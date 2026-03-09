import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Building2, Clock, Scissors, Users, CheckCircle2, ArrowRight, ArrowLeft, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Confetti } from "@/components/booking/Confetti";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Dane salonu", icon: Building2, emoji: "🏢" },
  { title: "Godziny pracy", icon: Clock, emoji: "⏰" },
  { title: "Usługi", icon: Scissors, emoji: "✂️" },
  { title: "Pracownicy", icon: Users, emoji: "👥" },
  { title: "Podsumowanie", icon: CheckCircle2, emoji: "🎉" },
];

const VOICE_SCRIPTS: Record<number, string> = {
  0: "Witaj w Beauty Calendar! Zacznijmy od podstaw. Wpisz nazwę swojego salonu, adres, miasto i dane kontaktowe. Te informacje będą widoczne dla Twoich klientów na stronie rezerwacji. Nazwa salonu jest wymagana — reszta jest opcjonalna, ale warto uzupełnić wszystko od razu.",
  1: "Teraz ustawmy Twoje godziny pracy. Domyślnie ustawiliśmy standardowe godziny od poniedziałku do soboty. Możesz je dowolnie zmienić — wystarczy kliknąć checkbox przy danym dniu, aby go włączyć lub wyłączyć, oraz ustawić godziny otwarcia i zamknięcia.",
  2: "Wybierz branżę najbliższą Twojemu salonowi — kosmetyka, fryzjerstwo lub medycyna estetyczna. System automatycznie zaproponuje listę popularnych usług z cenami i czasem trwania. Możesz wybrać kategorie, które Cię interesują. Ceny i nazwy usług będziesz mogła edytować później w panelu.",
  3: "Jeśli masz zespół, dodaj pracowników. Wpisz imię i nazwisko oraz opcjonalnie email. Jeśli pracujesz sama — po prostu pomiń ten krok. Pracowników możesz dodać lub edytować w dowolnym momencie w panelu administracyjnym.",
  4: "Gratulacje! Twój salon jest gotowy do przyjmowania rezerwacji. Skopiuj link do rezerwacji i udostępnij go swoim klientom — na Instagramie, Facebooku, w Google Maps lub na swojej stronie internetowej. Możesz też skopiować kod embed, aby osadzić widget rezerwacji bezpośrednio na swojej stronie.",
};

const DEFAULT_HOURS = [
  { day: 1, label: "Poniedziałek", start: "09:00", end: "18:00", working: true },
  { day: 2, label: "Wtorek", start: "09:00", end: "18:00", working: true },
  { day: 3, label: "Środa", start: "09:00", end: "18:00", working: true },
  { day: 4, label: "Czwartek", start: "09:00", end: "18:00", working: true },
  { day: 5, label: "Piątek", start: "09:00", end: "18:00", working: true },
  { day: 6, label: "Sobota", start: "09:00", end: "14:00", working: true },
  { day: 0, label: "Niedziela", start: "10:00", end: "14:00", working: false },
];

const SERVICE_TEMPLATES: Record<string, { category: string; services: { name: string; duration: number; price: number }[] }[]> = {
  beauty: [
    { category: "Twarz", services: [
      { name: "Makijaż dzienny", duration: 45, price: 150 },
      { name: "Makijaż wieczorowy", duration: 60, price: 200 },
      { name: "Oczyszczanie twarzy", duration: 60, price: 180 },
    ]},
    { category: "Paznokcie", services: [
      { name: "Manicure hybrydowy", duration: 60, price: 120 },
      { name: "Pedicure", duration: 75, price: 140 },
      { name: "Przedłużanie paznokci", duration: 120, price: 200 },
    ]},
    { category: "Depilacja", services: [
      { name: "Depilacja woskiem – nogi", duration: 45, price: 100 },
      { name: "Depilacja woskiem – bikini", duration: 30, price: 80 },
      { name: "Depilacja laserowa", duration: 30, price: 250 },
    ]},
  ],
  hairdresser: [
    { category: "Strzyżenie", services: [
      { name: "Strzyżenie damskie", duration: 45, price: 120 },
      { name: "Strzyżenie męskie", duration: 30, price: 60 },
      { name: "Strzyżenie dziecięce", duration: 30, price: 50 },
    ]},
    { category: "Koloryzacja", services: [
      { name: "Koloryzacja całkowita", duration: 120, price: 250 },
      { name: "Baleyage / Ombre", duration: 180, price: 400 },
      { name: "Pasemka", duration: 90, price: 200 },
    ]},
    { category: "Pielęgnacja", services: [
      { name: "Keratynowe prostowanie", duration: 120, price: 350 },
      { name: "Odbudowa włosów", duration: 60, price: 150 },
      { name: "Modelowanie", duration: 30, price: 80 },
    ]},
  ],
  medical: [
    { category: "Medycyna estetyczna", services: [
      { name: "Botox", duration: 30, price: 800 },
      { name: "Kwas hialuronowy – usta", duration: 45, price: 1200 },
      { name: "Mezoterapia igłowa", duration: 45, price: 500 },
    ]},
    { category: "Zabiegi laserowe", services: [
      { name: "Usuwanie zmian skórnych", duration: 30, price: 300 },
      { name: "Fotoodmładzanie", duration: 45, price: 400 },
      { name: "Frakcyjny laser CO2", duration: 60, price: 800 },
    ]},
  ],
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[ąàáâã]/g, "a").replace(/[ćčç]/g, "c").replace(/[ęèéêë]/g, "e")
    .replace(/[łľĺ]/g, "l").replace(/[ńñ]/g, "n").replace(/[óòôõö]/g, "o")
    .replace(/[śšş]/g, "s").replace(/[ťţ]/g, "t").replace(/[úùûü]/g, "u")
    .replace(/[źżž]/g, "z").replace(/[đ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "salon";
}

const STEP_DESCRIPTIONS = [
  "Podstawowe informacje o Twoim salonie — to zobaczy każdy klient.",
  "Ustaw typowe godziny pracy — możesz je zmienić w dowolnym momencie.",
  "Wybierz szablon usług lub dodaj własne — ceny i czas edytujesz później.",
  "Dodaj pracowników (opcjonalne — możesz pominąć i dodać później).",
  "Twój salon jest gotowy! Udostępnij link swoim klientom.",
];

// Animated step content wrapper
function StepTransition({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [stepKey]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-[0.98]"
      )}
    >
      {children}
    </div>
  );
}

// Animated progress bar
function AnimatedProgress({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative mt-4 h-3 bg-muted rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${displayValue}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
      {displayValue > 0 && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary rounded-full shadow-lg border-2 border-primary-foreground transition-all duration-700 ease-out flex items-center justify-center"
          style={{ left: `calc(${displayValue}% - 10px)` }}
        >
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [createdSalonId, setCreatedSalonId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);

  // Step 1 - salon data
  const [salonName, setSalonName] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [salonCity, setSalonCity] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonEmail, setSalonEmail] = useState("");

  // Step 2 - hours
  const [hours, setHours] = useState(DEFAULT_HOURS);

  // Step 3 - services
  const [selectedTemplate, setSelectedTemplate] = useState<string>("beauty");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 4 - staff
  const [staffMembers, setStaffMembers] = useState<{ name: string; email: string }[]>([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");

  // Step completion celebration
  const showStepSuccess = () => {
    setStepCompleted(true);
    setTimeout(() => setStepCompleted(false), 600);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        setCheckingAuth(false);
        return;
      }

      const uid = session.user.id;
      setUserId(uid);
      setSalonEmail(session.user.email ?? "");

      const { data: existingSalon } = await supabase
        .from("salons")
        .select("id, slug, name, address, city, phone, email, onboarding_completed, onboarding_step")
        .eq("owner_id", uid)
        .maybeSingle();

      if (existingSalon?.onboarding_completed) {
        navigate("/admin");
        return;
      }

      if (existingSalon) {
        setCreatedSalonId(existingSalon.id);
        setCreatedSlug(existingSalon.slug);
        setSalonName(existingSalon.name ?? "");
        setSalonAddress(existingSalon.address ?? "");
        setSalonCity(existingSalon.city ?? "");
        setSalonPhone(existingSalon.phone ?? "");
        setSalonEmail(existingSalon.email ?? session.user.email ?? "");
        setStep(existingSalon.onboarding_step ?? 0);
      }

      setCheckingAuth(false);
    });
  }, [navigate]);

  useEffect(() => {
    const cats = SERVICE_TEMPLATES[selectedTemplate]?.map(c => c.category) ?? [];
    setSelectedCategories(cats);
  }, [selectedTemplate]);

  // Show confetti when reaching final step
  useEffect(() => {
    if (step === 4) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSaveSalon = async () => {
    if (!salonName.trim()) {
      toast.error("Podaj nazwę salonu");
      return;
    }
    if (!userId) return;
    setSaving(true);

    if (createdSalonId) {
      const { error } = await supabase
        .from("salons")
        .update({
          name: salonName.trim(),
          address: salonAddress.trim() || null,
          city: salonCity.trim() || null,
          phone: salonPhone.trim() || null,
          email: salonEmail.trim() || null,
          onboarding_step: 1,
        })
        .eq("id", createdSalonId);

      if (error) {
        toast.error("Nie udało się zaktualizować salonu: " + error.message);
        setSaving(false);
        return;
      }
      setSaving(false);
      showStepSuccess();
      setTimeout(() => setStep(1), 300);
      return;
    }

    const slug = generateSlug(salonName) + "-" + Date.now().toString(36);

    const { data: salon, error } = await supabase
      .from("salons")
      .insert({
        name: salonName.trim(),
        slug,
        address: salonAddress.trim() || null,
        city: salonCity.trim() || null,
        phone: salonPhone.trim() || null,
        email: salonEmail.trim() || null,
        owner_id: userId,
        onboarding_step: 1,
        onboarding_completed: false,
      })
      .select("id, slug")
      .single();

    if (error) {
      toast.error("Nie udało się utworzyć salonu: " + error.message);
      setSaving(false);
      return;
    }

    setCreatedSalonId(salon.id);
    setCreatedSlug(salon.slug);
    setSaving(false);
    showStepSuccess();
    setTimeout(() => setStep(1), 300);
  };

  const handleSaveHours = async () => {
    if (!createdSalonId || !userId) return;
    setSaving(true);

    const { data: staffMember, error: staffErr } = await supabase
      .from("staff_members")
      .insert({
        salon_id: createdSalonId,
        name: salonName.trim(),
        email: salonEmail.trim() || null,
        user_id: userId,
        role: "owner",
      })
      .select("id")
      .single();

    if (staffErr) {
      toast.error("Błąd tworzenia profilu pracownika");
      setSaving(false);
      return;
    }

    const hoursInsert = hours.map(h => ({
      staff_id: staffMember.id,
      day_of_week: h.day,
      start_time: h.start,
      end_time: h.end,
      is_working: h.working,
    }));

    const { error: hoursErr } = await supabase.from("working_hours").insert(hoursInsert);
    if (hoursErr) {
      toast.error("Błąd zapisywania godzin pracy");
      setSaving(false);
      return;
    }

    await supabase.from("salons").update({ onboarding_step: 2 }).eq("id", createdSalonId);
    setSaving(false);
    showStepSuccess();
    setTimeout(() => setStep(2), 300);
  };

  const handleSaveServices = async () => {
    if (!createdSalonId) return;
    setSaving(true);

    const template = SERVICE_TEMPLATES[selectedTemplate] ?? [];
    const filteredTemplate = template.filter(c => selectedCategories.includes(c.category));

    for (let i = 0; i < filteredTemplate.length; i++) {
      const cat = filteredTemplate[i];
      const { data: category, error: catErr } = await supabase
        .from("service_categories")
        .insert({ salon_id: createdSalonId, name: cat.category, sort_order: i })
        .select("id")
        .single();

      if (catErr) continue;

      const servicesInsert = cat.services.map(s => ({
        salon_id: createdSalonId,
        category_id: category.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
      }));

      await supabase.from("services").insert(servicesInsert);
    }

    await supabase.from("salons").update({ onboarding_step: 3 }).eq("id", createdSalonId);
    setSaving(false);
    showStepSuccess();
    setTimeout(() => setStep(3), 300);
  };

  const handleSaveStaff = async () => {
    if (!createdSalonId) return;
    setSaving(true);

    for (const member of staffMembers) {
      await supabase.from("staff_members").insert({
        salon_id: createdSalonId,
        name: member.name,
        email: member.email || null,
      });
    }

    await supabase.from("salons").update({ onboarding_step: 4 }).eq("id", createdSalonId);
    setSaving(false);
    showStepSuccess();
    setTimeout(() => setStep(4), 300);
  };

  const handleComplete = async () => {
    if (!createdSalonId) return;
    setSaving(true);
    await supabase.from("salons").update({ onboarding_completed: true, onboarding_step: 5 }).eq("id", createdSalonId);
    toast.success("🎉 Salon skonfigurowany! Witamy w Beauty Calendar.");
    navigate("/admin");
  };

  const addStaffMember = () => {
    if (!newStaffName.trim()) return;
    setStaffMembers(prev => [...prev, { name: newStaffName.trim(), email: newStaffEmail.trim() }]);
    setNewStaffName("");
    setNewStaffEmail("");
  };

  const updateHour = (index: number, field: string, value: string | boolean) => {
    setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano do schowka!");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground text-sm animate-pulse">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const bookingUrl = `${window.location.origin}/s/${createdSlug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4 overflow-hidden">
      {showConfetti && <Confetti duration={4000} />}
      
      {/* Success flash overlay */}
      <div className={cn(
        "fixed inset-0 bg-primary/5 pointer-events-none z-40 transition-opacity duration-300",
        stepCompleted ? "opacity-100" : "opacity-0"
      )} />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2 animate-fade-in">
            Skonfiguruj swój salon
          </h1>
          <p className="text-muted-foreground transition-all duration-300">
            Krok {step + 1} z {STEPS.length}: <span className="font-medium text-foreground">{STEPS[step].title}</span>
          </p>
          <AnimatedProgress value={progress} />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isCompleted = i < step;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-500 ease-out",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Icon className={cn("w-3.5 h-3.5", isActive && "animate-pulse")} />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Voice guidance + Video placeholder */}
        <StepTransition stepKey={step}>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card border border-border/50 rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  <span className="mr-1.5">{STEPS[step].emoji}</span>
                  {STEP_DESCRIPTIONS[step]}
                </p>
                <p className="text-xs text-muted-foreground">Kliknij przycisk, aby odsłuchać szczegółowe wyjaśnienie.</p>
              </div>
              <VoiceGuidanceButton text={VOICE_SCRIPTS[step]} label="Posłuchaj" />
            </div>
            <VideoTutorialPlaceholder
              title={`Tutorial: ${STEPS[step].title}`}
              description="Wkrótce pojawi się tu wideo z instrukcją krok po kroku."
            />
          </div>
        </StepTransition>

        {/* Step content */}
        <StepTransition stepKey={step}>
          <Card className="border-border/50 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <span>{STEPS[step].emoji}</span>
                {STEPS[step].title}
              </CardTitle>
              <CardDescription>{STEP_DESCRIPTIONS[step]}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 0: Salon data */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nazwa salonu *</Label>
                    <Input value={salonName} onChange={(e) => setSalonName(e.target.value)} placeholder="np. Beauty Studio Anna" className="transition-all duration-200 focus:scale-[1.01]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Miasto</Label>
                      <Input value={salonCity} onChange={(e) => setSalonCity(e.target.value)} placeholder="np. Warszawa" />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon</Label>
                      <Input value={salonPhone} onChange={(e) => setSalonPhone(e.target.value)} placeholder="+48 600 000 000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <Input value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} placeholder="ul. Piękna 10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email kontaktowy</Label>
                    <Input type="email" value={salonEmail} onChange={(e) => setSalonEmail(e.target.value)} placeholder="kontakt@salon.pl" />
                  </div>
                  <Button onClick={handleSaveSalon} disabled={saving} className="w-full group">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    Dalej
                  </Button>
                </div>
              )}

              {/* Step 1: Working hours */}
              {step === 1 && (
                <div className="space-y-4">
                  {hours.map((h, i) => (
                    <div key={h.day} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50" style={{ animationDelay: `${i * 50}ms` }}>
                      <Checkbox checked={h.working} onCheckedChange={(checked) => updateHour(i, "working", !!checked)} />
                      <span className={cn("w-28 text-sm font-medium transition-colors", !h.working && "text-muted-foreground")}>{h.label}</span>
                      <Input type="time" value={h.start} onChange={(e) => updateHour(i, "start", e.target.value)} disabled={!h.working} className="w-28" />
                      <span className="text-muted-foreground">–</span>
                      <Input type="time" value={h.end} onChange={(e) => updateHour(i, "end", e.target.value)} disabled={!h.working} className="w-28" />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(0)} className="group">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />Wstecz
                    </Button>
                    <Button onClick={handleSaveHours} disabled={saving} className="flex-1 group">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                      Dalej
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Services */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Wybierz branżę</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: "beauty", label: "Beauty / Kosmetyka", emoji: "💄" },
                        { key: "hairdresser", label: "Fryzjerstwo", emoji: "💇‍♀️" },
                        { key: "medical", label: "Medycyna estetyczna", emoji: "💉" },
                      ].map(t => (
                        <Button
                          key={t.key}
                          variant={selectedTemplate === t.key ? "default" : "outline"}
                          onClick={() => setSelectedTemplate(t.key)}
                          className={cn(
                            "h-auto py-3 text-xs transition-all duration-300",
                            selectedTemplate === t.key && "shadow-lg shadow-primary/20 scale-105"
                          )}
                        >
                          <span className="mr-1">{t.emoji}</span> {t.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Kategorie usług</Label>
                    <div className="space-y-2">
                      {(SERVICE_TEMPLATES[selectedTemplate] ?? []).map((cat, idx) => (
                        <div
                          key={cat.category}
                          className="border border-border rounded-lg p-3 transition-all duration-300 hover:border-primary/30"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                              checked={selectedCategories.includes(cat.category)}
                              onCheckedChange={(checked) => {
                                setSelectedCategories(prev =>
                                  checked ? [...prev, cat.category] : prev.filter(c => c !== cat.category)
                                );
                              }}
                            />
                            <span className="font-medium text-sm">{cat.category}</span>
                          </div>
                          <div className={cn(
                            "ml-6 space-y-1 overflow-hidden transition-all duration-300",
                            selectedCategories.includes(cat.category) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                          )}>
                            {cat.services.map(s => (
                              <div key={s.name} className="text-xs text-muted-foreground flex justify-between">
                                <span>{s.name} ({s.duration} min)</span>
                                <span className="font-medium">{s.price} PLN</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="group">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />Wstecz
                    </Button>
                    <Button onClick={handleSaveServices} disabled={saving} className="flex-1 group">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                      Dalej
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Staff */}
              {step === 3 && (
                <div className="space-y-4">
                  {staffMembers.length > 0 && (
                    <div className="space-y-2">
                      {staffMembers.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-scale-in">
                          <div>
                            <p className="font-medium text-sm">{m.name}</p>
                            {m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setStaffMembers(prev => prev.filter((_, j) => j !== i))} className="hover:bg-destructive/10 hover:text-destructive">✕</Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Imię i nazwisko</Label>
                      <Input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="np. Kasia Nowak" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email (opcjonalny)</Label>
                      <Input value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} placeholder="kasia@salon.pl" />
                    </div>
                  </div>
                  <Button variant="outline" onClick={addStaffMember} disabled={!newStaffName.trim()} className="w-full transition-all hover:border-primary/50">+ Dodaj pracownika</Button>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="group">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />Wstecz
                    </Button>
                    <Button onClick={handleSaveStaff} disabled={saving} className="flex-1 group">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                      {staffMembers.length === 0 ? "Pomiń" : "Dalej"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Summary */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 animate-scale-in">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-2 animate-fade-in">Gratulacje! 🎉</h3>
                    <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: "200ms" }}>
                      Twój salon <strong className="text-foreground">{salonName}</strong> jest gotowy do przyjmowania rezerwacji.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: "300ms" }}>
                      <Label className="text-xs text-muted-foreground mb-1 block">Twój link do rezerwacji</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-background px-3 py-2 rounded border border-border truncate">{bookingUrl}</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(bookingUrl)} className="hover-scale"><Copy className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(bookingUrl, "_blank")} className="hover-scale"><ExternalLink className="w-4 h-4" /></Button>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg animate-fade-in" style={{ animationDelay: "400ms" }}>
                      <Label className="text-xs text-muted-foreground mb-1 block">Kod embed na stronę</Label>
                      <code className="block text-xs bg-background px-3 py-2 rounded border border-border overflow-x-auto">
                        {`<iframe src="${bookingUrl}" width="100%" height="700" frameborder="0"></iframe>`}
                      </code>
                      <Button size="sm" variant="outline" className="mt-2 hover-scale" onClick={() => copyToClipboard(`<iframe src="${bookingUrl}" width="100%" height="700" frameborder="0"></iframe>`)}>
                        <Copy className="w-4 h-4 mr-1" />Kopiuj embed
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleComplete} disabled={saving} className="w-full group" size="lg">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />}
                    Przejdź do panelu administracyjnego
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </StepTransition>
      </div>
    </div>
  );
}

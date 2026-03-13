import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "sonner";
import {
  Loader2, ArrowRight, ArrowLeft, Copy, ExternalLink, Sparkles,
  CheckCircle2, Upload, Instagram, Globe, Rocket, Bot,
  Mail, FileText, PartyPopper, Users, Scissors, Building2, MapPin, Link2,
} from "lucide-react";
import { Confetti } from "@/components/booking/Confetti";
import { cn } from "@/lib/utils";

// ---- Constants ----

const STEPS = [
  { title: "O salonie", emoji: "🏢", icon: Building2 },
  { title: "AI Skan", emoji: "🔍", icon: Sparkles },
  { title: "Autopilot", emoji: "🤖", icon: Bot },
  { title: "Twój link", emoji: "🔗", icon: Link2 },
  { title: "Klientki", emoji: "👥", icon: Users },
  { title: "Gotowe!", emoji: "🎉", icon: PartyPopper },
];

const SALON_TYPES = [
  { key: "nails", label: "Paznokcie", emoji: "💅" },
  { key: "hair", label: "Fryzjerstwo", emoji: "💇‍♀️" },
  { key: "cosmetology", label: "Kosmetologia", emoji: "🧴" },
  { key: "brows_lashes", label: "Brwi i rzęsy", emoji: "🪷" },
  { key: "makeup", label: "Makijaż", emoji: "💄" },
  { key: "aesthetic_med", label: "Medycyna estetyczna", emoji: "💉" },
  { key: "spa_massage", label: "Masaż / SPA", emoji: "🧖‍♀️" },
  { key: "barber", label: "Barber", emoji: "🧔" },
  { key: "physiotherapy", label: "Fizjoterapia", emoji: "🦴" },
  { key: "multi", label: "Multi / Inne", emoji: "✨" },
];

const TEAM_SIZES = [
  { key: "1", label: "Tylko ja" },
  { key: "2-3", label: "2-3 osoby" },
  { key: "4-6", label: "4-6 osób" },
  { key: "7+", label: "7+ osób" },
];

const AI_SCAN_MESSAGES = [
  "🔍 Skanuję Twój profil...",
  "💅 Znalazłam usługi — weryfikuję ceny...",
  "📸 Importuję zdjęcia salonu...",
  "⏰ Ustawiam godziny otwarcia...",
  "✅ Gotowe! Uzupełniłam profil za Ciebie.",
];

const AUTOPILOT_FEATURES = [
  { key: "reminders", label: "Przypomnienia SMS przed wizytą", description: "24h i 2h przed wizytą", icon: "📲" },
  { key: "retention", label: "Reaktywacja nieaktywnych klientek", description: "Automatyczne wiadomości po 45, 60, 75 dniach", icon: "🔄" },
  { key: "reviews", label: "Prośby o opinie Google", description: "2h po zakończonej wizycie", icon: "⭐" },
  { key: "noshow", label: "Follow-up po no-show", description: "30 minut po niestawieniu się", icon: "🚫" },
  { key: "brief", label: "Tygodniowy Brief CEO", description: "Każdy poniedziałek o 8:00", icon: "📊" },
];

const SERVICE_TEMPLATES: Record<string, { category: string; services: { name: string; duration: number; price: number }[] }[]> = {
  nails: [
    { category: "Paznokcie", services: [
      { name: "Manicure hybrydowy", duration: 60, price: 120 },
      { name: "Pedicure", duration: 75, price: 140 },
      { name: "Przedłużanie paznokci żelem", duration: 120, price: 200 },
      { name: "Ściągnięcie hybrydy", duration: 20, price: 30 },
    ]},
  ],
  hair: [
    { category: "Strzyżenie", services: [
      { name: "Strzyżenie damskie", duration: 45, price: 120 },
      { name: "Strzyżenie męskie", duration: 30, price: 60 },
    ]},
    { category: "Koloryzacja", services: [
      { name: "Koloryzacja całkowita", duration: 120, price: 250 },
      { name: "Baleyage / Ombre", duration: 180, price: 400 },
    ]},
  ],
  cosmetology: [
    { category: "Zabiegi na twarz", services: [
      { name: "Oczyszczanie twarzy", duration: 60, price: 180 },
      { name: "Mezoterapia igłowa", duration: 45, price: 500 },
      { name: "Peeling chemiczny", duration: 40, price: 200 },
    ]},
    { category: "Depilacja", services: [
      { name: "Depilacja laserowa — nogi", duration: 45, price: 300 },
      { name: "Depilacja woskiem — bikini", duration: 30, price: 80 },
    ]},
  ],
  makeup: [
    { category: "Makijaż", services: [
      { name: "Makijaż dzienny", duration: 45, price: 150 },
      { name: "Makijaż wieczorowy", duration: 60, price: 200 },
      { name: "Makijaż ślubny", duration: 90, price: 400 },
    ]},
  ],
  brows_lashes: [
    { category: "Brwi", services: [
      { name: "Regulacja brwi", duration: 20, price: 40 },
      { name: "Henna brwi", duration: 30, price: 60 },
      { name: "Laminacja brwi", duration: 45, price: 150 },
      { name: "Microblading", duration: 120, price: 800 },
    ]},
    { category: "Rzęsy", services: [
      { name: "Przedłużanie rzęs 1:1", duration: 120, price: 200 },
      { name: "Przedłużanie rzęs objętościowe", duration: 150, price: 280 },
      { name: "Uzupełnienie rzęs", duration: 60, price: 120 },
      { name: "Laminacja rzęs", duration: 60, price: 150 },
    ]},
  ],
  aesthetic_med: [
    { category: "Iniekcje", services: [
      { name: "Botox — czoło", duration: 30, price: 600 },
      { name: "Kwas hialuronowy — usta", duration: 45, price: 800 },
      { name: "Mezoterapia igłowa twarz", duration: 45, price: 500 },
      { name: "Lipoliza iniekcyjna", duration: 30, price: 400 },
    ]},
    { category: "Zabiegi aparaturowe", services: [
      { name: "Laser frakcyjny CO2", duration: 60, price: 600 },
      { name: "HIFU — lifting", duration: 90, price: 1200 },
      { name: "Endermologia", duration: 45, price: 200 },
    ]},
  ],
  spa_massage: [
    { category: "Masaż", services: [
      { name: "Masaż klasyczny — 60 min", duration: 60, price: 180 },
      { name: "Masaż relaksacyjny", duration: 60, price: 200 },
      { name: "Masaż gorącymi kamieniami", duration: 75, price: 250 },
      { name: "Masaż sportowy", duration: 45, price: 160 },
    ]},
    { category: "SPA & Rytuały", services: [
      { name: "Rytuał SPA dla dwojga", duration: 120, price: 500 },
      { name: "Peeling całego ciała", duration: 45, price: 150 },
      { name: "Sauna + masaż", duration: 90, price: 300 },
    ]},
  ],
  barber: [
    { category: "Strzyżenie", services: [
      { name: "Strzyżenie męskie klasyczne", duration: 30, price: 60 },
      { name: "Strzyżenie + broda", duration: 45, price: 90 },
      { name: "Fade / Skin fade", duration: 40, price: 70 },
    ]},
    { category: "Broda", services: [
      { name: "Strzyżenie brody", duration: 20, price: 40 },
      { name: "Golenie brzytwą", duration: 30, price: 50 },
      { name: "Modelowanie brody", duration: 25, price: 45 },
    ]},
  ],
  physiotherapy: [
    { category: "Fizjoterapia", services: [
      { name: "Konsultacja fizjoterapeutyczna", duration: 60, price: 200 },
      { name: "Terapia manualna", duration: 50, price: 180 },
      { name: "Masaż leczniczy", duration: 45, price: 160 },
      { name: "Kinesiotaping", duration: 20, price: 60 },
    ]},
    { category: "Rehabilitacja", services: [
      { name: "Ćwiczenia indywidualne", duration: 45, price: 150 },
      { name: "Elektroterapia", duration: 20, price: 60 },
      { name: "Laseroterapia", duration: 15, price: 50 },
    ]},
  ],
  multi: [
    { category: "Twarz", services: [
      { name: "Oczyszczanie twarzy", duration: 60, price: 180 },
      { name: "Makijaż dzienny", duration: 45, price: 150 },
    ]},
    { category: "Paznokcie", services: [
      { name: "Manicure hybrydowy", duration: 60, price: 120 },
      { name: "Pedicure", duration: 75, price: 140 },
    ]},
    { category: "Depilacja", services: [
      { name: "Depilacja woskiem — nogi", duration: 45, price: 100 },
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

// ---- Animated wrappers ----

function StepTransition({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [stepKey]);
  return (
    <div className={cn("transition-all duration-500 ease-out", visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]")}>
      {children}
    </div>
  );
}

function AnimatedProgress({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisplay(value), 100); return () => clearTimeout(t); }, [value]);
  return (
    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E91E8C] to-[#E91E8C]/70 rounded-full transition-all duration-700 ease-out" style={{ width: `${display}%` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
      </div>
      {display > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#E91E8C] rounded-full shadow-lg border-2 border-white transition-all duration-700 ease-out flex items-center justify-center" style={{ left: `calc(${display}% - 10px)` }}>
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

// ---- Interfaces ----

interface ScannedService {
  name: string;
  price: number;
  duration: number;
  category: string;
}

interface ScanResult {
  services: ScannedService[];
  opening_hours: Record<string, string>;
  description: string;
  avg_rating: number;
  existing_reviews_count: number;
  address?: string;
  phone?: string;
}

interface CsvRow {
  [key: string]: string;
}

// ---- Main Component ----

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
   const [userId, setUserId] = useState<string | null>(null);
   const [userMeta, setUserMeta] = useState<{ first_name?: string; last_name?: string }>({});
  const [createdSalonId, setCreatedSalonId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Step 1 — Salon info
  const [salonName, setSalonName] = useState("");
  const [salonCity, setSalonCity] = useState("");
  const [salonType, setSalonType] = useState("");
  const [teamSize, setTeamSize] = useState("1");
  const [clientSources, setClientSources] = useState<string[]>([]);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Step 2 — AI Scan
  const [scanning, setScanning] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanSkipped, setScanSkipped] = useState(false);
  const [scanPercentage, setScanPercentage] = useState(0);

  // Step 3 — Autopilot toggles
  const [autopilotToggles, setAutopilotToggles] = useState<Record<string, boolean>>({
    reminders: true, retention: true, reviews: true, noshow: true, brief: true,
  });

  // Step 5 — CSV Import
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  // Widget tab
  

  // ---- Auth check & resume ----
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/auth"); setCheckingAuth(false); return; }
      const uid = session.user.id;
      setUserId(uid);
      setUserMeta(session.user.user_metadata as { first_name?: string; last_name?: string } ?? {});

      const { data: salon } = await supabase
        .from("salons")
        .select("id, slug, name, city, onboarding_completed, onboarding_step")
        .eq("owner_id", uid)
        .maybeSingle();

      if (salon?.onboarding_completed) { navigate("/admin"); return; }
      if (salon) {
        setCreatedSalonId(salon.id);
        setCreatedSlug(salon.slug);
        setSalonName(salon.name ?? "");
        setSalonCity(salon.city ?? "");
        setStep(Math.min(salon.onboarding_step ?? 0, 5));
      }
      setCheckingAuth(false);
    });
  }, [navigate]);

  // Confetti on final step
  useEffect(() => {
    if (step === 5) { setShowConfetti(true); const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }
  }, [step]);

  // ---- Step handlers ----

  const goTo = useCallback(async (nextStep: number) => {
    if (createdSalonId) {
      await supabase.from("salons").update({ onboarding_step: nextStep }).eq("id", createdSalonId);
    }
    setStep(nextStep);
  }, [createdSalonId]);

  const handleSaveSalon = async () => {
    if (!salonName.trim()) { toast.error("Podaj nazwę salonu"); return; }
    if (!salonType) { toast.error("Wybierz typ salonu"); return; }
    if (!userId) return;
    setSaving(true);

    if (createdSalonId) {
      const { error } = await supabase.from("salons").update({
        name: salonName.trim(), city: salonCity.trim() || null,
        salon_type: salonType, team_size: parseInt(teamSize) || 1,
        social_url: instagramUrl.trim() || websiteUrl.trim() || null, onboarding_step: 1,
        client_sources: clientSources,
      }).eq("id", createdSalonId);
      if (error) { toast.error("Błąd: " + error.message); setSaving(false); return; }
    } else {
      const slug = generateSlug(salonName) + "-" + Date.now().toString(36);
      const { data: salon, error } = await supabase.from("salons").insert({
        name: salonName.trim(), slug, city: salonCity.trim() || null,
        owner_id: userId, onboarding_step: 1, onboarding_completed: false,
        salon_type: salonType, team_size: parseInt(teamSize) || 1,
        social_url: instagramUrl.trim() || websiteUrl.trim() || null,
        client_sources: clientSources,
      }).select("id, slug").single();
      if (error) { toast.error("Błąd: " + error.message); setSaving(false); return; }
      setCreatedSalonId(salon.id);
      setCreatedSlug(salon.slug);

      // Create owner as staff member
      const ownerName = `${userMeta.first_name ?? ''} ${userMeta.last_name ?? ''}`.trim() || salonName.trim();
      const { data: staffMember } = await supabase.from("staff_members").insert({
        salon_id: salon.id, name: ownerName, user_id: userId, role: "owner",
      }).select("id").single();

      // Create default working hours (Mon-Fri 9:00-17:00) for the owner
      if (staffMember) {
        const defaultHours = [1, 2, 3, 4, 5].map(day => ({
          staff_id: staffMember.id,
          day_of_week: day,
          start_time: "09:00",
          end_time: "17:00",
          is_working: true,
        }));
        await supabase.from("working_hours").insert(defaultHours);
      }
    }
    setSaving(false);

    // If social URL provided, go to AI scan, otherwise skip to step 2 (autopilot, which is step index 2)
    const hasUrls = !!(instagramUrl.trim() || googleMapsUrl.trim() || websiteUrl.trim());
    if (hasUrls) {
      setStep(1);
      startAiScan();
    } else {
      setScanSkipped(true);
      // Save default services from template — use salon.id directly since state may not be updated yet
      const salonIdForServices = createdSalonId ?? (await supabase.from("salons").select("id").eq("owner_id", userId).single()).data?.id;
      if (salonIdForServices) {
        await saveDefaultServices(salonIdForServices);
      }
      setStep(2);
    }
  };

  const saveDefaultServices = async (salonIdOverride?: string) => {
    const salonId = salonIdOverride ?? createdSalonId;
    if (!salonId) return;
    const template = SERVICE_TEMPLATES[salonType || "multi"] ?? SERVICE_TEMPLATES.multi;
    const allServiceIds: string[] = [];
    for (let i = 0; i < template.length; i++) {
      const cat = template[i];
      const { data: category } = await supabase.from("service_categories")
        .insert({ salon_id: salonId, name: cat.category, sort_order: i }).select("id").single();
      if (!category) continue;
      const services = cat.services.map(s => ({ salon_id: salonId, category_id: category.id, name: s.name, duration: s.duration, price: s.price }));
      const { data: insertedServices } = await supabase.from("services").insert(services).select("id");
      if (insertedServices) allServiceIds.push(...insertedServices.map(s => s.id));
    }
    // Auto-assign all services to owner staff member
    await assignServicesToOwner(salonId, allServiceIds);
  };

  const assignServicesToOwner = async (salonId: string, serviceIds: string[]) => {
    if (serviceIds.length === 0) return;
    const { data: ownerStaff } = await supabase.from("staff_members")
      .select("id").eq("salon_id", salonId).eq("role", "owner").maybeSingle();
    if (!ownerStaff) return;
    const staffServices = serviceIds.map(serviceId => ({
      staff_id: ownerStaff.id, service_id: serviceId,
    }));
    await supabase.from("staff_services").insert(staffServices);
  };

  const startAiScan = async () => {
    setScanning(true);
    setScanMessageIndex(0);
    setScanPercentage(0);

    // Run animation and API call in parallel, sync at the end
    const animationPromise = (async () => {
      for (let i = 0; i < AI_SCAN_MESSAGES.length - 1; i++) {
        await new Promise(r => setTimeout(r, 1500));
        setScanMessageIndex(i);
        setScanPercentage(Math.min(((i + 1) / AI_SCAN_MESSAGES.length) * 80, 80));
      }
    })();

    const apiPromise = (async () => {
      const scanUrls = [instagramUrl, googleMapsUrl, websiteUrl].filter(u => u.trim());
      const { data, error } = await supabase.functions.invoke("ai-profile-scanner", {
        body: { urls: scanUrls, salon_type: salonType },
      });
      return { data, error };
    })();

    // Wait for both
    const [, apiResult] = await Promise.all([animationPromise, apiPromise]);

    // Show final message
    setScanMessageIndex(AI_SCAN_MESSAGES.length - 1);
    setScanPercentage(100);
    await new Promise(r => setTimeout(r, 500));

    const { data, error } = apiResult;

    if (error || !data?.success) {
      toast.error("Nie udało się przeskanować profilu. Kontynuuję z domyślnymi ustawieniami.");
      setScanSkipped(true);
      await saveDefaultServices(createdSalonId ?? undefined);
      setScanning(false);
      goTo(2);
      return;
    }

    setScanResult(data.data as ScanResult);
    setScanning(false);
  };

  const handleSaveScanResults = async () => {
    if (!createdSalonId || !scanResult) return;
    setSaving(true);

    // Group services by category
    // Group services by category
    const grouped: Record<string, ScannedService[]> = {};
    scanResult.services.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });

    // Batch insert: create all categories first, then all services at once
    const categoryEntries = Object.keys(grouped);
    const categoryInserts = categoryEntries.map((name, idx) => ({
      salon_id: createdSalonId, name, sort_order: idx,
    }));
    const { data: createdCategories } = await supabase.from("service_categories")
      .insert(categoryInserts).select("id, name");

    if (!createdCategories) { toast.error("Błąd tworzenia kategorii"); setSaving(false); return; }

    const categoryMap = new Map(createdCategories.map(c => [c.name, c.id]));
    const allServicesInsert = scanResult.services
      .filter(s => categoryMap.has(s.category))
      .map(s => ({
        salon_id: createdSalonId!, category_id: categoryMap.get(s.category)!,
        name: s.name, duration: s.duration, price: s.price,
      }));

    const allServiceIds: string[] = [];
    // Insert in chunks of 50 to avoid payload limits
    for (let i = 0; i < allServicesInsert.length; i += 50) {
      const chunk = allServicesInsert.slice(i, i + 50);
      const { data: inserted } = await supabase.from("services").insert(chunk).select("id");
      if (inserted) allServiceIds.push(...inserted.map(s => s.id));
    }

    // Auto-assign all services to owner staff
    await assignServicesToOwner(createdSalonId, allServiceIds);

    // Save description, address, phone from scan
    const salonUpdate: Record<string, string | null> = {};
    if (scanResult.description) salonUpdate.description = scanResult.description;
    if (scanResult.address) salonUpdate.address = scanResult.address;
    if (scanResult.phone) salonUpdate.phone = scanResult.phone;
    if (Object.keys(salonUpdate).length > 0) {
      await supabase.from("salons").update(salonUpdate).eq("id", createdSalonId);
    }

    // Save opening_hours from scan (override defaults)
    if (scanResult.opening_hours && Object.keys(scanResult.opening_hours).length > 0) {
      const dayMap: Record<string, number> = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
        poniedziałek: 1, wtorek: 2, środa: 3, czwartek: 4, piątek: 5, sobota: 6, niedziela: 0,
      };
      const { data: ownerStaff } = await supabase.from("staff_members")
        .select("id").eq("salon_id", createdSalonId).eq("role", "owner").maybeSingle();
      if (ownerStaff) {
        // Delete existing defaults first
        await supabase.from("working_hours").delete().eq("staff_id", ownerStaff.id);
        const hoursToInsert = Object.entries(scanResult.opening_hours).map(([day, hours]) => {
          const dayNum = dayMap[day.toLowerCase()];
          if (dayNum === undefined) return null;
          const parts = hours.match(/(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?/);
          if (!parts) return { staff_id: ownerStaff.id, day_of_week: dayNum, start_time: "09:00", end_time: "17:00", is_working: false };
          const start = `${parts[1].padStart(2, '0')}:${parts[2] || '00'}`;
          const end = `${parts[3].padStart(2, '0')}:${parts[4] || '00'}`;
          return { staff_id: ownerStaff.id, day_of_week: dayNum, start_time: start, end_time: end, is_working: true };
        }).filter(Boolean);
        if (hoursToInsert.length > 0) {
          await supabase.from("working_hours").insert(hoursToInsert);
        }
      }
    }

    setSaving(false);
    goTo(2);
  };

  const handleActivateAutopilot = async () => {
    if (!createdSalonId) return;
    setSaving(true);

    await supabase.from("autopilot_config").insert({
      salon_id: createdSalonId,
      is_active: true,
      ai_suggestions_enabled: autopilotToggles.reviews,
    });

    setSaving(false);
    goTo(3);
  };

  const handleWidgetDone = () => goTo(4);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) { toast.error("Plik CSV jest pusty"); return; }
      const headers = lines[0].split(/[,;]/).map(h => h.trim().replace(/^"|"$/g, ""));
      setCsvHeaders(headers);
      const rows = lines.slice(1, 50).map(line => {
        const values = line.split(/[,;]/).map(v => v.trim().replace(/^"|"$/g, ""));
        const row: CsvRow = {};
        headers.forEach((h, i) => { row[h] = values[i] || ""; });
        return row;
      });
      setCsvData(rows);
    };
    reader.readAsText(file);
  };

  const handleImportClients = async () => {
    if (!createdSalonId || csvData.length === 0) return;
    setSaving(true);

    // Try to auto-map columns
    const findCol = (patterns: string[]) => csvHeaders.find(h => patterns.some(p => h.toLowerCase().includes(p))) || "";
    const firstNameCol = findCol(["imię", "imie", "first", "name", "nazwa"]);
    const lastNameCol = findCol(["nazwisko", "last"]);
    const phoneCol = findCol(["telefon", "phone", "tel", "numer"]);
    const emailCol = findCol(["email", "mail", "e-mail"]);

    let imported = 0;
    for (const row of csvData) {
      const firstName = row[firstNameCol]?.trim();
      const lastName = row[lastNameCol]?.trim() || "";
      const phone = row[phoneCol]?.trim() || "000000000";
      const email = row[emailCol]?.trim() || null;

      if (!firstName) continue;

      const { error } = await supabase.from("clients").insert({
        salon_id: createdSalonId, first_name: firstName, last_name: lastName,
        phone, email, rodo_consent: true,
      });
      if (!error) imported++;
    }
    setImportedCount(imported);
    setSaving(false);
    toast.success(`Zaimportowano ${imported} klientek`);
    goTo(5);
  };

  const handleComplete = async () => {
    if (!createdSalonId) return;
    setSaving(true);
    await supabase.from("salons").update({ onboarding_completed: true, onboarding_step: 6 }).eq("id", createdSalonId);
    toast.success("🎉 Salon skonfigurowany! Witamy w Beauty Calendar.");
    navigate("/admin");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano!");
  };

  // ---- Loading ----
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] to-[#16213E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-[#E91E8C]/20 border-t-[#E91E8C] animate-spin" />
          <p className="text-white/60 text-sm animate-pulse">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const bookingUrl = `${window.location.origin}/s/${createdSlug}`;
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] to-[#16213E] py-6 px-4 overflow-hidden">
      {showConfetti && <Confetti duration={4000} />}

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {STEPS[step].emoji} {STEPS[step].title}
          </h1>
          <p className="text-white/50 text-sm mb-4">
            Krok {step + 1} z {STEPS.length}
          </p>
          <AnimatedProgress value={progress} />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 mb-6 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={i} className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              i === step && "bg-[#E91E8C] text-white scale-110 shadow-lg shadow-[#E91E8C]/30",
              i < step && "bg-[#E91E8C]/30 text-white",
              i > step && "bg-white/10 text-white/30"
            )}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : s.emoji}
            </div>
          ))}
        </div>

        {/* Content */}
        <StepTransition stepKey={step}>
          {/* ===== STEP 0: Salon Info ===== */}
          {step === 0 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold mb-1">Powiedz nam o salonie</h2>
                  <p className="text-sm text-muted-foreground">Podstawowe informacje — zajmie to 2 minuty.</p>
                </div>

                <div className="space-y-2">
                  <Label>Nazwa salonu *</Label>
                  <Input value={salonName} onChange={e => setSalonName(e.target.value)} placeholder="np. Beauty Studio Anna" />
                </div>

                <div className="space-y-2">
                  <Label>Miasto</Label>
                  <Input value={salonCity} onChange={e => setSalonCity(e.target.value)} placeholder="np. Warszawa" />
                </div>

                <div className="space-y-2">
                  <Label>Typ salonu</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SALON_TYPES.map(t => (
                      <Button key={t.key} variant={salonType === t.key ? "default" : "outline"} size="sm"
                        onClick={() => setSalonType(t.key)} className={cn("text-xs h-auto py-2", salonType === t.key && "shadow-lg")}>
                        <span className="mr-1">{t.emoji}</span>{t.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Liczba pracowników</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEAM_SIZES.map(s => (
                      <Button key={s.key} variant={teamSize === s.key ? "default" : "outline"} size="sm"
                        onClick={() => setTeamSize(s.key)} className="text-xs h-auto py-2">
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Skąd przyszły Twoje klientki? */}
                <div className="space-y-2">
                  <Label>Skąd teraz bierzesz nowe klientki?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "booksy", label: "Booksy / Fresha / Versum", emoji: "🔵" },
                      { key: "instagram", label: "Instagram / Social media", emoji: "📱" },
                      { key: "referrals", label: "Polecenia", emoji: "👯" },
                      { key: "google", label: "Google / Strona www", emoji: "🌐" },
                      { key: "phone", label: "Telefon / Stali klienci", emoji: "📞" },
                    ].map(s => (
                      <Button key={s.key} variant={clientSources.includes(s.key) ? "default" : "outline"} size="sm"
                        onClick={() => setClientSources(prev => prev.includes(s.key) ? prev.filter(x => x !== s.key) : [...prev, s.key])}
                        className={cn("text-xs h-auto py-2 justify-start", clientSources.includes(s.key) && "shadow-lg")}>
                        <span className="mr-1">{s.emoji}</span>{s.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-gradient-to-r from-[#E91E8C]/5 to-[#E91E8C]/10 rounded-xl border border-[#E91E8C]/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E91E8C]" />
                    <Label className="text-sm font-semibold">AI Scan — uzupełni dane za Ciebie</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI przeczyta Twój profil i wstępnie wypełni usługi, ceny i godziny pracy — Ty tylko sprawdzisz czy się zgadzają.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/twojsalon" className="text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)}
                        placeholder="Link do wizytówki Google Maps" className="text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                        placeholder="Link do Booksy / Fresha / Versum (AI skopiuje Twoje usługi)" className="text-sm" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSalon} disabled={saving || !salonType} className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white" size="lg">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {(instagramUrl.trim() || googleMapsUrl.trim() || websiteUrl.trim()) ? "Skanuj mój profil AI →" : `Dalej — krok 2 z ${STEPS.length} →`}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ===== STEP 1: AI Scan ===== */}
          {step === 1 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6">
                {scanning ? (
                  <div className="text-center py-8 space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#E91E8C]/20 to-[#E91E8C]/5 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-10 h-10 text-[#E91E8C]" />
                    </div>
                    <div className="space-y-2">
                      {AI_SCAN_MESSAGES.map((msg, i) => (
                        <p key={i} className={cn(
                          "text-sm transition-all duration-500",
                          i <= scanMessageIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
                          i === scanMessageIndex ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}>{msg}</p>
                      ))}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-[#E91E8C] rounded-full transition-all duration-700" style={{ width: `${scanPercentage}%` }} />
                    </div>
                  </div>
                ) : scanResult ? (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="font-bold">Co znalazłam</h2>
                        <p className="text-xs text-muted-foreground">
                          {scanResult.services.length} usług · ocena {scanResult.avg_rating}/5 · {scanResult.existing_reviews_count} opinii
                        </p>
                      </div>
                    </div>

                    {scanResult.description && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Opis</p>
                        <p className="text-sm">{scanResult.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Znalezione usługi:</p>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {scanResult.services.map((s, i) => (
                          <div key={i} className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted">
                            <span>{s.name} <span className="text-xs text-muted-foreground">({s.duration} min)</span></span>
                            <span className="font-semibold">{s.price} PLN</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => { setScanResult(null); setScanSkipped(true); saveDefaultServices(); goTo(2); }} className="flex-1">
                        Użyj szablonów
                      </Button>
                      <Button onClick={handleSaveScanResults} disabled={saving} className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Wygląda świetnie, zapisz
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nie udało się przeskanować profilu.</p>
                    <Button onClick={() => goTo(2)}>Kontynuuj z szablonami</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ===== STEP 2: Autopilot (PRO gate) ===== */}
          {step === 2 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#E91E8C] flex items-center justify-center mb-3">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-lg font-bold">🔒 Twój Autopilot czeka na aktywację</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Skonfigurujemy go razem podczas bezpłatnej konsultacji (30 min).
                    <br />Chcemy mieć pewność że działa idealnie pod Twój salon.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Co zostanie włączone:</p>
                  {AUTOPILOT_FEATURES.map(f => (
                    <div key={f.key} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{f.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{f.label}</p>
                          <p className="text-xs text-muted-foreground">{f.description}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                        🔒 PRO
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep((instagramUrl || googleMapsUrl || websiteUrl) ? 1 : 0)} size="sm">
                    <ArrowLeft className="mr-1 h-4 w-4" />Wstecz
                  </Button>
                  <Button onClick={() => {
                    // Save autopilot config as pending (not active) and proceed
                    if (createdSalonId) {
                      supabase.from("autopilot_config").upsert({
                        salon_id: createdSalonId,
                        is_active: false,
                        ai_suggestions_enabled: false,
                      });
                    }
                    goTo(3);
                  }} disabled={saving} className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Umów konsultację i aktywuj Autopilot →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== STEP 3: Twój link jest gotowy ===== */}
          {step === 3 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 space-y-5">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-[#E91E8C]/10 flex items-center justify-center mb-3">
                    <Link2 className="w-8 h-8 text-[#E91E8C]" />
                  </div>
                  <h2 className="text-lg font-bold">🎉 Twój link do rezerwacji jest gotowy!</h2>
                  <p className="text-sm text-muted-foreground mt-1">Klientki mogą już rezerwować wizyty online.</p>
                </div>

                <div className="p-4 bg-muted rounded-xl border">
                  <Label className="text-xs text-muted-foreground mb-2 block">Twój link</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-medium bg-background px-3 py-2 rounded-lg border truncate">{bookingUrl}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(bookingUrl)}><Copy className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(bookingUrl, "_blank")}><ExternalLink className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Udostępnij klientkom:</p>
                  
                  <button
                    onClick={() => { copyToClipboard(bookingUrl); toast.success("Link skopiowany — wklej go w bio na Instagramie!"); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors text-left"
                  >
                    <Instagram className="w-5 h-5 text-[#E91E8C] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Dodaj do bio na Instagramie</p>
                      <p className="text-xs text-muted-foreground">Skopiuj link i wklej w edycji profilu</p>
                    </div>
                    <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Hej! 💅 Zarezerwuj wizytę w ${salonName} tutaj: ${bookingUrl}`);
                      window.open(`https://wa.me/?text=${text}`, "_blank");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors text-left"
                  >
                    <span className="text-xl shrink-0">💬</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Wyślij przez WhatsApp</p>
                      <p className="text-xs text-muted-foreground">Udostępnij link swoim klientkom</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>

                  <button
                    onClick={() => copyToClipboard(bookingUrl)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted transition-colors text-left"
                  >
                    <Copy className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Kopiuj link</p>
                      <p className="text-xs text-muted-foreground">Wklej gdziekolwiek — SMS, email, Facebook</p>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  💡 Kod embed do osadzenia na stronie www znajdziesz w panelu po konfiguracji.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} size="sm">
                    <ArrowLeft className="mr-1 h-4 w-4" />Wstecz
                  </Button>
                  <Button onClick={handleWidgetDone} className="flex-1 bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white" size="lg">
                    <ArrowRight className="mr-2 h-4 w-4" />Dalej
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== STEP 4: Import Clients ===== */}
          {step === 4 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold">Przenieś klientki</h2>
                  <p className="text-sm text-muted-foreground">Importuj bazę klientów z Booksy, Calendesk lub innego systemu.</p>
                </div>

                {csvData.length === 0 ? (
                  <div className="space-y-4">
                    <label className="block w-full p-8 border-2 border-dashed border-[#E91E8C]/30 rounded-xl text-center cursor-pointer hover:bg-[#E91E8C]/5 transition-colors">
                      <Upload className="w-8 h-8 text-[#E91E8C] mx-auto mb-2" />
                      <p className="text-sm font-medium">Przeciągnij plik CSV lub kliknij</p>
                      <p className="text-xs text-muted-foreground mt-1">Obsługiwane: CSV z Booksy, Versum, Excel</p>
                      <input type="file" accept=".csv,.txt" onChange={handleCsvUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-[#E91E8C]" />
                      <span className="font-medium">Znaleziono {csvData.length} rekordów</span>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted">
                            <tr>{csvHeaders.slice(0, 4).map(h => <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {csvData.slice(0, 5).map((row, i) => (
                              <tr key={i} className="border-t">
                                {csvHeaders.slice(0, 4).map(h => <td key={h} className="px-2 py-1.5 truncate max-w-[120px]">{row[h]}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <Button onClick={handleImportClients} disabled={saving} className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Importuj {csvData.length} klientek
                    </Button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} size="sm">
                    <ArrowLeft className="mr-1 h-4 w-4" />Wstecz
                  </Button>
                  <Button variant="ghost" onClick={() => goTo(5)} className="flex-1 text-muted-foreground">
                    Zacznę od nowa — pomiń
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== STEP 5: Celebration ===== */}
          {step === 5 && (
            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-6 space-y-6">
                <div className="text-center py-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#E91E8C]/20 to-emerald-100 flex items-center justify-center mb-4 animate-scale-in">
                    <PartyPopper className="w-10 h-10 text-[#E91E8C]" />
                  </div>
                  <h2 className="text-2xl font-bold mb-1 animate-fade-in">Jesteś gotowa! 🎉</h2>
                  <p className="text-muted-foreground text-sm">
                    Beauty Calendar jest aktywny dla <strong className="text-foreground">{salonName}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Usługi skonfigurowane", value: scanResult ? `${scanResult.services.length} (AI)` : "✓ z szablonu", done: true },
                    { label: "Autopilot", value: "AKTYWNY", done: true },
                    { label: "Link do rezerwacji", value: "Udostępniony", done: true },
                    { label: "Klientki zaimportowane", value: importedCount > 0 ? `${importedCount}` : "—", done: importedCount > 0 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{item.label}</span>
                      <span className={cn("text-sm font-semibold", item.done ? "text-emerald-600" : "text-muted-foreground")}>
                        {item.done && <CheckCircle2 className="w-4 h-4 inline mr-1" />}{item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleComplete} disabled={saving} className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90 text-white" size="lg">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                  Przejdź do Dashboard →
                </Button>

                <div className="text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => {
                    const shareUrl = bookingUrl;
                    const text = `Zarezerwuj wizytę w ${salonName} 💅`;
                    if (navigator.share) { navigator.share({ title: salonName, text, url: shareUrl }); }
                    else { copyToClipboard(shareUrl); }
                  }}>
                    <Globe className="w-3.5 h-3.5 mr-1" />Zaproś pierwszą klientkę do rezerwacji
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </StepTransition>
      </div>
    </div>
  );
}

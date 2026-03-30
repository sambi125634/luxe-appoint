import { useState } from "react";
import { Clock, ChevronRight, Sparkles, Star, Play, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import manicureVideoAsset from "@/assets/service-video-manicure.mp4.asset.json";
import facialVideoAsset from "@/assets/service-video-facial.mp4.asset.json";
import browsVideoAsset from "@/assets/service-video-brows.mp4.asset.json";
import servicePeeling from "@/assets/service-peeling.jpg";
import serviceMezoterapia from "@/assets/service-mezoterapia.jpg";
import serviceMikrodermabrazja from "@/assets/service-mikrodermabrazja.jpg";
import serviceHydrafacial from "@/assets/service-hydrafacial.jpg";
import serviceHifu from "@/assets/service-hifu.jpg";
import serviceMasazRelaks from "@/assets/service-masaz-relaks.jpg";
import serviceMasazLimfa from "@/assets/service-masaz-limfa.jpg";
import serviceFalaUderzeniowa from "@/assets/service-fala-uderzeniowa.jpg";
import serviceDepilacjaLaser from "@/assets/service-depilacja-laser.jpg";
import serviceDepilacjaWosk from "@/assets/service-depilacja-wosk.jpg";
import serviceLaminacjaRzesy from "@/assets/service-laminacja-rzesy.jpg";
import serviceLaminacjaBrwi from "@/assets/service-laminacja-brwi.jpg";
import serviceHennaBrwi from "@/assets/service-henna-brwi.jpg";
import serviceManicure from "@/assets/service-manicure.jpg";
import servicePedicure from "@/assets/service-pedicure.jpg";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  benefits?: string[];
  image?: string;
  video?: string;
  popular?: boolean;
  badge?: string | null;
  hasVideo?: boolean;
}

interface ServiceSelectionProps {
  onSelect: (service: Service) => void;
  selectedService: Service | null;
  onProceed?: () => void;
  salonId?: string;
  isDemo?: boolean;
}

type ServiceMediaItem = {
  type?: "image" | "video" | string;
  url?: string;
};

// Demo data — used only when isDemo=true
const demoCategories = [
  { id: "all", name: "Wszystkie", icon: "✨" },
  { id: "Twarz", name: "Twarz", icon: "✨" },
  { id: "Ciało", name: "Ciało", icon: "💆" },
  { id: "Depilacja", name: "Depilacja", icon: "⚡" },
  { id: "Brwi i rzęsy", name: "Brwi i rzęsy", icon: "👁️" },
  { id: "Paznokcie", name: "Paznokcie", icon: "💅" },
];

const demoServices: Service[] = [
  // ── TWARZ ──
  // s1: Peeling — facialVideo (unique)
  {
    id: "s1",
    name: "Peeling kawitacyjny",
    category: "Twarz",
    duration: 45,
    price: 150,
    description: "Głębokie oczyszczanie skóry ultradźwiękami. Usuwa zanieczyszczenia, wygładza i rozjaśnia cerę bez podrażnień.",
    benefits: ["Oczyszcza pory", "Wygładza skórę", "Rozjaśnia przebarwienia"],
    badge: "Hit",
    popular: true,
    hasVideo: true,
    video: facialVideoAsset.url,
    image: servicePeeling,
  },
  {
    id: "s2",
    name: "Mezoterapia igłowa",
    category: "Twarz",
    duration: 60,
    price: 350,
    description: "Odmładzanie i intensywne nawilżenie skóry od wewnątrz. Koktajle witaminowe dostarczane bezpośrednio w głąb skóry właściwej.",
    benefits: ["Nawilża głęboko", "Redukuje zmarszczki", "Poprawia owal twarzy"],
    badge: "Hit",
    popular: true,
    hasVideo: false,
    image: serviceMezoterapia,
  },
  {
    id: "s3",
    name: "Mikrodermabrazja",
    category: "Twarz",
    duration: 50,
    price: 180,
    description: "Mechaniczny peeling diamentowy dla gładkiej, promiennej skóry. Stymuluje produkcję kolagenu i usuwa martwy naskórek.",
    benefits: ["Usuwa martwy naskórek", "Stymuluje kolagen", "Wygładza blizny"],
    badge: null,
    hasVideo: false,
    image: serviceMikrodermabrazja,
  },
  {
    id: "s4",
    name: "Oczyszczanie wodorowe",
    category: "Twarz",
    duration: 60,
    price: 250,
    description: "Rewolucyjna technologia HydraFacial — jednoczesne oczyszczanie, złuszczanie i nawilżanie skóry strumieniem wody pod ciśnieniem.",
    benefits: ["Natychmiastowy efekt", "Bez podrażnień", "Dla każdej cery"],
    badge: "Nowość",
    hasVideo: false,
    image: serviceHydrafacial,
  },
  {
    id: "s5",
    name: "Lifting HIFU",
    category: "Twarz",
    duration: 90,
    price: 899,
    description: "Nieinwazyjny lifting ultradźwiękowy — alternatywa dla chirurgii plastycznej. Napina skórę i modeluje owal twarzy bez skalpela.",
    benefits: ["Efekt liftingu", "Bez rekonwalescencji", "Trwałość 12–18 miesięcy"],
    badge: "Premium",
    hasVideo: false,
    image: serviceHifu,
  },
  // ── CIAŁO ──
  {
    id: "s6",
    name: "Masaż relaksacyjny",
    category: "Ciało",
    duration: 60,
    price: 200,
    description: "Pełny masaż ciała aromatycznymi olejkami eterycznymi. Redukuje napięcie mięśniowe, koi zmysły i przywraca równowagę.",
    benefits: ["Redukuje stres", "Rozluźnia mięśnie", "Poprawia krążenie"],
    badge: "Hit",
    popular: true,
    hasVideo: false,
    image: serviceMasazRelaks,
  },
  {
    id: "s7",
    name: "Masaż limfatyczny",
    category: "Ciało",
    duration: 75,
    price: 250,
    description: "Specjalistyczny drenaż limfatyczny redukujący obrzęki i wspomagający detoks organizmu.",
    benefits: ["Redukuje obrzęki", "Detoks organizmu", "Poprawia odporność"],
    badge: null,
    hasVideo: false,
    image: serviceMasazLimfa,
  },
  {
    id: "s8",
    name: "Fala uderzeniowa — cellulit",
    category: "Ciało",
    duration: 45,
    price: 220,
    description: "Skuteczna redukcja cellulitu i modelowanie sylwetki falą uderzeniową. Rozbija tkankę tłuszczową i wygładza skórę.",
    benefits: ["Redukuje cellulit", "Modeluje sylwetkę", "Wygładza skórę"],
    badge: null,
    hasVideo: false,
    image: serviceFalaUderzeniowa,
  },
  // ── DEPILACJA ──
  {
    id: "s9",
    name: "Depilacja laserowa",
    category: "Depilacja",
    duration: 30,
    price: 199,
    description: "Trwałe usuwanie owłosienia laserem diodowym najnowszej generacji. Bezbolesna, skuteczna dla każdego typu skóry.",
    benefits: ["Trwały efekt", "Bezbolesna", "Każdy typ skóry"],
    badge: "Hit",
    popular: true,
    hasVideo: false,
    image: serviceDepilacjaLaser,
  },
  {
    id: "s10",
    name: "Depilacja woskiem",
    category: "Depilacja",
    duration: 30,
    price: 80,
    description: "Klasyczna depilacja gorącym woskiem brazylijskim. Gładka skóra nawet do 4 tygodni.",
    benefits: ["Do 4 tygodni gładkości", "Delikatna formuła", "Każda partia ciała"],
    badge: null,
    hasVideo: false,
    image: serviceDepilacjaWosk,
  },
  // ── BRWI I RZĘSY ──
  {
    id: "s11",
    name: "Laminacja rzęs",
    category: "Brwi i rzęsy",
    duration: 60,
    price: 180,
    description: "Trwałe podkręcenie i zagęszczenie naturalnych rzęs bez użycia kleju. Efekt jak po tuszy utrzymuje się 6–8 tygodni.",
    benefits: ["6–8 tygodni efektu", "Bez kleju", "Naturalne rzęsy"],
    badge: "Hit",
    popular: true,
    hasVideo: false,
    image: serviceLaminacjaRzesy,
  },
  // s12: Laminacja brwi — browsVideo (unique)
  {
    id: "s12",
    name: "Laminacja brwi",
    category: "Brwi i rzęsy",
    duration: 45,
    price: 150,
    description: "Modelowanie i utrwalanie brwi w idealnym kształcie. Efekt zadbanych, gęstych brwi utrzymuje się 4–6 tygodni.",
    benefits: ["Idealne wypełnienie", "4–6 tygodni efektu", "Naturalny wygląd"],
    badge: null,
    hasVideo: true,
    video: browsVideoAsset.url,
    image: serviceLaminacjaBrwi,
  },
  {
    id: "s13",
    name: "Henna + regulacja brwi",
    category: "Brwi i rzęsy",
    duration: 30,
    price: 70,
    description: "Precyzyjna regulacja kształtu brwi i koloryzacja henną. Wymodelowane brwi podkreślają rysy twarzy.",
    benefits: ["Idealny kształt", "Wypełnienie henną", "Efekt 2–3 tygodnie"],
    badge: null,
    hasVideo: false,
    image: serviceHennaBrwi,
  },
  // ── PAZNOKCIE ──
  // s14: Manicure — manicureVideo (unique)
  {
    id: "s14",
    name: "Manicure hybrydowy",
    category: "Paznokcie",
    duration: 75,
    price: 120,
    description: "Trwały manicure hybrydowy z pielęgnacją dłoni. Ponad 300 kolorów do wyboru. Efekt 3–4 tygodnie bez odprysków.",
    benefits: ["3–4 tygodnie trwałości", "300+ kolorów", "Pielęgnacja dłoni w cenie"],
    badge: "Hit",
    popular: true,
    hasVideo: true,
    video: manicureVideoAsset.url,
    image: serviceManicure,
  },
  {
    id: "s15",
    name: "Pedicure leczniczy",
    category: "Paznokcie",
    duration: 75,
    price: 130,
    description: "Kompleksowa pielęgnacja stóp z frezarką i kąpielą. Usuwa modzele, zrogowaciałą skórę i regeneruje paznokcie.",
    benefits: ["Miękkie stopy", "Zdrowe paznokcie", "Pełna regeneracja"],
    badge: null,
    hasVideo: false,
    image: servicePedicure,
  },
];

const durationFilters = [
  { id: "all", name: "Dowolny czas" },
  { id: "short", name: "Do 30 min" },
  { id: "medium", name: "30-60 min" },
  { id: "long", name: "60+ min" },
];

export function ServiceSelection({ onSelect, selectedService, onProceed, salonId, isDemo = false }: ServiceSelectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDuration, setActiveDuration] = useState("all");
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch real categories from DB
  const { data: dbCategories, isLoading: loadingCategories } = useQuery({
    queryKey: ["booking-categories", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, icon")
        .eq("salon_id", salonId!)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  // Fetch real services from DB
  const { data: dbServices, isLoading: loadingServices } = useQuery({
    queryKey: ["booking-services", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, category_id, duration, price, description, benefits, media")
        .eq("salon_id", salonId!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  // Build categories list
  const categories = isDemo
    ? demoCategories
    : [
        { id: "all", name: "Wszystkie", icon: "✨" },
        ...(dbCategories ?? []).map(c => ({ id: c.id, name: c.name, icon: c.icon || "✨" })),
      ];

  // Build services list
  const services: Service[] = isDemo
    ? demoServices
    : (dbServices ?? []).map(s => {
        const media = Array.isArray(s.media) ? (s.media as ServiceMediaItem[]) : [];
        const firstImage = media.find((m) => m?.type === "image");
        const firstVideo = media.find((m) => m?.type === "video");
        const benefits = Array.isArray(s.benefits) ? (s.benefits as string[]) : [];
        return {
          id: s.id,
          name: s.name,
          category: s.category_id || "other",
          duration: s.duration,
          price: Number(s.price),
          description: s.description || "",
          benefits,
          image: firstImage?.url,
          video: firstVideo?.url,
        };
      });

  const isLoading = !isDemo && (loadingCategories || loadingServices);

  const filteredServices = services.filter(s => {
    const categoryMatch = activeCategory === "all" || s.category === activeCategory;
    let durationMatch = true;
    if (activeDuration === "short") durationMatch = s.duration <= 30;
    if (activeDuration === "medium") durationMatch = s.duration > 30 && s.duration <= 60;
    if (activeDuration === "long") durationMatch = s.duration > 60;
    return categoryMatch && durationMatch;
  });

  const popularServices = filteredServices.filter(s => s.popular);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="flex justify-center gap-2">
          {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-24 rounded-xl" />)}
        </div>
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz usługę</h2>
        <p className="text-muted-foreground">Odkryj nasze zabiegi i wybierz idealny dla siebie</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-soft scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:scale-102"
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Duration filter toggle */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
          Filtruj po czasie
        </Button>
        {showFilters && (
          <div className="flex gap-2 animate-fade-in">
            {durationFilters.map(filter => (
              <Badge
                key={filter.id}
                variant={activeDuration === filter.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveDuration(filter.id)}
              >
                {filter.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Popular services highlight */}
      {popularServices.length > 0 && activeCategory === "all" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Star className="w-4 h-4 text-amber-500" />
            Popularne zabiegi
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularServices.slice(0, 2).map((service) => (
              <div
                key={service.id}
                role="button"
                tabIndex={0}
                onClick={() => { onSelect(service); onProceed?.(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect(service); onProceed?.(); } }}
                className={cn(
                  "relative overflow-hidden rounded-xl border transition-all duration-300 text-left p-4 cursor-pointer",
                  "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
                  selectedService?.id === service.id
                    ? "border-primary shadow-glow ring-2 ring-primary/20"
                    : "border-amber-200 dark:border-amber-800/50 hover:border-primary/50 hover:shadow-md"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {service.badge && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          service.badge === "Hit" && "bg-orange-100 text-orange-700",
                          service.badge === "Premium" && "bg-purple-100 text-purple-700",
                          service.badge === "Nowość" && "bg-green-100 text-green-700",
                        )}>
                          {service.badge === "Hit" ? "⭐ " : service.badge === "Premium" ? "💎 " : "✨ "}
                          {service.badge}
                        </span>
                      )}
                      {(service.video || service.hasVideo) && (
                        <Badge variant="secondary" className="text-xs">Wideo</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-base mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{service.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="font-bold text-primary text-lg">{service.price} zł</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {service.video ? (
                      <video
                        src={service.video}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : service.image ? (
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                    ) : null}
                    {service.video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services grid */}
      <div className="grid gap-3">
        {filteredServices.map((service, index) => (
          <div
            key={service.id}
            role="button"
            tabIndex={0}
            onClick={() => { onSelect(service); onProceed?.(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect(service); onProceed?.(); } }}
            className={cn(
              "group w-full text-left rounded-xl border transition-all duration-300 cursor-pointer",
              "animate-fade-in",
              selectedService?.id === service.id
                ? "border-primary bg-primary/5 shadow-glow ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/50 hover:shadow-soft"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex">
              {(service.image || service.video) && (
                <div className="relative w-24 sm:w-32 flex-shrink-0 overflow-hidden rounded-l-xl">
                  {service.video ? (
                    <video
                      src={service.video}
                      className="w-full h-full object-cover aspect-square"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover aspect-square" />
                  )}
                  {service.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      {service.badge && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          service.badge === "Hit" && "bg-orange-100 text-orange-700",
                          service.badge === "Premium" && "bg-purple-100 text-purple-700",
                          service.badge === "Nowość" && "bg-green-100 text-green-700",
                        )}>
                          {service.badge === "Hit" ? "⭐ " : service.badge === "Premium" ? "💎 " : "✨ "}
                          {service.badge}
                        </span>
                      )}
                      {(service.video || service.hasVideo) && (
                        <Badge variant="outline" className="text-xs">Wideo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {service.description}
                    </p>
                    
                    {service.benefits && service.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {service.benefits.slice(0, 2).map((benefit, i) => (
                          <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            ✓ {benefit}
                          </span>
                        ))}
                        {service.benefits.length > 2 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPreviewService(service); }}
                            className="text-xs text-primary hover:underline"
                          >
                            +{service.benefits.length - 2} więcej
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      <span className="font-bold text-primary text-lg">
                        {service.price} zł
                      </span>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                    selectedService?.id === service.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Brak usług w tej kategorii</p>
          <p className="text-sm">Spróbuj wybrać inną kategorię lub filtr</p>
        </div>
      )}

      {/* Service preview dialog */}
      <Dialog open={!!previewService} onOpenChange={() => setPreviewService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{previewService?.name}</DialogTitle>
          </DialogHeader>
          {previewService?.video ? (
            <video
              src={previewService.video}
              controls
              autoPlay
              muted
              className="w-full h-48 object-cover rounded-lg"
              playsInline
              preload="metadata"
            />
          ) : previewService?.image ? (
            <img src={previewService.image} alt={previewService.name} className="w-full h-48 object-cover rounded-lg" />
          ) : null}
          <p className="text-muted-foreground">{previewService?.description}</p>
          {previewService?.benefits && (
            <div className="space-y-2">
              <p className="font-medium text-sm">Korzyści:</p>
              <ul className="space-y-1">
                {previewService.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {previewService?.duration} min
            </div>
            <span className="text-xl font-bold text-primary">{previewService?.price} zł</span>
          </div>
          <Button 
            className="w-full" 
            onClick={() => { 
              if (previewService) onSelect(previewService); 
              setPreviewService(null); 
            }}
          >
            Wybierz tę usługę
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

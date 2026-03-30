import { useState } from "react";
import { Clock, Sparkles, Star, Play, Filter, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

interface ServiceVariant {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

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
  variants?: ServiceVariant[];
  selectedVariantName?: string;
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
    variants: [
      { id: "s6v1", name: "30 minut", description: "Plecy i szyja", duration: 30, price: 110 },
      { id: "s6v2", name: "60 minut", description: "Całe ciało", duration: 60, price: 200 },
      { id: "s6v3", name: "90 minut", description: "Całe ciało + aromaterapia", duration: 90, price: 280 },
    ],
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
    variants: [
      { id: "s9v1", name: "Wąsik", duration: 15, price: 99 },
      { id: "s9v2", name: "Pachy", duration: 20, price: 149 },
      { id: "s9v3", name: "Bikini klasyczne", duration: 30, price: 199 },
      { id: "s9v4", name: "Nogi całe", duration: 60, price: 349 },
    ],
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
    variants: [
      { id: "s14v1", name: "Klasyczny", description: "Jeden kolor, bez zdobień", duration: 75, price: 120 },
      { id: "s14v2", name: "Z zdobieniem", description: "Klasyczny + nail art", duration: 90, price: 150 },
      { id: "s14v3", name: "Z przedłużeniem", description: "Żel lub akryl + kolor", duration: 120, price: 200 },
    ],
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
    variants: [
      { id: "s15v1", name: "Podstawowy", description: "Pielęgnacja bez lakieru", duration: 60, price: 110 },
      { id: "s15v2", name: "Z hybrydą", description: "Pielęgnacja + lakier hybrydowy", duration: 75, price: 130 },
      { id: "s15v3", name: "Premium", description: "Pełna regeneracja + maska + hybryda", duration: 90, price: 170 },
    ],
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
  const [showFilters, setShowFilters] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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

  const getEffectiveService = (service: Service): Service => {
    const variantId = selectedVariants[service.id];
    if (!variantId || !service.variants) return service;
    const variant = service.variants.find(v => v.id === variantId);
    if (!variant) return service;
    return {
      ...service,
      duration: variant.duration,
      price: variant.price,
      selectedVariantName: variant.name,
    };
  };

  const handleServiceSelect = (service: Service) => {
    const effective = getEffectiveService(service);
    onSelect(effective);
    // Immediately proceed to next step
    onProceed?.();
  };

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
                : "bg-muted text-muted-foreground hover:bg-muted/80"
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

      {/* Services list — expandable cards */}
      <div className="grid gap-3">
        {filteredServices.map((service, index) => {
          const isExpanded = expandedServiceId === service.id;
          const selectedVariantId = selectedVariants[service.id];
          const selectedVariant = service.variants?.find(v => v.id === selectedVariantId);
          const displayPrice = selectedVariant?.price ?? service.price;
          const displayDuration = selectedVariant?.duration ?? service.duration;
          const thumbnailUrl = service.image;

          return (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={cn(
                "rounded-2xl border-2 overflow-hidden transition-all duration-200",
                isExpanded
                  ? "border-primary/30 shadow-lg"
                  : "border-border hover:border-primary/20 hover:shadow-sm"
              )}
            >
              {/* ── HEADER (always visible) ── */}
              <button
                onClick={() => {
                  // Services without variants: single click = select & proceed
                  if (!service.variants || service.variants.length === 0) {
                    handleServiceSelect(service);
                    return;
                  }
                  // Services with variants: toggle expand
                  setExpandedServiceId(isExpanded ? null : service.id);
                }}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  {(service.hasVideo || service.video) && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-3 h-3 text-foreground ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm leading-tight">{service.name}</p>
                    {service.badge && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                        service.badge === "Hit" && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
                        service.badge === "Premium" && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                        service.badge === "Nowość" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                      )}>
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {displayDuration} min
                    </span>
                    {service.variants && service.variants.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {service.variants.length} wariantów
                      </span>
                    )}
                    {selectedVariant && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {selectedVariant.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-bold text-base">{displayPrice} zł</p>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </button>

              {/* ── EXPANDED CONTENT ── */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border">
                      {/* Multimedia — video or large image */}
                      <div className="relative w-full aspect-video bg-muted">
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
                        ) : thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : null}
                        {service.video && (
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-lg">
                              ▶ Wideo zabiegu
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {service.description}
                        </p>

                        {/* Benefits */}
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {service.benefits.map((b, i) => (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-full font-medium"
                              >
                                <Check className="w-3 h-3" />
                                {b}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Variants — click variant = select & proceed */}
                        {service.variants && service.variants.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                              Wybierz wariant
                            </p>
                            <div className="space-y-2">
                              {service.variants.map(variant => (
                                <button
                                  key={variant.id}
                                  onClick={() => {
                                    setSelectedVariants(prev => ({
                                      ...prev,
                                      [service.id]: variant.id,
                                    }));
                                    // Immediately select with this variant and proceed
                                    const effective: Service = {
                                      ...service,
                                      duration: variant.duration,
                                      price: variant.price,
                                      selectedVariantName: variant.name,
                                    };
                                    onSelect(effective);
                                    onProceed?.();
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left hover:border-primary/50 hover:bg-primary/5",
                                    selectedVariantId === variant.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                      selectedVariantId === variant.id
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                    )}>
                                      {selectedVariantId === variant.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">{variant.name}</p>
                                      {variant.description && (
                                        <p className="text-xs text-muted-foreground">{variant.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-sm">{variant.price} zł</p>
                                    <p className="text-xs text-muted-foreground">{variant.duration} min</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Brak usług w tej kategorii</p>
          <p className="text-sm">Spróbuj wybrać inną kategorię lub filtr</p>
        </div>
      )}

    </div>
  );
}

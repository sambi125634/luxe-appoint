import { useState, useRef, useEffect } from "react";
import { useClientAppMode } from "@/hooks/useClientAppMode";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientAppHeader } from "./ClientAppHeader";
import { StatsSection } from "./sections/StatsSection";
import { HeroSection } from "./sections/HeroSection";
import { PushSection } from "./sections/PushSection";
import { ConfigOverviewSection } from "./sections/ConfigOverviewSection";
import { MobilePreview } from "./preview/MobilePreview";
import { DEMO_BRANDING } from "./demo/demoData";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientAppPageProps {
  onNavigate?: (tab: string, settingsTab?: string) => void;
}

const NAV_ITEMS = [
  { id: "stats", label: "Statystyki" },
  { id: "hero", label: "Zdjęcie powitalne" },
  { id: "push", label: "Push" },
  { id: "config", label: "Podgląd konfiguracji" },
];

export default function ClientAppPage({ onNavigate }: ClientAppPageProps = {}) {
  const { salonId, isLoading: salonLoading } = useSalonId();
  const { isDemo, appUsers, isLoading: modeLoading } = useClientAppMode(salonId);
  const [splashUrl, setSplashUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("stats");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: salonMeta } = useQuery({
    queryKey: ["salon-meta-app", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase
        .from("salons")
        .select("slug, name, description, theme_primary_color, logo_url")
        .eq("id", salonId)
        .maybeSingle();
      return data;
    },
    enabled: !!salonId,
  });

  const salonSlug = salonMeta?.slug ?? null;

  const previewConfig = isDemo
    ? {
        primary_color: DEMO_BRANDING.primary_color,
        salon_name: DEMO_BRANDING.salon_name,
        description: DEMO_BRANDING.description,
        logo_url: splashUrl,
      }
    : {
        primary_color: salonMeta?.theme_primary_color ?? DEMO_BRANDING.primary_color,
        salon_name: salonMeta?.name ?? DEMO_BRANDING.salon_name,
        description: salonMeta?.description ?? "",
        logo_url: splashUrl ?? salonMeta?.logo_url ?? null,
      };

  // Intersection observer for active section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [salonLoading, modeLoading]);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (salonLoading || modeLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left — main content */}
      <div className="flex-1 min-w-0 space-y-6 pb-10">
        <ClientAppHeader isDemo={isDemo} appUsers={appUsers} salonSlug={salonSlug} />

        {/* Section nav */}
        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-sm py-2 -mx-1 px-1 border-b">
          <div className="flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div id="stats" ref={(el) => { sectionRefs.current.stats = el; }}>
          <StatsSection isDemo={isDemo} salonId={salonId} />
        </div>
        <div id="hero" ref={(el) => { sectionRefs.current.hero = el; }}>
          <HeroSection isDemo={isDemo} salonId={salonId} onSplashChange={setSplashUrl} />
        </div>
        <div id="push" ref={(el) => { sectionRefs.current.push = el; }}>
          <PushSection isDemo={isDemo} salonId={salonId} />
        </div>
        <div id="config" ref={(el) => { sectionRefs.current.config = el; }}>
          <ConfigOverviewSection isDemo={isDemo} salonId={salonId} onNavigate={onNavigate} />
        </div>
      </div>

      {/* Right — phone preview (hidden on smaller screens) */}
      <div className="w-80 flex-shrink-0 hidden xl:block">
        <div className="sticky top-24">
          <MobilePreview config={previewConfig} isDemo={isDemo} />
        </div>
      </div>
    </div>
  );
}

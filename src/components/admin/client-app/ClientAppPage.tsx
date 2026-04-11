import { useState, useRef, useEffect } from "react";
import { useClientAppMode } from "@/hooks/useClientAppMode";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientAppHeader } from "./ClientAppHeader";
import { StatsSection } from "./sections/StatsSection";
import { BrandingSection } from "./sections/BrandingSection";
import { GallerySection } from "./sections/GallerySection";
import { LoyaltySection } from "./sections/LoyaltySection";
import { CommunicationSection } from "./sections/CommunicationSection";
import { BookingRulesSection } from "./sections/BookingRulesSection";
import { MobilePreview } from "./preview/MobilePreview";
import { DEMO_BRANDING } from "./demo/demoData";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { id: "stats", label: "Statystyki" },
  { id: "branding", label: "Wygląd" },
  { id: "gallery", label: "Galeria" },
  { id: "loyalty", label: "Lojalność" },
  { id: "communication", label: "Powiadomienia" },
  { id: "booking", label: "Ustawienia" },
];

export default function ClientAppPage() {
  const { salonId, isLoading: salonLoading } = useSalonId();
  const { isDemo, appUsers, isLoading: modeLoading } = useClientAppMode(salonId);
  const [previewConfig, setPreviewConfig] = useState(DEMO_BRANDING);
  const [activeSection, setActiveSection] = useState("stats");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: salonSlug } = useQuery({
    queryKey: ["salon-slug-app", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase.from("salons").select("slug").eq("id", salonId).single();
      return data?.slug ?? null;
    },
    enabled: !!salonId,
  });

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
        <div id="branding" ref={(el) => { sectionRefs.current.branding = el; }}>
          <BrandingSection isDemo={isDemo} salonId={salonId} onConfigChange={setPreviewConfig} />
        </div>
        <div id="gallery" ref={(el) => { sectionRefs.current.gallery = el; }}>
          <GallerySection isDemo={isDemo} salonId={salonId} />
        </div>
        <div id="loyalty" ref={(el) => { sectionRefs.current.loyalty = el; }}>
          <LoyaltySection isDemo={isDemo} salonId={salonId} />
        </div>
        <div id="communication" ref={(el) => { sectionRefs.current.communication = el; }}>
          <CommunicationSection isDemo={isDemo} salonId={salonId} />
        </div>
        <div id="booking" ref={(el) => { sectionRefs.current.booking = el; }}>
          <BookingRulesSection isDemo={isDemo} salonId={salonId} />
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

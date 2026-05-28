import { useState } from "react";
import { useClientAppMode } from "@/hooks/useClientAppMode";
import { useSalonId } from "@/hooks/useSalonId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PhonePreview } from "./preview/PhonePreview";
import { MarkaTab } from "./tabs/MarkaTab";
import { KomunikacjaTab } from "./tabs/KomunikacjaTab";
import { LojalnosciowyTab } from "./tabs/LojalnosciowyTab";
import { GaleriaTab } from "./tabs/GaleriaTab";
import { BroadcastTab } from "./tabs/BroadcastTab";
import { StatystykiTab } from "./tabs/StatystykiTab";
import { LinkQRTab } from "./tabs/LinkQRTab";

export interface BrandState {
  salonName: string;
  logoUrl: string | null;
  coverUrl: string | null;
  brandColor: string;
  description: string;
  instagram: string;
}

type TabId = "marka" | "komunikacja" | "lojalnosciowy" | "galeria" | "broadcast" | "statystyki" | "link";

const TABS: { id: TabId; label: string }[] = [
  { id: "marka", label: "Marka" },
  { id: "komunikacja", label: "Komunikacja" },
  { id: "lojalnosciowy", label: "Lojalnościowy" },
  { id: "galeria", label: "Galeria" },
  { id: "broadcast", label: "Broadcast" },
  { id: "statystyki", label: "Statystyki" },
  { id: "link", label: "Link & QR" },
];

const DEFAULT_BRAND: BrandState = {
  salonName: "Helena Milewska Kosmetologia",
  logoUrl: null,
  coverUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  brandColor: "#7c3aed",
  description: "Gabinet kosmetyczny w sercu Warszawy. Specjalizujemy się w manicure hybrydowym i zabiegach pielęgnacyjnych twarzy. 💜",
  instagram: "helena_milewska_kosmetologia",
};

export default function ClientAppPage(_props: { onNavigate?: (tab: string, settingsTab?: string) => void } = {}) {
  const { salonId, isLoading: salonLoading } = useSalonId();
  const { isDemo, isLoading: modeLoading } = useClientAppMode(salonId);
  const [activeTab, setActiveTab] = useState<TabId>("marka");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [brand, setBrand] = useState<BrandState>(DEFAULT_BRAND);
  const [pointsName, setPointsName] = useState("Punkty Piękności");

  const { data: salonMeta } = useQuery({
    queryKey: ["salon-meta-app", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase
        .from("salons")
        .select("slug, name, description, theme_primary_color, logo_url")
        .eq("id", salonId)
        .maybeSingle();
      if (data && !isDemo) {
        setBrand((b) => ({
          ...b,
          salonName: data.name ?? b.salonName,
          description: data.description ?? b.description,
          brandColor: data.theme_primary_color ?? b.brandColor,
          logoUrl: data.logo_url ?? b.logoUrl,
        }));
      }
      return data;
    },
    enabled: !!salonId,
  });

  const salonSlug = salonMeta?.slug ?? null;

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

  const previewConfig = {
    salonName: brand.salonName,
    logoUrl: brand.logoUrl,
    coverUrl: brand.coverUrl,
    brandColor: brand.brandColor,
    description: brand.description,
    pointsName,
  };

  return (
    <div className="flex gap-6 relative">
      {/* LEFT */}
      <div className="flex-1 min-w-0 space-y-6 pb-24 lg:pb-10">
        {/* Tab pills */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm -mx-1 px-1 py-3 border-b">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "marka" && <MarkaTab brand={brand} setBrand={setBrand} isDemo={isDemo} />}
            {activeTab === "komunikacja" && <KomunikacjaTab />}
            {activeTab === "lojalnosciowy" && (
              <LojalnosciowyTab pointsName={pointsName} setPointsName={setPointsName} brandColor={brand.brandColor} />
            )}
            {activeTab === "galeria" && <GaleriaTab />}
            {activeTab === "broadcast" && <BroadcastTab />}
            {activeTab === "statystyki" && <StatystykiTab />}
            {activeTab === "link" && <LinkQRTab salonSlug={salonSlug} salonName={brand.salonName} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT — desktop phone preview */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <div className="sticky top-6">
          <PhonePreview config={previewConfig} />
        </div>
      </div>

      {/* Floating mobile preview button */}
      <button
        onClick={() => setMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Smartphone className="w-4 h-4" /> Podgląd
      </button>

      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="max-w-sm p-4">
          <button
            onClick={() => setMobilePreviewOpen(false)}
            className="absolute top-3 right-3 p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4" />
          </button>
          <PhonePreview config={previewConfig} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

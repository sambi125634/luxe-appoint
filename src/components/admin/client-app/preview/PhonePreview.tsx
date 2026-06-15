import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhonePreviewConfig {
  salonName: string;
  logoUrl: string | null;
  coverUrl: string | null;
  brandColor: string;
  description: string;
  pointsName: string;
}

interface PhonePreviewProps {
  // Kept for backwards compatibility — iframe ładuje branding bezpośrednio z bazy demo-salon.
  config?: PhonePreviewConfig;
}

type TabId = "foryou" | "bookings" | "profile";

const TABS: { id: TabId; label: string; path: string }[] = [
  { id: "foryou", label: "Dla Ciebie", path: "/app/for-you?preview=true" },
  { id: "bookings", label: "Wizyty", path: "/app/bookings?preview=true" },
  { id: "profile", label: "Profil salonu", path: "/s/demo-salon" },
];

// Phone frame ~280px wide, iframe renderuje się w viewport 390×808.
const IFRAME_W = 390;
const IFRAME_H = 808;
const FRAME_INNER_W = 264;
const SCALE = FRAME_INNER_W / IFRAME_W;
const FRAME_INNER_H = Math.round(IFRAME_H * SCALE);

export function PhonePreview(_props: PhonePreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("foryou");
  const [refreshKey, setRefreshKey] = useState(0);

  const tab = TABS.find((t) => t.id === activeTab)!;
  const src = `${tab.path}${tab.path.includes("?") ? "&" : "?"}t=${refreshKey}`;

  return (
    <div className="space-y-3">
      {/* Tab toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-full text-[11px]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex-1 py-1.5 rounded-full font-medium transition-all whitespace-nowrap",
              activeTab === t.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Phone frame */}
      <div
        className="relative mx-auto rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
        style={{ width: 280, height: FRAME_INNER_H + 28 }}
      >
        {/* Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 w-20 h-5 bg-gray-800 rounded-full" />

        <div
          className="relative w-full h-full bg-white overflow-hidden"
          style={{ paddingTop: 24 }}
        >
          <div
            className="overflow-hidden"
            style={{ width: FRAME_INNER_W, height: FRAME_INNER_H, marginLeft: "auto", marginRight: "auto" }}
          >
            <iframe
              key={`${activeTab}-${refreshKey}`}
              src={src}
              title="Podgląd aplikacji klienta"
              className="border-0 bg-white"
              style={{
                width: IFRAME_W,
                height: IFRAME_H,
                transform: `scale(${SCALE})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Podgląd na żywo
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          title="Odśwież podgląd"
        >
          <RefreshCw className="w-3 h-3" />
          Odśwież
        </button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">Tak widzą Cię Twoje klientki</p>
    </div>
  );
}
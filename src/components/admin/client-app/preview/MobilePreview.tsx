import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobilePreviewProps {
  config: {
    primary_color: string;
    salon_name: string;
    description: string;
    logo_url: string | null;
  };
  isDemo: boolean;
}

const TAB_ROUTES: Record<string, string> = {
  profile: "/s/demo-salon",
  foryou: "/app/for-you?preview=true",
  bookings: "/app/bookings?preview=true",
};

const IFRAME_W = 390;
const IFRAME_H = 844;
const FRAME_W = 280;
const SCALE = FRAME_W / IFRAME_W; // ~0.718
const FRAME_H = Math.round(IFRAME_H * SCALE);

export function MobilePreview({ config }: MobilePreviewProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = `${TAB_ROUTES[activeTab]}${TAB_ROUTES[activeTab].includes("?") ? "&" : "?"}t=${refreshKey}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs text-muted-foreground">Podgląd na żywo</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setRefreshKey((k) => k + 1)}
          title="Odśwież podgląd"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="text-xs flex-1">Profil</TabsTrigger>
          <TabsTrigger value="foryou" className="text-xs flex-1">Dla Ciebie</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs flex-1">Wizyty</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ width: FRAME_W }}>
        <div
          className="rounded-[32px] border-[6px] border-foreground/80 bg-background overflow-hidden shadow-lg"
          style={{ height: FRAME_H + 40 /* notch space */ }}
        >
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-20 h-5 bg-foreground/80 rounded-full" />
          </div>

          {/* Iframe container */}
          <div
            className="overflow-hidden"
            style={{
              width: FRAME_W - 12,
              height: FRAME_H,
            }}
          >
            <iframe
              ref={iframeRef}
              key={`${activeTab}-${refreshKey}`}
              src={src}
              title="Podgląd aplikacji"
              className="border-0"
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
    </div>
  );
}

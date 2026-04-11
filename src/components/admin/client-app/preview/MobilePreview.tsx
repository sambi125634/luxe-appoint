import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Heart } from "lucide-react";

interface MobilePreviewProps {
  config: {
    primary_color: string;
    salon_name: string;
    description: string;
    logo_url: string | null;
  };
  isDemo: boolean;
}

export function MobilePreview({ config, isDemo }: MobilePreviewProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const initials = config.salon_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
        <span className="text-xs text-muted-foreground">Podgląd na żywo</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="text-xs flex-1">Profil</TabsTrigger>
          <TabsTrigger value="foryou" className="text-xs flex-1">Dla Ciebie</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs flex-1">Wizyty</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ width: 280 }}>
        <div className="rounded-[32px] border-[6px] border-foreground/80 bg-background overflow-hidden shadow-lg" style={{ height: 520 }}>
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-20 h-5 bg-foreground/80 rounded-full" />
          </div>

          {/* Content */}
          <div className="px-3 overflow-hidden" style={{ height: 480 }}>
            {activeTab === "profile" && (
              <div className="space-y-3">
                {/* Header */}
                <div className="rounded-xl p-4 text-white" style={{ backgroundColor: config.primary_color }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{config.salon_name}</p>
                      <p className="text-[10px] opacity-80 line-clamp-1">{config.description}</p>
                    </div>
                  </div>
                </div>

                {/* Mini gallery */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100",
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100",
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100",
                  ].map((url, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: config.primary_color }}
                >
                  Zarezerwuj wizytę
                </button>

                {/* Services preview */}
                <div className="space-y-1.5">
                  {["Manicure hybrydowy", "Stylizacja rzęs"].map((s) => (
                    <div key={s} className="flex justify-between items-center p-2 rounded-lg border text-xs">
                      <span>{s}</span>
                      <span className="font-semibold" style={{ color: config.primary_color }}>120 zł</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "foryou" && (
              <div className="space-y-3 pt-2">
                <p className="font-semibold text-sm">Dla Ciebie ✨</p>

                {/* Loyalty ring */}
                <div className="flex items-center gap-3 p-3 rounded-xl border">
                  <div className="relative w-12 h-12">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke={config.primary_color}
                        strokeWidth="3"
                        strokeDasharray="94.2"
                        strokeDashoffset="37.7"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">6/10</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Karta lojalnościowa</p>
                    <p className="text-[10px] text-muted-foreground">Jeszcze 4 wizyty do nagrody</p>
                  </div>
                </div>

                {/* Reward preview */}
                <div className="p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" style={{ color: config.primary_color }} />
                    <p className="text-xs font-semibold">Darmowy manicure</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">300 punktów</p>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-3 pt-2">
                <p className="font-semibold text-sm">Twoje wizyty</p>
                <div className="rounded-xl border overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: config.primary_color }} />
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold">Manicure hybrydowy</p>
                    <p className="text-[10px] text-muted-foreground">Jutro, 14:00 — Anna K.</p>
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 text-[10px] py-1.5 rounded-lg border text-center">
                        Zmień termin
                      </button>
                      <button
                        className="flex-1 text-[10px] py-1.5 rounded-lg text-white text-center"
                        style={{ backgroundColor: config.primary_color }}
                      >
                        Szczegóły
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

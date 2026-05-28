import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Gift, MessageCircle } from "lucide-react";
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
  config: PhonePreviewConfig;
}

const DEMO_SERVICES = [
  { name: "Manicure hybrydowy", price: 120 },
  { name: "Pedicure", price: 100 },
  { name: "Oczyszczanie twarzy", price: 150 },
];

const DEMO_HISTORY = [
  { date: "20 maj", service: "Manicure hybrydowy" },
  { date: "2 maj", service: "Laminacja brwi" },
  { date: "12 kwi", service: "Manicure hybrydowy" },
];

export function PhonePreview({ config }: PhonePreviewProps) {
  const [view, setView] = useState<"new" | "regular">("new");
  const initials = config.salonName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-full text-xs">
        <button
          onClick={() => setView("new")}
          className={cn(
            "flex-1 py-1.5 rounded-full font-medium transition-all",
            view === "new" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          👤 Nowa
        </button>
        <button
          onClick={() => setView("regular")}
          className={cn(
            "flex-1 py-1.5 rounded-full font-medium transition-all",
            view === "regular" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
          )}
        >
          💜 Stała
        </button>
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden" style={{ width: 280, height: 580 }}>
        {/* Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 w-20 h-5 bg-gray-800 rounded-full" />

        <div className="relative w-full h-full bg-white overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {view === "new" ? (
              <motion.div
                key="new"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div
                  className="relative h-28 transition-all duration-300"
                  style={{
                    background: config.coverUrl
                      ? `url(${config.coverUrl}) center/cover`
                      : `linear-gradient(135deg, ${config.brandColor}, ${config.brandColor}CC)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                {/* Logo + Name */}
                <div className="px-3 -mt-6 relative z-10">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm bg-cover bg-center transition-all duration-300"
                    style={{
                      backgroundColor: config.logoUrl ? undefined : config.brandColor,
                      backgroundImage: config.logoUrl ? `url(${config.logoUrl})` : undefined,
                    }}
                  >
                    {!config.logoUrl && initials}
                  </div>
                  <h3 className="mt-2 font-bold text-sm text-gray-900 leading-tight transition-all duration-300">{config.salonName}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{config.description}</p>
                </div>
                {/* CTA */}
                <div className="px-3 mt-3">
                  <button
                    className="w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all duration-300"
                    style={{ backgroundColor: config.brandColor }}
                  >
                    Zarezerwuj wizytę
                  </button>
                </div>
                {/* Services */}
                <div className="px-3 mt-3 space-y-1.5 flex-1 overflow-y-auto">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Popularne usługi</p>
                  {DEMO_SERVICES.map((s) => (
                    <div key={s.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <span className="text-[11px] text-gray-700">{s.name}</span>
                      <span className="text-[11px] font-semibold" style={{ color: config.brandColor }}>{s.price} zł</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-3 pt-7 pb-2 flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs bg-cover bg-center"
                    style={{
                      backgroundColor: config.logoUrl ? undefined : config.brandColor,
                      backgroundImage: config.logoUrl ? `url(${config.logoUrl})` : undefined,
                    }}
                  >
                    {!config.logoUrl && initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 leading-tight">{config.salonName}</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Cześć, Aniu! 💜</p>
                  </div>
                </div>
                {/* Next appointment */}
                <div className="mx-3 mt-1 rounded-xl p-2.5 text-white transition-all duration-300" style={{ backgroundColor: config.brandColor }}>
                  <p className="text-[9px] opacity-80 uppercase font-semibold tracking-wide">Następna wizyta</p>
                  <p className="text-xs font-bold mt-0.5">Środa 4 czerwca, 15:00</p>
                  <p className="text-[10px] opacity-90">Manicure hybrydowy</p>
                </div>
                {/* Loyalty */}
                <div className="mx-3 mt-2 rounded-xl border border-gray-200 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-700">{config.pointsName}</span>
                    <span className="text-sm font-bold" style={{ color: config.brandColor }}>248 pkt</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: "49.6%", backgroundColor: config.brandColor }} />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">Następna nagroda: 500 pkt</p>
                </div>
                {/* History */}
                <div className="px-3 mt-2 flex-1 overflow-y-auto">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Historia wizyt</p>
                  {DEMO_HISTORY.map((h) => (
                    <div key={h.date} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                      <span className="text-[11px] text-gray-700">{h.service}</span>
                      <span className="text-[10px] text-gray-400">{h.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom nav */}
          <div className="border-t border-gray-200 bg-white flex justify-around py-1.5 px-2">
            {[
              { icon: Calendar, label: "Rezerwacje" },
              { icon: Sparkles, label: "Wizyty" },
              { icon: Gift, label: "Punkty" },
              { icon: MessageCircle, label: "Chat" },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <t.icon className="w-3.5 h-3.5" style={{ color: i === 0 ? config.brandColor : "#9CA3AF" }} />
                <span className="text-[8px]" style={{ color: i === 0 ? config.brandColor : "#9CA3AF" }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">Tak widzą Cię Twoje klientki</p>
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Ostatnia synchronizacja: właśnie teraz ✓
      </div>
    </div>
  );
}
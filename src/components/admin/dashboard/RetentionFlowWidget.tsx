import { useMemo } from "react";
import { motion } from "framer-motion";
import { useRetentionRadar } from "@/hooks/useRetention";
import { useSalonId } from "@/hooks/useSalonId";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";

interface RetentionFlowWidgetProps {
  onNavigate: (tab: string) => void;
  isDemo?: boolean;
}

const DEMO_ZONES = [
  {
    id: "active",
    label: "Aktywne",
    sublabel: "< 30 dni",
    count: 47,
    potential: 18800,
    color: "#22c55e",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    textColor: "#15803d",
    pulse: false,
    emoji: "🟢",
  },
  {
    id: "watch",
    label: "Uwaga",
    sublabel: "31–45 dni",
    count: 12,
    potential: 4800,
    color: "#eab308",
    bgColor: "#fefce8",
    borderColor: "#fef08a",
    textColor: "#854d0e",
    pulse: false,
    emoji: "🟡",
  },
  {
    id: "risk",
    label: "Ryzyko",
    sublabel: "46–60 dni",
    count: 8,
    potential: 3200,
    color: "#f97316",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    textColor: "#9a3412",
    pulse: false,
    emoji: "🟠",
  },
  {
    id: "critical",
    label: "Krytyczne",
    sublabel: "61–90 dni",
    count: 5,
    potential: 2000,
    color: "#ef4444",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    textColor: "#991b1b",
    pulse: true,
    emoji: "🔴",
  },
  {
    id: "lost",
    label: "Utracone",
    sublabel: "90+ dni",
    count: 3,
    potential: 1200,
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#e5e7eb",
    textColor: "#374151",
    pulse: true,
    emoji: "⚫",
  },
];

export function RetentionFlowWidget({
  onNavigate,
  isDemo = false,
}: RetentionFlowWidgetProps) {
  const { salonId } = useSalonId();
  const { data: radarClients = [] } = useRetentionRadar(
    isDemo ? undefined : salonId ?? undefined
  );

  const zones = useMemo(() => {
    if (isDemo) {
      return DEMO_ZONES;
    }

    const counts = {
      active: 0,
      watch: 0,
      risk: 0,
      critical: 0,
      lost: 0,
    };

    radarClients.forEach((c) => {
      if (c.days_inactive <= 30) counts.active++;
      else if (c.days_inactive <= 45) counts.watch++;
      else if (c.days_inactive <= 60) counts.risk++;
      else if (c.days_inactive <= 90) counts.critical++;
      else counts.lost++;
    });

    const avgVisitValue = 165;

    return DEMO_ZONES.map((zone) => ({
      ...zone,
      count: counts[zone.id as keyof typeof counts],
      potential: Math.round(
        counts[zone.id as keyof typeof counts] * avgVisitValue
      ),
    }));
  }, [radarClients, isDemo]);

  const totalAtRisk = zones
    .filter((z) => ["risk", "critical", "lost"].includes(z.id))
    .reduce((sum, z) => sum + z.count, 0);

  const totalPotential = zones
    .filter((z) => ["risk", "critical", "lost"].includes(z.id))
    .reduce((sum, z) => sum + z.potential, 0);

  const totalClients = zones.reduce((s, z) => s + z.count, 0);

  const retentionRate =
    totalClients > 0 ? Math.round((zones[0].count / totalClients) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card p-5 space-y-5"
    >
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground">
              Powracalność klientek
            </h3>
            <p className="text-xs text-muted-foreground">
              Gdzie są Twoje klientki teraz
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={cn(
              "text-2xl font-bold",
              retentionRate >= 70
                ? "text-green-600"
                : retentionRate >= 50
                ? "text-yellow-600"
                : "text-red-500"
            )}
          >
            {retentionRate}%
          </div>
          <p className="text-[10px] text-muted-foreground">wskaźnik powrotów</p>
        </div>
      </div>

      {/* ── FLOW ZONES ── */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex items-stretch gap-1.5 min-w-[600px]">
          {zones.map((zone, index) => (
            <div key={zone.id} className="flex items-center flex-1 min-w-0">
              {/* Zone card */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => onNavigate("retention")}
                className={cn(
                  "flex-1 rounded-xl border-2 p-3",
                  "cursor-pointer transition-all",
                  "text-left relative overflow-hidden",
                  "hover:shadow-md"
                )}
                style={{
                  backgroundColor: zone.bgColor,
                  borderColor: zone.borderColor,
                }}
              >
                {/* Pulsing ring for critical zones */}
                {zone.pulse && zone.count > 0 && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: `inset 0 0 12px 2px ${zone.color}33`,
                    }}
                  />
                )}

                {/* Zone label */}
                <div
                  className="text-xs font-bold"
                  style={{ color: zone.textColor }}
                >
                  {zone.label}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {zone.sublabel}
                </div>

                {/* Client count */}
                <motion.div
                  className="text-2xl font-black mt-1"
                  style={{ color: zone.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {zone.count}
                </motion.div>
                <div
                  className="text-[10px]"
                  style={{ color: zone.textColor, opacity: 0.7 }}
                >
                  klientek
                </div>

                {/* Recovery potential */}
                {zone.count > 0 && zone.id !== "active" && (
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: zone.borderColor }}>
                    <div
                      className="text-xs font-bold"
                      style={{ color: zone.textColor }}
                    >
                      +{zone.potential.toLocaleString("pl-PL")} zł
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      do odzyskania
                    </div>
                  </div>
                )}

                {/* Hover arrow */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: zone.color }} />
                </div>
              </motion.button>

              {/* Arrow between zones */}
              {index < zones.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="px-0.5 flex-shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PROPORTION BAR ── */}
      <div className="h-2 rounded-full overflow-hidden flex bg-muted">
        {zones.map((zone) => {
          const pct = totalClients > 0 ? (zone.count / totalClients) * 100 : 0;
          return (
            <motion.div
              key={zone.id}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              style={{ backgroundColor: zone.color }}
              title={`${zone.label}: ${zone.count} (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>

      {/* ── AI SUMMARY ── */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border",
          totalAtRisk > 0
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
            : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
        )}
      >
        <div className="flex-1">
          <p
            className={cn(
              "text-sm",
              totalAtRisk > 0
                ? "text-amber-800 dark:text-amber-200"
                : "text-green-800 dark:text-green-200"
            )}
          >
            {totalAtRisk > 0 ? (
              <>
                <span className="font-bold">{totalAtRisk} klientek</span> w
                strefach ryzyka — możesz odzyskać{" "}
                <span className="font-bold">
                  {totalPotential.toLocaleString("pl-PL")} zł
                </span>
                . Autopilot już pracuje.
              </>
            ) : (
              "Baza klientek w świetnej kondycji! Autopilot monitoruje powracalność."
            )}
          </p>
        </div>

        <button
          onClick={() => onNavigate("retention")}
          className={cn(
            "text-xs font-semibold px-3 py-1.5",
            "rounded-lg whitespace-nowrap",
            "flex items-center gap-1",
            "transition-colors",
            totalAtRisk > 0
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "bg-green-600 text-white hover:bg-green-700"
          )}
        >
          Zobacz retencję
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

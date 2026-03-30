import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Send, Clock, ArrowRight,
  Sparkles, CheckCircle2, Mail, Phone, TrendingUp, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRetentionRadar } from "@/hooks/useRetention";

/* ── ZONES ── */
const ZONES = [
  {
    id: "active", label: "Aktywne", sublabel: "< 30 dni",
    color: "#22c55e", bgColor: "#f0fdf4", borderColor: "#bbf7d0", textColor: "#15803d",
    actionLabel: null, emptyMessage: "Wszystkie klientki aktywne 🎉",
  },
  {
    id: "watch", label: "Uwaga", sublabel: "31–45 dni",
    color: "#eab308", bgColor: "#fefce8", borderColor: "#fef08a", textColor: "#854d0e",
    actionLabel: "Przypomnij o wizycie", emptyMessage: "Brak klientek w tej strefie",
  },
  {
    id: "risk", label: "Ryzyko", sublabel: "46–60 dni",
    color: "#f97316", bgColor: "#fff7ed", borderColor: "#fed7aa", textColor: "#9a3412",
    actionLabel: "Wyślij reaktywację", emptyMessage: "Brak klientek w tej strefie",
  },
  {
    id: "critical", label: "Krytyczne", sublabel: "61–90 dni",
    color: "#ef4444", bgColor: "#fef2f2", borderColor: "#fecaca", textColor: "#991b1b",
    actionLabel: "Wyślij ofertę powrotu", emptyMessage: "Brak klientek w tej strefie",
  },
  {
    id: "lost", label: "Utracone", sublabel: "90+ dni",
    color: "#6b7280", bgColor: "#f9fafb", borderColor: "#e5e7eb", textColor: "#374151",
    actionLabel: "Ostatnia szansa", emptyMessage: "Brak klientek w tej strefie",
  },
] as const;

type ZoneId = typeof ZONES[number]["id"];

interface DemoClient {
  id: string;
  name: string;
  initials: string;
  days: number;
  lastService: string;
  phone: string;
}

const DEMO_CLIENTS: Record<ZoneId, DemoClient[]> = {
  active: [
    { id: "1", name: "Anna Kowalska", initials: "AK", days: 5, lastService: "Manicure hybrydowy", phone: "+48 500 123 456" },
    { id: "2", name: "Kasia Wiśniewska", initials: "KW", days: 12, lastService: "Pedicure klasyczny", phone: "+48 501 234 567" },
    { id: "3", name: "Joanna Lewandowska", initials: "JL", days: 18, lastService: "Masaż relaksacyjny", phone: "+48 502 345 678" },
    { id: "4", name: "Marta Szymańska", initials: "MS", days: 22, lastService: "Mezoterapia igłowa", phone: "+48 503 456 789" },
    { id: "5", name: "Paulina Zielińska", initials: "PZ", days: 28, lastService: "Stylizacja brwi", phone: "+48 504 567 890" },
  ],
  watch: [
    { id: "6", name: "Maria Nowak", initials: "MN", days: 35, lastService: "Manicure hybrydowy", phone: "+48 505 678 901" },
    { id: "7", name: "Agnieszka Lis", initials: "AL", days: 38, lastService: "Laminacja rzęs", phone: "+48 506 789 012" },
    { id: "8", name: "Natalia Wójcik", initials: "NW", days: 42, lastService: "Peeling kawitacyjny", phone: "+48 507 890 123" },
    { id: "9", name: "Izabela Kamińska", initials: "IK", days: 44, lastService: "Manicure hybrydowy", phone: "+48 508 901 234" },
  ],
  risk: [
    { id: "10", name: "Monika Kowalczyk", initials: "MK", days: 48, lastService: "Mezoterapia igłowa", phone: "+48 509 012 345" },
    { id: "11", name: "Dorota Mazur", initials: "DM", days: 52, lastService: "Masaż relaksacyjny", phone: "+48 510 123 456" },
    { id: "12", name: "Barbara Piotrowska", initials: "BP", days: 57, lastService: "Pedicure klasyczny", phone: "+48 511 234 567" },
  ],
  critical: [
    { id: "13", name: "Ewa Stępień", initials: "ES", days: 65, lastService: "Laminacja brwi", phone: "+48 512 345 678" },
    { id: "14", name: "Dagmara Krawczyk", initials: "DK", days: 78, lastService: "Manicure hybrydowy", phone: "+48 513 456 789" },
  ],
  lost: [
    { id: "15", name: "Renata Grabowska", initials: "RG", days: 95, lastService: "Peeling kawitacyjny", phone: "+48 514 567 890" },
  ],
};

const DEMO_FEED = [
  { id: "1", type: "booked", clientName: "Marta K.", action: "zarezerwowała wizytę", detail: "Manicure hybrydowy — wtorek 10:00", channel: "sms", daysAgo: 0, revenue: 120, sequenceLabel: "Reaktywacja 45 dni" },
  { id: "2", type: "clicked", clientName: "Ewa S.", action: "kliknęła link rezerwacji", detail: "52 dni nieaktywna", channel: "email", daysAgo: 0, revenue: null, sequenceLabel: "Reaktywacja 45 dni" },
  { id: "3", type: "opened", clientName: "Agnieszka L.", action: "otworzyła wiadomość", detail: "45 dni nieaktywna", channel: "sms", daysAgo: 0, revenue: null, sequenceLabel: "Reaktywacja 45 dni" },
  { id: "4", type: "sent", clientName: "Monika K.", action: "wysłano reaktywację", detail: "75 dni nieaktywna", channel: "email", daysAgo: 1, revenue: null, sequenceLabel: "Oferta powrotu 75 dni" },
  { id: "5", type: "booked", clientName: "Natalia W.", action: "zarezerwowała wizytę", detail: "Mezoterapia igłowa — środa 14:00", channel: "email", daysAgo: 1, revenue: 280, sequenceLabel: "Reaktywacja 60 dni" },
  { id: "6", type: "sent", clientName: "Dagmara K.", action: "wysłano ostatnią szansę", detail: "78 dni nieaktywna", channel: "sms", daysAgo: 2, revenue: null, sequenceLabel: "Ostatnia szansa 90 dni" },
];

/* ── COMPONENT ── */

interface RetentionOverviewProps {
  salonId?: string;
  isDemo?: boolean;
}

export function RetentionOverview({ salonId, isDemo = false }: RetentionOverviewProps) {
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null);
  const [sentClients, setSentClients] = useState<Set<string>>(new Set());

  const clients: Record<ZoneId, DemoClient[]> = isDemo
    ? DEMO_CLIENTS
    : { active: [], watch: [], risk: [], critical: [], lost: [] };

  const feed = isDemo ? DEMO_FEED : [];

  const total = useMemo(
    () => Object.values(clients).reduce((s, arr) => s + arr.length, 0),
    [clients]
  );
  const totalAtRisk = clients.risk.length + clients.critical.length + clients.lost.length;
  const totalPotential = totalAtRisk * 165;
  const returnRate = total > 0 ? Math.round((clients.active.length / total) * 100) : 0;

  const markSent = (clientId: string) => {
    setSentClients((prev) => new Set([...prev, clientId]));
  };

  return (
    <div className="space-y-6">
      {/* ── SEKCJA 1: MINI FLOW ── */}
      <div className="rounded-2xl border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Powracalność klientek
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kliknij strefę aby zobaczyć szczegóły i wysłać reaktywację
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">{returnRate}%</span>
            <p className="text-xs text-muted-foreground">wskaźnik powrotów</p>
          </div>
        </div>

        {/* Zone cards */}
        <div className="flex items-stretch gap-2">
          {ZONES.map((zone, i) => {
            const zoneClients = clients[zone.id];
            const count = zoneClients.length;
            const isActive = activeZone === zone.id;

            return (
              <div key={zone.id} className="flex items-center gap-2 flex-1 min-w-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveZone(isActive ? null : zone.id)}
                  className={cn(
                    "w-full rounded-xl border-2 p-3 transition-all text-left hover:shadow-sm",
                    isActive ? "shadow-md scale-[1.02]" : ""
                  )}
                  style={{
                    backgroundColor: isActive ? zone.bgColor : "transparent",
                    borderColor: isActive ? zone.color : "hsl(var(--border))",
                  }}
                >
                  <p className="text-xs font-semibold truncate" style={{ color: zone.textColor }}>
                    {zone.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{zone.sublabel}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: zone.color }}>
                    {count}
                  </p>
                  <p className="text-[10px] text-muted-foreground">klientek</p>
                </motion.button>
                {i < ZONES.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Proportion bar */}
        <div className="h-2 rounded-full overflow-hidden flex bg-muted">
          {ZONES.map((zone) => {
            const count = clients[zone.id].length;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={zone.id} className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: zone.color }} />
            );
          })}
        </div>

        {/* AI summary */}
        {totalAtRisk > 0 && (
          <div className="flex items-center justify-between gap-4 bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-sm">
              <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
              <strong>{totalAtRisk} klientek</strong> w strefach ryzyka — możesz odzyskać{" "}
              <strong>{totalPotential.toLocaleString("pl-PL")} zł</strong>. Autopilot już pracuje.
            </p>
            <Button size="sm" variant="default" onClick={() => setActiveZone("critical")}>
              Zacznij od krytycznych
            </Button>
          </div>
        )}
      </div>

      {/* ── SEKCJA 2: STREFY Z IMIONAMI ── */}
      <div className="space-y-3">
        {ZONES.map((zone) => {
          const zoneClients = clients[zone.id];
          const isExpanded = activeZone === zone.id || (activeZone === null && zone.id !== "active");

          return (
            <div key={zone.id} className="rounded-2xl border overflow-hidden bg-card">
              {/* Header */}
              <button
                onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: zone.bgColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: zone.textColor }}>
                        {zone.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{zone.sublabel}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {zoneClients.length} klientek
                      </Badge>
                    </div>
                    {zone.id !== "active" && zoneClients.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Potencjał odzysku:{" "}
                        <strong className="text-foreground">
                          +{(zoneClients.length * 165).toLocaleString("pl-PL")} zł
                        </strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {zone.actionLabel && zoneClients.length > 0 && (
                    <Badge variant="outline" className="text-[10px] hidden sm:flex">
                      {zone.actionLabel} dla wszystkich
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Client list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 pt-2">
                      {zoneClients.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {zone.emptyMessage}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {zoneClients.map((client, i) => {
                            const isSent = sentClients.has(client.id);
                            return (
                              <motion.div
                                key={client.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-3 p-3 rounded-xl border bg-background hover:shadow-sm transition-shadow"
                              >
                                {/* Avatar */}
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                  style={{ backgroundColor: zone.bgColor, color: zone.textColor }}
                                >
                                  {client.initials}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{client.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{client.days} dni temu</span>
                                    <span>·</span>
                                    <span className="truncate">Ostatnio: {client.lastService}</span>
                                  </p>
                                </div>

                                {/* Actions */}
                                {zone.actionLabel && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {isSent ? (
                                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Wysłano
                                      </span>
                                    ) : (
                                      <>
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2" onClick={() => markSent(client.id)}>
                                          <Phone className="w-3 h-3" />
                                          SMS
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2" onClick={() => markSent(client.id)}>
                                          <Mail className="w-3 h-3" />
                                          Email
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── SEKCJA 3: CO AUTOPILOT ZROBIŁ ── */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-3" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--primary) / 0.1))" }}>
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm">Co Autopilot zrobił</h3>
            <p className="text-xs text-muted-foreground">Ostatnie akcje reaktywacyjne</p>
          </div>
        </div>

        <div className="divide-y">
          {feed.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-5 py-3"
            >
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                item.type === "booked" ? "bg-green-100 text-green-600" :
                item.type === "clicked" ? "bg-blue-100 text-blue-600" :
                item.type === "opened" ? "bg-yellow-100 text-yellow-600" :
                "bg-gray-100 text-gray-500"
              )}>
                {item.type === "booked" && <CheckCircle2 className="w-4 h-4" />}
                {item.type === "clicked" && <ArrowRight className="w-4 h-4" />}
                {item.type === "opened" && <Mail className="w-4 h-4" />}
                {item.type === "sent" && <Send className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong>{item.clientName}</strong>{" "}
                  <span className="text-muted-foreground">{item.action}</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <span>{item.detail}</span>
                  <span>·</span>
                  <span>{item.channel === "sms" ? "📱 SMS" : "📧 Email"}</span>
                  <span>·</span>
                  <span>{item.daysAgo === 0 ? "dziś" : `${item.daysAgo} dni temu`}</span>
                </p>
              </div>

              {/* Revenue */}
              {item.revenue && (
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-600">+{item.revenue} zł</p>
                  <p className="text-[10px] text-muted-foreground">odzyskano</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Total recovered */}
        <div className="px-5 py-4 border-t bg-muted/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Łącznie odzyskano w ostatnich 30 dniach</p>
          <p className="text-lg font-bold text-green-600">
            +{feed.filter((f) => f.revenue).reduce((s, f) => s + (f.revenue || 0), 0).toLocaleString("pl-PL")} zł
          </p>
        </div>
      </div>
    </div>
  );
}

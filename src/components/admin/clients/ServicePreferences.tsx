import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown, ChevronUp, TrendingUp, Users, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Visit {
  id: string;
  date: string;
  service: string;
  category: string;
  status: "completed" | "cancelled" | "no-show";
  price: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  lastVisit?: string;
  totalSpent: number;
  visits: Visit[];
}

interface ServicePreferencesProps {
  clients: Client[];
  onSelectClient?: (clientId: string) => void;
}

interface CategoryData {
  category: string;
  clientCount: number;
  totalRevenue: number;
  totalVisits: number;
  avgVisitsPerClient: number;
  sharePercent: number;
  dormantCount: number;
  clients: {
    id: string;
    firstName: string;
    lastName: string;
    visits: number;
    spent: number;
    lastVisit: string | null;
    topService: string;
  }[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  "Mezoterapia": "💉",
  "Manicure & Pedicure": "💅",
  "Zabiegi na twarz": "✨",
  "Lifting": "🔬",
  "Depilacja": "🌿",
  "Konsultacje": "📋",
  "Masaż": "💆",
  "Brwi i rzęsy": "👁️",
  "Makijaż": "💄",
  "Kosmetyka": "🧴",
  "Fryzjerstwo": "✂️",
};

function getEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || "💎";
}

function getDaysAgo(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil(Math.abs(now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function ServicePreferences({ clients, onSelectClient }: ServicePreferencesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories: CategoryData[] = useMemo(() => {
    const map = new Map<string, {
      clients: Map<string, { visits: number; spent: number; lastVisit: string | null; services: Map<string, number>; client: Client }>;
      totalVisits: number;
      totalRevenue: number;
    }>();

    clients.forEach(client => {
      const completedVisits = client.visits.filter(v => v.status === "completed" && v.category);
      completedVisits.forEach(visit => {
        if (!map.has(visit.category)) {
          map.set(visit.category, { clients: new Map(), totalVisits: 0, totalRevenue: 0 });
        }
        const cat = map.get(visit.category)!;
        cat.totalVisits += 1;
        cat.totalRevenue += visit.price;

        if (!cat.clients.has(client.id)) {
          cat.clients.set(client.id, { visits: 0, spent: 0, lastVisit: null, services: new Map(), client });
        }
        const cc = cat.clients.get(client.id)!;
        cc.visits += 1;
        cc.spent += visit.price;
        if (!cc.lastVisit || visit.date > cc.lastVisit) cc.lastVisit = visit.date;
        cc.services.set(visit.service, (cc.services.get(visit.service) || 0) + 1);
      });
    });

    const grandTotalRevenue = Array.from(map.values()).reduce((s, c) => s + c.totalRevenue, 0) || 1;

    return Array.from(map.entries())
      .map(([category, data]) => {
        const clientsList = Array.from(data.clients.entries()).map(([id, cc]) => {
          const topServiceEntry = Array.from(cc.services.entries()).sort((a, b) => b[1] - a[1])[0];
          return {
            id,
            firstName: cc.client.firstName,
            lastName: cc.client.lastName,
            visits: cc.visits,
            spent: cc.spent,
            lastVisit: cc.lastVisit,
            topService: topServiceEntry?.[0] || "—",
          };
        }).sort((a, b) => b.spent - a.spent);

        const dormantCount = clientsList.filter(c => {
          const days = getDaysAgo(c.lastVisit);
          return days !== null && days > 60;
        }).length;

        return {
          category,
          clientCount: clientsList.length,
          totalRevenue: data.totalRevenue,
          totalVisits: data.totalVisits,
          avgVisitsPerClient: clientsList.length > 0 ? data.totalVisits / clientsList.length : 0,
          sharePercent: Math.round((data.totalRevenue / grandTotalRevenue) * 100),
          dormantCount,
          clients: clientsList,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [clients]);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Brak danych o preferencjach — dodaj wizyty z kategoriami usług</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <p className="text-sm text-muted-foreground">
          Grupowanie klientek wg ulubionych kategorii usług • {categories.length} kategorii • {clients.length} klientek
        </p>
      </div>

      {categories.map((cat, idx) => {
        const isExpanded = expandedCategory === cat.category;

        return (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={cn(
                "transition-all cursor-pointer hover:shadow-md",
                isExpanded && "ring-1 ring-primary/30"
              )}
            >
              <CardContent className="p-0">
                {/* Category header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <span className="text-2xl">{getEmoji(cat.category)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{cat.category}</span>
                      <Badge variant="secondary" className="text-xs">
                        {cat.sharePercent}% przychodu
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {cat.clientCount} klientek
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {cat.totalRevenue.toLocaleString("pl-PL")} zł
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        śr. {cat.avgVisitsPerClient.toFixed(1)} wizyt/os.
                      </span>
                    </div>

                    <Progress value={cat.sharePercent} className="h-1.5 mt-2" />
                  </div>

                  {cat.dormantCount > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400 text-xs shrink-0">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {cat.dormantCount} nieaktywnych
                    </Badge>
                  )}

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded client list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t px-4 pb-4">
                        {/* Remarketing hint */}
                        {cat.dormantCount > 0 && (
                          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-orange-700 dark:text-orange-300">
                              <strong>{cat.dormantCount} klientek</strong> nie korzystało z kategorii „{cat.category}" od 60+ dni — rozważ kampanię reaktywacyjną SMS/email.
                            </p>
                          </div>
                        )}

                        {/* Client table */}
                        <div className="mt-3 space-y-0 divide-y">
                          <div className="grid grid-cols-[1fr_80px_90px_90px_1fr] gap-2 py-2 text-xs font-medium text-muted-foreground">
                            <span>Klientka</span>
                            <span className="text-center">Wizyty</span>
                            <span className="text-right">Wydane</span>
                            <span className="text-right">Ostatnia</span>
                            <span>Top usługa</span>
                          </div>

                          {cat.clients.map(client => {
                            const daysAgo = getDaysAgo(client.lastVisit);
                            const isDormant = daysAgo !== null && daysAgo > 60;

                            return (
                              <button
                                key={client.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectClient?.(client.id);
                                }}
                                className="grid grid-cols-[1fr_80px_90px_90px_1fr] gap-2 py-2 text-sm w-full text-left hover:bg-muted/50 rounded transition-colors px-1 -mx-1"
                              >
                                <span className="font-medium truncate">
                                  {client.firstName} {client.lastName}
                                </span>
                                <span className="text-center text-muted-foreground">{client.visits}</span>
                                <span className="text-right font-medium">{client.spent.toLocaleString("pl-PL")} zł</span>
                                <span className={cn("text-right text-xs", isDormant ? "text-orange-500" : "text-muted-foreground")}>
                                  {daysAgo !== null ? `${daysAgo}d temu` : "—"}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">{client.topService}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { Users, HelpCircle, Mail, Gift, ChevronRight, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type PurchaseGroup,
  PURCHASE_GROUPS,
  PURCHASE_GROUP_LIST,
} from "@/lib/purchase-groups";

// Re-export the old type for backwards compatibility
export interface CategoryGroup {
  category: string;
  clientCount: number;
  totalRevenue: number;
  avgVisits: number;
  clients: {
    id: string;
    firstName: string;
    lastName: string;
    lastVisit: string | null | undefined;
    totalSpent: number;
  }[];
}

interface ClientWithGroup {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalSpent: number;
  totalVisits: number;
  lastVisit?: string;
  purchaseGroup: PurchaseGroup;
}

interface PurchaseGroupsProps {
  // New API
  clients?: ClientWithGroup[];
  groupStats?: Record<PurchaseGroup, number>;
  onSelectClient?: (clientId: string) => void;
  // Legacy API (kept for backwards compat)
  groups?: CategoryGroup[];
  onSelectCategory?: (category: string) => void;
}

export function PurchaseGroups({
  clients = [],
  groupStats,
  onSelectClient,
  groups,
  onSelectCategory,
}: PurchaseGroupsProps) {
  const [activeGroup, setActiveGroup] = useState<PurchaseGroup | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // If using legacy API, render old component
  if (groups && onSelectCategory && !groupStats) {
    return <LegacyPurchaseGroups groups={groups} onSelectCategory={onSelectCategory} />;
  }

  const stats = groupStats || ({} as Record<PurchaseGroup, number>);
  const activeConfig = activeGroup ? PURCHASE_GROUPS[activeGroup] : null;
  const filteredClients = activeGroup
    ? clients.filter(c => c.purchaseGroup === activeGroup)
    : [];

  const getDaysSince = (date?: string) => {
    if (!date) return null;
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grupy zakupowe</h3>
          <p className="text-sm text-muted-foreground">
            Automatyczna klasyfikacja klientek na podstawie historii zakupów
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowExplanation(true)} className="gap-1.5 text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
          Jak działają grupy?
        </Button>
      </div>

      {/* Group tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PURCHASE_GROUP_LIST.map(group => {
          const count = stats[group.id] || 0;
          const isActive = activeGroup === group.id;

          return (
            <div
              key={group.id}
              onClick={() => setActiveGroup(isActive ? null : group.id)}
              className={cn(
                "rounded-xl p-4 cursor-pointer border-2 transition-all hover:shadow-md",
                isActive
                  ? "border-primary shadow-md scale-[1.02]"
                  : "border-transparent"
              )}
              style={{ backgroundColor: group.bgColor }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{group.emoji}</span>
                <span className="text-2xl font-bold font-serif" style={{ color: group.color }}>
                  {count}
                </span>
              </div>
              <p className="font-medium text-sm text-foreground">{group.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
            </div>
          );
        })}
      </div>

      {/* Active group detail panel */}
      {activeGroup && activeConfig && (
        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <span>{activeConfig.emoji}</span>
                {activeConfig.label}
                <Badge variant="secondary">{filteredClients.length} klientek</Badge>
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" disabled>
                  <Mail className="w-3.5 h-3.5" />
                  Wyślij wiadomość
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" disabled>
                  <Gift className="w-3.5 h-3.5" />
                  Utwórz ofertę
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
              <span>💡</span>
              <span className="text-muted-foreground">{activeConfig.tip}</span>
            </div>

            {filteredClients.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                Brak klientek w tej grupie
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredClients.map(client => {
                  const days = getDaysSince(client.lastVisit);
                  return (
                    <div
                      key={client.id}
                      onClick={() => onSelectClient?.(client.id)}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{client.firstName} {client.lastName}</p>
                          <p className="text-xs text-muted-foreground">
                            {days !== null ? `Ostatni zakup: ${days} dni temu` : "Brak danych"} · Łącznie: {client.totalSpent.toLocaleString("pl-PL")} zł · {client.totalVisits} wizyt
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Explanation dialog */}
      <ExplanationDialog open={showExplanation} onOpenChange={setShowExplanation} />
    </div>
  );
}

function ExplanationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const explanations = [
    { emoji: "💎", name: "VIP Shopper", criterion: "Kupiła za ponad 2000 zł łącznie i wróciła min. 3 razy" },
    { emoji: "🔁", name: "Stała klientka", criterion: "Min. 5 zakupów w ostatnich 6 miesiącach" },
    { emoji: "🌱", name: "Nowa klientka", criterion: "Pierwsze 1-2 zakupy w ciągu ostatnich 60 dni — dopiero zaczyna" },
    { emoji: "😴", name: "Uśpiona", criterion: "Nic nie kupiła od ponad 90 dni — czas ją odświeżyć" },
    { emoji: "🎯", name: "Sezonowa", criterion: "Kupuje tylko w określonych porach roku — np. przed latem lub świętami" },
    { emoji: "🧪", name: "Odkrywczyni", criterion: "Testuje różne kategorie produktów — szuka swojego ulubionego" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📊 Jak działają grupy zakupowe?</DialogTitle>
          <DialogDescription>
            Grupy są przypisywane automatycznie na podstawie historii zakupów każdej klientki.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {explanations.map(e => (
            <div key={e.name} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
              <span className="text-lg shrink-0">{e.emoji}</span>
              <div>
                <p className="font-medium text-sm">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.criterion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Grupy są obliczane automatycznie i nie możesz ich ręcznie zmieniać.
            Jeśli chcesz wpłynąć na przypisanie klientki — uzupełnij jej historię zakupów.
          </span>
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Zamknij
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// Legacy component kept for backwards compatibility
function LegacyPurchaseGroups({ groups, onSelectCategory }: { groups: CategoryGroup[]; onSelectCategory: (cat: string) => void }) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">Brak grup zakupowych</p>
        <p className="text-sm">Grupy pojawią się automatycznie gdy klientki zaczną kupować.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map(group => (
        <Card key={group.category} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectCategory(group.category)}>
          <CardContent className="p-4">
            <h3 className="font-semibold">{group.category}</h3>
            <p className="text-sm text-muted-foreground">{group.clientCount} klientek · {group.totalRevenue.toLocaleString("pl-PL")} zł</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

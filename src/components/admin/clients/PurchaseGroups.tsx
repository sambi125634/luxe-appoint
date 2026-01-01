import { useTranslation } from "react-i18next";
import { Users, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface PurchaseGroupsProps {
  groups: CategoryGroup[];
  onSelectCategory: (category: string) => void;
}

const categoryColors: Record<string, string> = {
  "Zabiegi na twarz": "from-pink-500 to-rose-500",
  "Pielęgnacja ciała": "from-purple-500 to-violet-500",
  "Manicure & Pedicure": "from-red-500 to-pink-500",
  "Depilacja": "from-amber-500 to-orange-500",
  "Makijaż": "from-fuchsia-500 to-pink-500",
  "Mezoterapia": "from-cyan-500 to-blue-500",
  "Lifting": "from-indigo-500 to-purple-500",
  "Fryzjerstwo": "from-teal-500 to-emerald-500",
  "default": "from-slate-500 to-slate-600"
};

export function PurchaseGroups({ groups, onSelectCategory }: PurchaseGroupsProps) {
  const { t, i18n } = useTranslation();

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">{t('clients.purchaseGroups.noGroups')}</p>
        <p className="text-sm">{t('clients.purchaseGroups.noGroupsHint')}</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language === 'pl' ? 'pl-PL' : 'en-US', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => {
        const colorClass = categoryColors[group.category] || categoryColors.default;
        
        return (
          <Card 
            key={group.category} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onSelectCategory(group.category)}
          >
            <CardHeader className={cn("pb-2 bg-gradient-to-r text-white", colorClass)}>
              <CardTitle className="text-lg font-medium flex items-center justify-between">
                {group.category}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold font-serif">{group.clientCount}</div>
                  <div className="text-xs text-muted-foreground">{t('clients.purchaseGroups.clients')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-serif">{formatCurrency(group.totalRevenue)}</div>
                  <div className="text-xs text-muted-foreground">{t('clients.purchaseGroups.revenue')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-serif">{group.avgVisits.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{t('clients.purchaseGroups.avgVisits')}</div>
                </div>
              </div>

              {/* Top 3 clients preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t('clients.purchaseGroups.topClients')}
                </div>
                {group.clients.slice(0, 3).map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between text-sm py-1 px-2 rounded bg-muted/50"
                  >
                    <span className="font-medium truncate">
                      {client.firstName} {client.lastName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency(client.totalSpent)}
                    </Badge>
                  </div>
                ))}
              </div>

              {group.clientCount > 3 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                  {t('clients.purchaseGroups.viewAll', { count: group.clientCount })}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

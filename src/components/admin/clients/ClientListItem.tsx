import { useTranslation } from "react-i18next";
import { 
  Phone, Mail, Star, AlertTriangle, ChevronRight, 
  Clock, Calendar 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClientRiskBadge } from "../ClientRiskBadge";

interface ClientListItemProps {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    tags: string[];
    totalVisits: number;
    totalSpent: number;
    lastVisit?: string;
    purchaseCategories?: string[];
  };
  availableTags: { id: string; label: string; color: string }[];
  onClick: () => void;
}

export function ClientListItem({ client, availableTags, onClick }: ClientListItemProps) {
  const { t, i18n } = useTranslation();

  const getTagInfo = (tagId: string) => {
    return availableTags.find(t => t.id === tagId);
  };

  const getDaysSinceLastVisit = () => {
    if (!client.lastVisit) return null;
    const lastVisitDate = new Date(client.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceLastVisit = getDaysSinceLastVisit();
  const needsAttention = daysSinceLastVisit && daysSinceLastVisit > 30;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      i18n.language === 'pl' ? 'pl-PL' : 'en-US', 
      { day: 'numeric', month: 'short' }
    );
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        needsAttention && "border-l-4 border-l-orange-500"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              (client.tags || []).includes("vip") 
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                : "bg-muted text-muted-foreground"
            )}>
              {(client.firstName || '')[0]}{(client.lastName || '')[0]}
            </div>

            {/* Main info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{client.firstName} {client.lastName}</h3>
                {(client.tags || []).includes("vip") && (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                )}
                {(client.tags || []).includes("problematic") && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <ClientRiskBadge clientId={client.id} compact />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {client.phone}
                </span>
                <span className="flex items-center gap-1 hidden sm:flex">
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{client.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right side info */}
          <div className="flex items-center gap-4">
            {/* Last visit indicator */}
            {client.lastVisit && (
              <div className="text-right hidden lg:block">
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  needsAttention ? "text-orange-600" : "text-muted-foreground"
                )}>
                  <Clock className="w-3 h-3" />
                  {daysSinceLastVisit} {t('clients.daysAgo')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(client.lastVisit)}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{client.totalVisits} {t('clients.visits')}</div>
              <div className="text-xs text-muted-foreground">{client.totalSpent} zł</div>
            </div>

            {/* Purchase categories */}
            {client.purchaseCategories && client.purchaseCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-[120px] hidden xl:flex">
                {client.purchaseCategories.slice(0, 2).map(category => (
                  <Badge 
                    key={category} 
                    variant="outline" 
                    className="text-xs bg-primary/5 border-primary/20"
                  >
                    {category}
                  </Badge>
                ))}
                {client.purchaseCategories.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{client.purchaseCategories.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 max-w-[150px] hidden md:flex">
              {(client.tags || []).slice(0, 2).map(tagId => {
                const tag = getTagInfo(tagId);
                return tag ? (
                  <Badge key={tagId} variant="secondary" className={cn("text-xs", tag.color)}>
                    {tag.label}
                  </Badge>
                ) : null;
              })}
              {(client.tags || []).length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{client.tags.length - 2}
                </Badge>
              )}
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

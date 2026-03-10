import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Infinity as InfinityIcon } from 'lucide-react';
import { ClientLTV } from './types';

interface Props {
  clients: ClientLTV[];
}

export function ClientLTVRanking({ clients }: Props) {
  const top20 = clients.slice(0, 20);

  const sourceLabel = (src: string | null) => {
    if (!src) return 'Nieznane';
    const map: Record<string, string> = {
      facebook: 'Facebook Ads',
      instagram: 'Instagram',
      google: 'Google Ads',
      polecenie: 'Polecenie',
      referral: 'Polecenie',
      walk_in: 'Z ulicy',
      organic: 'Organicznie',
      website: 'Strona www',
      booksy: 'Booksy',
    };
    return map[src.toLowerCase()] ?? src;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Top klientki — LTV vs koszt akwizycji
        </CardTitle>
      </CardHeader>
      <CardContent>
        {top20.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Brak danych o klientkach
          </p>
        ) : (
          <div className="space-y-2">
            {top20.map((c, i) => (
              <div
                key={c.clientId}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.visitCount} wizyt • {sourceLabel(c.source)}
                    {c.acquisitionCost > 0
                      ? ` • CAC: ${c.acquisitionCost.toFixed(0)} zł`
                      : ' • CAC: 0 zł (polecenie)'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{c.totalSpent.toFixed(0)} zł</p>
                  <Badge variant="outline" className="text-xs">
                    ROI{' '}
                    {c.ltvCacRatio === Infinity ? (
                      '∞'
                    ) : (
                      `${c.ltvCacRatio.toFixed(1)}x`
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

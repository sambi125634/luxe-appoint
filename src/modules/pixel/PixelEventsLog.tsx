import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Zap } from "lucide-react";
import { MOCK_EVENTS } from "./mock-data";
import { EVENT_TYPE_MAP } from "./types";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";

interface PixelEventsLogProps { isDemo?: boolean; }

export function PixelEventsLog({ isDemo }: PixelEventsLogProps) {
  const { t, i18n } = useTranslation();
  const events = MOCK_EVENTS;
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('pixel.recentEvents')} ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {events.map((event) => {
              const config = EVENT_TYPE_MAP[event.event_name];
              return (
                <div key={event.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{config?.label || event.event_name}</Badge>
                    {event.event_value && <span className="font-medium text-sm">{event.event_value} zł</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>→ {config?.metaEvent || event.event_name}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(event.sent_at), "dd MMM HH:mm", { locale: dateLocale })}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Hash: {event.hashed_email || "—"}</div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pixel.event')}</TableHead>
                  <TableHead>{t('pixel.metaEvent')}</TableHead>
                  <TableHead>{t('pixel.valueCol')}</TableHead>
                  <TableHead>{t('pixel.sourceCol')}</TableHead>
                  <TableHead>{t('pixel.dateCol')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const config = EVENT_TYPE_MAP[event.event_name];
                  return (
                    <TableRow key={event.id}>
                      <TableCell><Badge variant="secondary" className="text-xs">{config?.label || event.event_name}</Badge></TableCell>
                      <TableCell className="text-sm">{config?.metaEvent || "—"}</TableCell>
                      <TableCell className="font-medium">{event.event_value ? `${event.event_value} zł` : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{event.source_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(event.sent_at), "dd MMM HH:mm", { locale: dateLocale })}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

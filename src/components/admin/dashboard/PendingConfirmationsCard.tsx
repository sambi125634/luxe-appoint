import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ClipboardCheck, ChevronRight } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { pl } from "date-fns/locale";
import { usePendingConfirmations, useMarkAppointmentStatus } from "@/hooks/usePendingConfirmations";
import { cn } from "@/lib/utils";

interface PendingConfirmationsCardProps {
  onNavigate?: (tab: string) => void;
  variant?: "card" | "bar";
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const time = format(d, "HH:mm", { locale: pl });
  if (isToday(d)) return `Dziś · ${time}`;
  if (isYesterday(d)) return `Wczoraj · ${time}`;
  return `${format(d, "EEE d MMM", { locale: pl })} · ${time}`;
}

export function PendingConfirmationsCard({ onNavigate, variant = "card" }: PendingConfirmationsCardProps) {
  const { data = [], isLoading } = usePendingConfirmations();
  const markStatus = useMarkAppointmentStatus();

  if (isLoading) return null;
  if (data.length === 0 && variant === "bar") return null;

  const visible = data.slice(0, variant === "bar" ? 3 : 6);

  if (variant === "bar") {
    return (
      <div className="border-b border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-2 flex items-center gap-3 overflow-x-auto">
        <Badge variant="outline" className="border-amber-300 bg-white shrink-0 gap-1">
          <ClipboardCheck className="w-3 h-3" />
          Do potwierdzenia: {data.length}
        </Badge>
        {visible.map((a) => (
          <div key={a.id} className="flex items-center gap-2 shrink-0 text-xs bg-white border border-amber-200 rounded-full pl-3 pr-1 py-1">
            <span className="font-medium">
              {a.clients?.first_name ?? "Klientka"} {a.clients?.last_name ?? ""}
            </span>
            <span className="text-muted-foreground">{formatWhen(a.end_time)}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-emerald-700 hover:bg-emerald-100"
              disabled={markStatus.isPending}
              onClick={() => markStatus.mutate({ id: a.id, status: "completed" })}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-rose-600 hover:bg-rose-100"
              disabled={markStatus.isPending}
              onClick={() => markStatus.mutate({ id: a.id, status: "no_show" })}
            >
              <XCircle className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="glass-card border-amber-200/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Potwierdź wizyty</CardTitle>
            <p className="text-xs text-muted-foreground">
              {data.length === 0 ? "Wszystko potwierdzone ✓" : `${data.length} z ostatnich 7 dni czeka na oznaczenie`}
            </p>
          </div>
        </div>
        {data.length > 0 && (
          <Badge className="bg-amber-500 hover:bg-amber-500 text-white">{data.length}</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            Świetna robota — pipeline jest aktualny.
          </div>
        ) : (
          <>
            {visible.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium truncate">
                    {a.clients?.first_name ?? "—"} {a.clients?.last_name ?? ""}
                    <span className="text-xs text-muted-foreground font-normal truncate">
                      · {a.services?.name ?? "Usługa"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {formatWhen(a.end_time)}
                    {a.staff_members?.name ? ` · ${a.staff_members.name}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={markStatus.isPending}
                    onClick={() => markStatus.mutate({ id: a.id, status: "completed" })}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Odbyta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                    disabled={markStatus.isPending}
                    onClick={() => markStatus.mutate({ id: a.id, status: "no_show" })}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Nieobecna
                  </Button>
                </div>
              </div>
            ))}
            {data.length > visible.length && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => onNavigate?.("calendar")}
              >
                Pokaż wszystkie ({data.length}) <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

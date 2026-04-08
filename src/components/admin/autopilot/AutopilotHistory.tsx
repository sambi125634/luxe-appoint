import { useState } from "react";
import { Loader2, Filter, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAutopilotActions } from "@/hooks/useAutopilot";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  sent: { label: "Wysłane", variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
  pending: { label: "Oczekujące", variant: "outline", icon: <Clock className="w-3 h-3" /> },
  dismissed: { label: "Odrzucone", variant: "secondary", icon: <XCircle className="w-3 h-3" /> },
  failed: { label: "Błąd", variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
};

const TYPE_LABELS: Record<string, string> = {
  retention: "Reaktywacja",
  reminder: "Przypomnienie",
  review: "Opinia",
  noshow: "No-show",
  revenue_suggestion: "Sugestia",
  pixel_sync: "Pixel sync",
  brief: "Raport",
};

export function AutopilotHistory() {
  const { data: actions, isLoading } = useAutopilotActions();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = (actions ?? []).filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Typ akcji" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="sent">Wysłane</SelectItem>
            <SelectItem value="pending">Oczekujące</SelectItem>
            <SelectItem value="dismissed">Odrzucone</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Brak akcji do wyświetlenia</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="hidden md:table-cell">AI Wyjaśnienie</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((action) => {
                  const statusInfo = STATUS_MAP[action.status] ?? STATUS_MAP.pending;
                  return (
                    <TableRow key={action.id}>
                      <TableCell className="text-sm">
                        {new Date(action.scheduled_at).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[action.type] ?? action.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[300px] truncate">
                        {action.ai_explanation}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1 text-xs">
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

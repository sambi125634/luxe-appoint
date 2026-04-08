import { useState } from "react";
import { Loader2, Filter, Clock, CheckCircle2, XCircle, AlertCircle, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAutopilotActions } from "@/hooks/useAutopilot";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AutopilotHistoryProps {
  isDemo?: boolean;
}

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

export function AutopilotHistory({ isDemo }: AutopilotHistoryProps) {
  const { data: actions, isLoading } = useAutopilotActions();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Demo data
  const demoActions = DEMO_AUTOPILOT_DATA.historyActions;
  const filteredDemo = demoActions.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  // Real data
  const filteredReal = (actions ?? []).filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    if (isDemo) {
      toast("Eksport demo — w Twoim salonie pobierzesz prawdziwe dane");
      return;
    }
  };

  if (!isDemo && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isDemo) {
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
                <SelectItem value="VIP na jutro">VIP na jutro</SelectItem>
                <SelectItem value="No-show Recovery">No-show Recovery</SelectItem>
                <SelectItem value="Cichy Ambasador">Cichy Ambasador</SelectItem>
                <SelectItem value="Martwe godziny">Martwe godziny</SelectItem>
                <SelectItem value="Kula Śnieżna">Kula Śnieżna</SelectItem>
                <SelectItem value="Pamięta zabieg">Pamięta zabieg</SelectItem>
                <SelectItem value="Raport tygodniowy">Raport tygodniowy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="success">✓ Sukces</SelectItem>
              <SelectItem value="pending">⏳ Czeka</SelectItem>
              <SelectItem value="failed">✗ Brak odpowiedzi</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 ml-auto" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" />
            Eksportuj CSV
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filteredDemo.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Brak akcji do wyświetlenia</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Czas</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Typ</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Klientka</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Efekt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDemo.map((action, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                        className="hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{action.time}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700 font-medium">{action.type}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{action.clientName || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            action.status === "success" && "bg-green-100 text-green-700",
                            action.status === "pending" && "bg-amber-100 text-amber-700",
                            action.status === "failed" && "bg-red-100 text-red-700",
                          )}>
                            {action.statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {action.effect ? (
                            <span className="text-green-600 font-semibold">+{action.effect} zł</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real mode (unchanged logic)
  return (
    <div className="space-y-4 mt-4">
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

      <Card>
        <CardContent className="p-0">
          {filteredReal.length === 0 ? (
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
                {filteredReal.map((action) => {
                  const statusInfo = STATUS_MAP[action.status] ?? STATUS_MAP.pending;
                  return (
                    <TableRow key={action.id}>
                      <TableCell className="text-sm">
                        {new Date(action.scheduled_at).toLocaleDateString("pl-PL", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
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

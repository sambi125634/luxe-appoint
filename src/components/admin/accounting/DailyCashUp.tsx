import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Eye, FileText, Download, Lock, LockOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DailyClosing } from "./types";
import { mockDailyClosings } from "./mockData";
import { DailyCashUpDetail } from "./DailyCashUpDetail";
import { cn } from "@/lib/utils";

interface DailyCashUpProps {
  dateRange: { from: Date; to: Date };
}

export function DailyCashUp({ dateRange }: DailyCashUpProps) {
  const [selectedDay, setSelectedDay] = useState<DailyClosing | null>(null);
  const [closings, setClosings] = useState<DailyClosing[]>(mockDailyClosings);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const handleCloseDay = (dayId: string, actualCash: number) => {
    setClosings((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              actualCashInDrawer: actualCash,
              cashDifference: actualCash - day.expectedCashInDrawer,
              status: "zamknięte" as const,
              closedByUserName: "Admin",
              closedAt: new Date().toISOString(),
            }
          : day
      )
    );
    setSelectedDay(null);
  };

  const totalStats = closings.reduce(
    (acc, day) => ({
      services: acc.services + day.totalServicesGross,
      products: acc.products + day.totalProductsGross,
      tips: acc.tips + day.totalTips,
      cash: acc.cash + day.cashGross,
      card: acc.card + day.cardGross,
      online: acc.online + day.onlineGross,
    }),
    { services: 0, products: 0, tips: 0, cash: 0, card: 0, online: 0 }
  );

  if (selectedDay) {
    return (
      <DailyCashUpDetail
        day={selectedDay}
        onBack={() => setSelectedDay(null)}
        onCloseDay={handleCloseDay}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Usługi (brutto)</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.services)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Produkty (brutto)</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.products)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Napiwki</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.tips)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Gotówka</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.cash)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Karta</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.card)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Online</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.online)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Usługi</TableHead>
              <TableHead className="text-right">Produkty</TableHead>
              <TableHead className="text-right">Napiwki</TableHead>
              <TableHead className="text-right">Gotówka</TableHead>
              <TableHead className="text-right">Karta</TableHead>
              <TableHead className="text-right">Online</TableHead>
              <TableHead className="text-right">Vouchery</TableHead>
              <TableHead className="text-right">Różnica</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closings.map((day) => (
              <TableRow key={day.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {format(new Date(day.date), "EEEE, dd MMM", { locale: pl })}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(day.totalServicesGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.totalProductsGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.totalTips)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.cashGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.cardGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.onlineGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(day.voucherGross)}</TableCell>
                <TableCell className="text-right">
                  {day.cashDifference !== null ? (
                    <span
                      className={cn(
                        "font-medium",
                        day.cashDifference === 0
                          ? "text-green-600"
                          : day.cashDifference > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      )}
                    >
                      {day.cashDifference > 0 ? "+" : ""}
                      {formatCurrency(day.cashDifference)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {day.status === "zamknięte" ? (
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Zamknięte
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      Otwarte
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDay(day)}
                      title="Podgląd"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="PDF">
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="CSV">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

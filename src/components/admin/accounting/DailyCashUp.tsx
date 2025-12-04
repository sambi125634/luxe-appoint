import { useState } from "react";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
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
import { useTranslation } from "react-i18next";

interface DailyCashUpProps {
  dateRange: { from: Date; to: Date };
}

export function DailyCashUp({ dateRange }: DailyCashUpProps) {
  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState<DailyClosing | null>(null);
  const [closings, setClosings] = useState<DailyClosing[]>(mockDailyClosings);
  const dateLocale = i18n.language === 'pl' ? pl : enUS;

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
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.servicesGross')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.services)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.productsGross')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.products)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.tips')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.tips)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.cash')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.cash)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.card')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.card)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('accounting.online')}</p>
          <p className="text-xl font-semibold">{formatCurrency(totalStats.online)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t('accounting.date')}</TableHead>
              <TableHead className="text-right">{t('accounting.services')}</TableHead>
              <TableHead className="text-right">{t('accounting.products')}</TableHead>
              <TableHead className="text-right">{t('accounting.tips')}</TableHead>
              <TableHead className="text-right">{t('accounting.cash')}</TableHead>
              <TableHead className="text-right">{t('accounting.card')}</TableHead>
              <TableHead className="text-right">{t('accounting.online')}</TableHead>
              <TableHead className="text-right">{t('accounting.vouchers')}</TableHead>
              <TableHead className="text-right">{t('accounting.difference')}</TableHead>
              <TableHead className="text-center">{t('accounting.status')}</TableHead>
              <TableHead className="text-right">{t('accounting.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closings.map((day) => (
              <TableRow key={day.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {format(new Date(day.date), "EEEE, dd MMM", { locale: dateLocale })}
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
                      {t('accounting.closed')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                      <AlertCircle className="w-3 h-3" />
                      {t('accounting.open')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDay(day)}
                      title={t('accounting.preview')}
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
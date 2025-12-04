import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Download, ChevronDown, ChevronUp, User } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EmployeeCommission, Transaction } from "./types";
import { mockEmployeeCommissions, mockTransactions } from "./mockData";
import { useTranslation } from "react-i18next";

interface EmployeeCommissionsProps {
  dateRange: { from: Date; to: Date };
}

export function EmployeeCommissions({ dateRange }: EmployeeCommissionsProps) {
  const { t } = useTranslation();
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const commissions = mockEmployeeCommissions;

  // Totals
  const totals = commissions.reduce(
    (acc, c) => ({
      servicesGross: acc.servicesGross + c.servicesGross,
      productsGross: acc.productsGross + c.productsGross,
      tipsTotal: acc.tipsTotal + c.tipsTotal,
      commissionServices: acc.commissionServices + c.commissionServices,
      commissionProducts: acc.commissionProducts + c.commissionProducts,
      totalCommission: acc.totalCommission + c.totalCommission,
      totalPayout: acc.totalPayout + c.totalPayout,
    }),
    {
      servicesGross: 0,
      productsGross: 0,
      tipsTotal: 0,
      commissionServices: 0,
      commissionProducts: 0,
      totalCommission: 0,
      totalPayout: 0,
    }
  );

  const getStaffTransactions = (staffId: string) => {
    return mockTransactions.filter((t) => t.staffId === staffId);
  };

  const toggleExpand = (staffId: string) => {
    setExpandedStaff(expandedStaff === staffId ? null : staffId);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.totalPayout')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.totalPayout)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.commissionsTotal')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.totalCommission)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.tips')}</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.tipsTotal)}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">{t('accounting.employeesCount')}</p>
          <p className="text-2xl font-bold">{commissions.length}</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {t('accounting.exportCsvCommissions')}
        </Button>
      </div>

      {/* Commissions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('accounting.employee')}</TableHead>
              <TableHead className="text-right">{t('accounting.servicesGross')}</TableHead>
              <TableHead className="text-right">{t('accounting.productsGross')}</TableHead>
              <TableHead className="text-right">{t('accounting.tips')}</TableHead>
              <TableHead className="text-right">{t('accounting.serviceCommission')}</TableHead>
              <TableHead className="text-right">{t('accounting.productCommission')}</TableHead>
              <TableHead className="text-right">{t('accounting.totalCommissions')}</TableHead>
              <TableHead className="text-right">{t('accounting.payout')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((c) => (
              <Collapsible key={c.id} asChild open={expandedStaff === c.staffId}>
                <>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => toggleExpand(c.staffId)}
                  >
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {expandedStaff === c.staffId ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{c.staffName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(c.servicesGross)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.productsGross)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.tipsTotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.commissionServices)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.commissionProducts)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(c.totalCommission)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {formatCurrency(c.totalPayout)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={9} className="p-0">
                        <div className="p-4">
                          <h4 className="text-sm font-medium mb-3">
                            {t('accounting.employeeTransactions')} ({getStaffTransactions(c.staffId).length})
                          </h4>
                          <div className="bg-background rounded-lg border border-border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('accounting.date')}</TableHead>
                                  <TableHead>{t('accounting.client')}</TableHead>
                                  <TableHead>{t('accounting.type')}</TableHead>
                                  <TableHead>{t('accounting.serviceProduct')}</TableHead>
                                  <TableHead className="text-right">{t('accounting.grossAmount')}</TableHead>
                                  <TableHead className="text-right">{t('accounting.tip')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getStaffTransactions(c.staffId).map((tx) => (
                                  <TableRow key={tx.id}>
                                    <TableCell>
                                      {format(new Date(tx.dateTime), "dd.MM.yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>{tx.clientName || "—"}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={tx.itemType === "usługa" ? "default" : "secondary"}
                                        className="text-xs"
                                      >
                                        {tx.itemType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{tx.itemName}</TableCell>
                                    <TableCell className="text-right">
                                      {formatCurrency(tx.grossAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {tx.tipAmount > 0 ? formatCurrency(tx.tipAmount) : "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
            {/* Totals Row */}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell></TableCell>
              <TableCell>{t('accounting.total')}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.servicesGross)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.productsGross)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.tipsTotal)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.commissionServices)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.commissionProducts)}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.totalCommission)}</TableCell>
              <TableCell className="text-right">
                <Badge className="bg-primary text-primary-foreground">
                  {formatCurrency(totals.totalPayout)}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
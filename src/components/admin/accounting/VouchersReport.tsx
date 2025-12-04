import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { pl } from "date-fns/locale";
import { Download, AlertTriangle, Gift, Package, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Voucher } from "./types";
import { mockVouchers } from "./mockData";
import { cn } from "@/lib/utils";

interface VouchersReportProps {
  dateRange: { from: Date; to: Date };
}

export function VouchersReport({ dateRange }: VouchersReportProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterExpiring, setFilterExpiring] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  // Filter vouchers
  let filteredVouchers = [...mockVouchers];

  if (filterStatus !== "all") {
    filteredVouchers = filteredVouchers.filter((v) => v.status === filterStatus);
  }
  if (filterType !== "all") {
    filteredVouchers = filteredVouchers.filter((v) => v.type === filterType);
  }
  if (filterExpiring) {
    const today = new Date();
    filteredVouchers = filteredVouchers.filter((v) => {
      if (!v.expiryDate || v.status !== "aktywny") return false;
      const daysToExpiry = differenceInDays(new Date(v.expiryDate), today);
      return daysToExpiry >= 0 && daysToExpiry <= 30;
    });
  }

  // Calculate summaries
  const activeVouchers = mockVouchers.filter((v) => v.status === "aktywny");
  const totalLiability = activeVouchers.reduce((sum, v) => sum + v.remainingValue, 0);
  
  const today = new Date();
  const expiringIn30Days = activeVouchers.filter((v) => {
    if (!v.expiryDate) return false;
    const daysToExpiry = differenceInDays(new Date(v.expiryDate), today);
    return daysToExpiry >= 0 && daysToExpiry <= 30;
  });
  const expiringValue = expiringIn30Days.reduce((sum, v) => sum + v.remainingValue, 0);

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case "voucher kwotowy":
        return <Gift className="w-4 h-4" />;
      case "voucher zabiegowy":
        return <Ticket className="w-4 h-4" />;
      case "pakiet":
        return <Package className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktywny":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Aktywny
          </Badge>
        );
      case "wykorzystany":
        return (
          <Badge variant="secondary">
            Wykorzystany
          </Badge>
        );
      case "wygasły":
        return (
          <Badge variant="destructive">
            Wygasły
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysToExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const days = differenceInDays(new Date(expiryDate), today);
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-muted-foreground">Zobowiązania</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalLiability)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Suma niewykorzystanych voucherów
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Wygasa w 30 dni</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(expiringValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {expiringIn30Days.length} voucherów
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Aktywne vouchery</p>
          <p className="text-2xl font-bold">{activeVouchers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Wszystkie vouchery</p>
          <p className="text-2xl font-bold">{mockVouchers.length}</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="aktywny">Aktywne</SelectItem>
            <SelectItem value="wykorzystany">Wykorzystane</SelectItem>
            <SelectItem value="wygasły">Wygasłe</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="voucher kwotowy">Voucher kwotowy</SelectItem>
            <SelectItem value="voucher zabiegowy">Voucher zabiegowy</SelectItem>
            <SelectItem value="pakiet">Pakiet</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={filterExpiring ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterExpiring(!filterExpiring)}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Wygasające (30 dni)
        </Button>

        <div className="flex-1" />

        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Eksport CSV – vouchery i pakiety
        </Button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Kod</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Klient</TableHead>
              <TableHead>Data wystawienia</TableHead>
              <TableHead>Data ważności</TableHead>
              <TableHead className="text-right">Wartość nominalna</TableHead>
              <TableHead className="text-right">Pozostało</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVouchers.map((v) => {
              const daysToExpiry = getDaysToExpiry(v.expiryDate);
              const isExpiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 30 && v.status === "aktywny";

              return (
                <TableRow
                  key={v.id}
                  className={cn(
                    "hover:bg-muted/30",
                    isExpiringSoon && "bg-amber-50/50 dark:bg-amber-900/10"
                  )}
                >
                  <TableCell className="font-mono font-medium">{v.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVoucherIcon(v.type)}
                      <span className="text-sm">{v.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{v.clientName || "—"}</TableCell>
                  <TableCell>
                    {format(new Date(v.issueDate), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    {v.expiryDate ? (
                      <div className="flex items-center gap-2">
                        <span>{format(new Date(v.expiryDate), "dd.MM.yyyy")}</span>
                        {isExpiringSoon && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                            za {daysToExpiry} dni
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(v.originalValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        v.remainingValue === 0
                          ? "text-muted-foreground"
                          : v.remainingValue === v.originalValue
                          ? "text-green-600"
                          : "text-amber-600"
                      )}
                    >
                      {formatCurrency(v.remainingValue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(v.status)}</TableCell>
                </TableRow>
              );
            })}
            {filteredVouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nie znaleziono voucherów spełniających kryteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

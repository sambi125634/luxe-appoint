import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AccountingFilters as FiltersType } from "./types";

interface AccountingFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function AccountingFiltersBar({
  filters,
  onFiltersChange,
  onExportCSV,
  onExportPDF,
}: AccountingFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl border border-border mb-6">
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Zakres dat:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal min-w-[240px]",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "dd MMM yyyy", { locale: pl })} -{" "}
                    {format(filters.dateRange.to, "dd MMM yyyy", { locale: pl })}
                  </>
                ) : (
                  format(filters.dateRange.from, "dd MMM yyyy", { locale: pl })
                )
              ) : (
                <span>Wybierz zakres</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={{
                from: filters.dateRange?.from,
                to: filters.dateRange?.to,
              }}
              onSelect={(range) =>
                onFiltersChange({
                  ...filters,
                  dateRange: {
                    from: range?.from || new Date(),
                    to: range?.to || new Date(),
                  },
                })
              }
              numberOfMonths={2}
              locale={pl}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Location (placeholder) */}
      <Select
        value={filters.location || "all"}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            location: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Lokalizacja" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Wszystkie lokalizacje</SelectItem>
          <SelectItem value="main">Salon główny</SelectItem>
        </SelectContent>
      </Select>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export buttons */}
      <Button variant="outline" onClick={onExportCSV} className="gap-2">
        <Download className="w-4 h-4" />
        Eksport CSV
      </Button>
      <Button variant="outline" onClick={onExportPDF} className="gap-2">
        <FileText className="w-4 h-4" />
        Pobierz PDF
      </Button>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Search, Phone, MessageCircle, Star, AlertTriangle, ChevronRight, Plus, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function MobileClients() {
  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "problematic" | "recent">("all");

  const filtered = useMemo(() => {
    if (!clients) return [];
    let result = [...clients];

    // Apply filter
    if (filter === "vip") result = result.filter(c => c.is_vip);
    if (filter === "problematic") result = result.filter(c => c.is_problematic);
    if (filter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(c => c.last_visit_at && new Date(c.last_visit_at) > thirtyDaysAgo);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q))
      );
    }

    return result;
  }, [clients, search, filter]);

  const filters = [
    { id: "all" as const, label: "Wszyscy", count: clients?.length ?? 0 },
    { id: "vip" as const, label: "VIP ⭐", count: clients?.filter(c => c.is_vip).length ?? 0 },
    { id: "problematic" as const, label: "Uwaga ⚠️", count: clients?.filter(c => c.is_problematic).length ?? 0 },
    { id: "recent" as const, label: "Ostatnio", count: 0 },
  ];

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-2 pb-3 sticky top-0 z-20 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-serif font-bold">Klienci</h1>
          <Badge variant="secondary" className="text-xs">{clients?.length ?? 0}</Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-muted/50 border-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95",
                filter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {f.label} {f.count > 0 && `(${f.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="px-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-medium text-muted-foreground">
              {search ? "Brak wyników" : "Brak klientów"}
            </p>
          </div>
        ) : (
          filtered.map((client) => {
            const initials = `${client.first_name[0]}${client.last_name[0]}`.toUpperCase();
            return (
              <Card key={client.id} className="active:scale-[0.98] transition-transform">
                <CardContent className="p-3 flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center font-serif text-sm font-bold shrink-0",
                    client.is_vip
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {client.is_vip ? "⭐" : initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">
                        {client.first_name} {client.last_name}
                      </p>
                      {client.is_problematic && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{client.phone}</p>
                    {client.last_visit_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Ostatnia wizyta: {format(new Date(client.last_visit_at), "d MMM", { locale: pl })}
                      </p>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1">
                    <a href={`tel:${client.phone}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Phone className="w-4 h-4 text-primary" />
                      </Button>
                    </a>
                    <a href={`sms:${client.phone}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

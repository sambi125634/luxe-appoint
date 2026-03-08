import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";

export function MySalons() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: linkedSalons, isLoading } = useQuery({
    queryKey: ["client-salons"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_salon_links")
        .select("*, salons:salon_id(id, name, slug, address, city, logo_url, theme_primary_color)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data ?? [];
    },
  });

  const { containerRef, pullDistance, refreshing, handlers } = usePullToRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-salons"] });
    },
  });

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto"
      {...handlers}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <div className="px-4 pt-6 pb-24">
        {/* Header with greeting */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-accent">Beauty Funnels</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Moje salony</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Salony, w których jesteś klientem
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : !linkedSalons?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Brak przypisanych salonów
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Poproś swój salon o link zaproszenia lub zeskanuj kod QR w salonie, aby się połączyć.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedSalons.map((link) => {
              const salon = link.salons as unknown as {
                id: string; name: string; slug: string;
                address: string | null; city: string | null;
                logo_url: string | null; theme_primary_color: string | null;
              };
              if (!salon) return null;

              return (
                <Card
                  key={link.id}
                  className="cursor-pointer active:scale-[0.98] transition-all duration-150 border-border/50 hover:shadow-md"
                  onClick={() => navigate(`/app/salon/${salon.id}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="h-14 w-14 rounded-xl">
                      <AvatarImage src={salon.logo_url ?? undefined} />
                      <AvatarFallback
                        className="rounded-xl text-lg font-bold text-primary-foreground"
                        style={{ backgroundColor: salon.theme_primary_color ?? "hsl(var(--primary))" }}
                      >
                        {salon.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {salon.name}
                      </h3>
                      {(salon.address || salon.city) && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {[salon.address, salon.city].filter(Boolean).join(", ")}
                          </span>
                        </p>
                      )}
                      {link.is_favorite && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          ⭐ Ulubiony
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

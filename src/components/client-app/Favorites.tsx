import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";

export function Favorites() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["client-favorites"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_salon_links")
        .select("*, salons:salon_id(id, name, slug, address, city, logo_url, theme_primary_color, description)")
        .eq("user_id", user.id)
        .eq("is_favorite", true);

      if (error) throw error;
      return data ?? [];
    },
  });

  const { containerRef, pullDistance, refreshing, handlers } = usePullToRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["client-favorites"] });
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
        <h1 className="text-2xl font-bold text-foreground mb-1">Ulubione</h1>
        <p className="text-sm text-muted-foreground mb-6">Twoje ulubione salony</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !favorites?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center mb-5">
              <Heart className="h-10 w-10 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Brak ulubionych</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Kliknij serduszko na profilu salonu, aby dodać go do ulubionych i mieć szybki dostęp.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((link) => {
              const salon = link.salons as unknown as {
                id: string; name: string; address: string | null;
                city: string | null; logo_url: string | null;
                theme_primary_color: string | null; description: string | null;
              };
              if (!salon) return null;

              return (
                <Card
                  key={link.id}
                  className="cursor-pointer active:scale-[0.97] transition-all duration-200 border-border/40 hover:shadow-lg hover:border-red-200 overflow-hidden group"
                  onClick={() => navigate(`/app/salon/${salon.id}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 rounded-2xl shadow-md">
                        <AvatarImage src={salon.logo_url ?? undefined} className="object-cover" />
                        <AvatarFallback
                          className="rounded-2xl text-xl font-bold text-white"
                          style={{ backgroundColor: salon.theme_primary_color ?? "hsl(var(--primary))" }}
                        >
                          {salon.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                        <Heart className="h-3 w-3 fill-white text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {salon.name}
                      </h3>
                      {salon.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {salon.city}
                        </p>
                      )}
                      {salon.description && (
                        <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                          {salon.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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

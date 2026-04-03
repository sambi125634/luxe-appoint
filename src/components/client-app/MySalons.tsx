import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Plus, Sparkles, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";
import { motion } from "framer-motion";

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
        .select("*, salons:salon_id(id, name, slug, address, city, logo_url, theme_primary_color, description)")
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

  const sortedSalons = [...(linkedSalons ?? [])].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] overflow-y-auto"
      {...handlers}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <div className="px-4 pt-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Beauty Calendar</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Moje salony</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Salony, w których jesteś klientką
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !sortedSalons.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5">
              <Plus className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Brak przypisanych salonów
            </h3>
            <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
              Poproś swój salon o link zaproszenia lub zeskanuj kod QR w salonie, aby się połączyć.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {sortedSalons.map((link, index) => {
              const salon = link.salons as unknown as {
                id: string; name: string; slug: string;
                address: string | null; city: string | null;
                logo_url: string | null; theme_primary_color: string | null;
                description: string | null;
              };
              if (!salon) return null;

              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <Card
                    className="cursor-pointer active:scale-[0.97] transition-all duration-200 border-border/40 hover:shadow-lg hover:border-primary/20 overflow-hidden group"
                    onClick={() => navigate(`/app/salon/${salon.id}`)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-16 w-16 rounded-2xl shadow-md ring-1 ring-border/50">
                        <AvatarImage src={salon.logo_url ?? undefined} className="object-cover" />
                        <AvatarFallback
                          className="rounded-2xl text-xl font-bold text-white"
                          style={{ backgroundColor: salon.theme_primary_color ?? "hsl(var(--primary))" }}
                        >
                          {salon.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {salon.name}
                          </h3>
                          {link.is_favorite && (
                            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0" />
                          )}
                        </div>
                        {(salon.address || salon.city) && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {[salon.address, salon.city].filter(Boolean).join(", ")}
                            </span>
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
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

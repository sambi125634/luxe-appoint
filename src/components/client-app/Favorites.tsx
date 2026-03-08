import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function Favorites() {
  const navigate = useNavigate();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["client-favorites"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("client_salon_links")
        .select("*, salons:salon_id(id, name, slug, address, city, logo_url, theme_primary_color)")
        .eq("user_id", user.id)
        .eq("is_favorite", true);

      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-6">Ulubione</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !favorites?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Brak ulubionych</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Oznacz salon jako ulubiony, aby mieć do niego szybki dostęp.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((link) => {
            const salon = link.salons as unknown as {
              id: string; name: string; address: string | null;
              city: string | null; logo_url: string | null; theme_primary_color: string | null;
            };
            if (!salon) return null;

            return (
              <Card
                key={link.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
                onClick={() => navigate(`/app/salon/${salon.id}`)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-14 w-14 rounded-xl">
                    <AvatarImage src={salon.logo_url ?? undefined} />
                    <AvatarFallback
                      className="rounded-xl text-lg font-bold"
                      style={{ backgroundColor: salon.theme_primary_color ?? undefined }}
                    >
                      {salon.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{salon.name}</h3>
                    {salon.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {salon.city}
                      </p>
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
  );
}

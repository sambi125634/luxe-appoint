import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SalonProfile() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);

  const { data: salon, isLoading } = useQuery({
    queryKey: ["client-salon", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data, error } = await supabase
        .from("salons")
        .select("*")
        .eq("id", salonId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });

  const { data: services } = useQuery({
    queryKey: ["client-salon-services", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("services")
        .select("*, service_categories:category_id(name)")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  const { data: staff } = useQuery({
    queryKey: ["client-salon-staff", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("staff_members")
        .select("id, name, avatar_url, role, color")
        .eq("salon_id", salonId)
        .eq("is_active", true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!salonId,
  });

  const { data: favoriteLink } = useQuery({
    queryKey: ["client-salon-fav", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("client_salon_links")
        .select("id, is_favorite")
        .eq("user_id", user.id)
        .eq("salon_id", salonId)
        .maybeSingle();
      return data;
    },
    enabled: !!salonId,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!favoriteLink) return;
      const { error } = await supabase
        .from("client_salon_links")
        .update({ is_favorite: !favoriteLink.is_favorite })
        .eq("id", favoriteLink.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-salon-fav", salonId] });
      queryClient.invalidateQueries({ queryKey: ["client-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["client-salons"] });
      toast.success(favoriteLink?.is_favorite ? "Usunięto z ulubionych" : "Dodano do ulubionych");
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">Salon nie został znaleziony</p>
      </div>
    );
  }

  if (showBooking) {
    return (
      <div className="pb-24">
        <div className="px-4 pt-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setShowBooking(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Wróć do profilu
          </Button>
        </div>
        <BookingWidget />
      </div>
    );
  }

  const isFav = favoriteLink?.is_favorite ?? false;

  return (
    <div className="pb-24">
      {/* Header */}
      <div
        className="relative h-48 flex items-end p-4"
        style={{
          background: `linear-gradient(135deg, ${salon.theme_primary_color ?? "hsl(var(--primary))"}, ${salon.theme_secondary_color ?? "hsl(var(--primary))"})`,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/30 backdrop-blur-sm text-white hover:bg-background/50"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Favorite button */}
        {favoriteLink && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-background/30 backdrop-blur-sm text-white hover:bg-background/50"
            onClick={() => toggleFavorite.mutate()}
          >
            <Heart className={cn("h-5 w-5 transition-all", isFav && "fill-red-500 text-red-500")} />
          </Button>
        )}

        <div className="flex items-end gap-4">
          <Avatar className="h-16 w-16 rounded-xl border-2 border-background shadow-lg">
            <AvatarImage src={salon.logo_url ?? undefined} />
            <AvatarFallback className="rounded-xl text-2xl font-bold bg-background text-foreground">
              {salon.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-white pb-1">
            <h1 className="text-xl font-bold drop-shadow-sm">{salon.name}</h1>
            {salon.city && (
              <p className="text-sm opacity-90 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {salon.city}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* CTA */}
        <Button
          className="w-full h-12 text-base font-semibold active:scale-[0.98] transition-transform"
          onClick={() => setShowBooking(true)}
        >
          Zarezerwuj wizytę
        </Button>

        {/* Contact info */}
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-2 text-sm">
            {salon.address && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {[salon.address, salon.city].filter(Boolean).join(", ")}
              </p>
            )}
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {salon.phone}
              </a>
            )}
            {salon.email && (
              <a href={`mailto:${salon.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                {salon.email}
              </a>
            )}
          </CardContent>
        </Card>

        {/* Staff */}
        {staff && staff.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Nasz zespół</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {staff.map((member) => (
                <div key={member.id} className="flex flex-col items-center min-w-[72px]">
                  <Avatar className="h-14 w-14 mb-1.5">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback style={{ backgroundColor: member.color ?? undefined }}>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground text-center font-medium truncate w-full">
                    {member.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Services */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Usługi</h2>
          {!services?.length ? (
            <p className="text-sm text-muted-foreground">Brak dostępnych usług</p>
          ) : (
            <div className="space-y-2">
              {services.map((service) => {
                const category = service.service_categories as unknown as { name: string } | null;
                return (
                  <Card key={service.id} className="border-border/50 active:scale-[0.98] transition-all duration-150">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground text-sm truncate">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {service.duration} min
                          </span>
                          {category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-foreground text-sm whitespace-nowrap ml-3">
                        {Number(service.price).toFixed(0)} zł
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

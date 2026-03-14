import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Mail, Clock, Heart, Star,
  ChevronDown, ChevronRight, Sparkles, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SalonProfile() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["all"]));
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

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
        .select("*, service_categories:category_id(id, name, icon)")
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

  // Group services by category
  const servicesByCategory = useMemo(() => {
    if (!services) return [];
    const map = new Map<string, { name: string; icon: string | null; services: typeof services }>();
    for (const s of services) {
      const cat = s.service_categories as unknown as { id: string; name: string; icon: string | null } | null;
      const key = cat?.id ?? "other";
      const name = cat?.name ?? "Inne";
      const icon = cat?.icon ?? null;
      if (!map.has(key)) map.set(key, { name, icon, services: [] });
      map.get(key)!.services.push(s);
    }
    return Array.from(map.entries());
  }, [services]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-24 space-y-4">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
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
        <BookingWidget salonId={salonId} />
      </div>
    );
  }

  const isFav = favoriteLink?.is_favorite ?? false;
  const primaryColor = salon.theme_primary_color ?? "hsl(var(--primary))";
  const secondaryColor = salon.theme_secondary_color ?? "hsl(var(--primary))";

  return (
    <div className="pb-24">
      {/* Hero Header with parallax-like gradient */}
      <div
        className="relative h-56 flex items-end overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor}dd 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-white" />
        <div className="absolute top-20 -left-8 w-24 h-24 rounded-full opacity-10 bg-white" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-black/20 backdrop-blur-md text-white hover:bg-black/30 rounded-full"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {favoriteLink && (
          <button
            className={cn(
              "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300",
              isFav ? "bg-red-500/90 scale-110" : "bg-black/20 hover:bg-black/30"
            )}
            onClick={() => toggleFavorite.mutate()}
          >
            <Heart className={cn(
              "h-5 w-5 transition-all duration-300",
              isFav ? "fill-white text-white scale-110" : "text-white"
            )} />
          </button>
        )}

        <div className="flex items-end gap-4 p-5 w-full">
          <Avatar className="h-18 w-18 rounded-2xl border-3 border-white/30 shadow-2xl" style={{ width: 72, height: 72 }}>
            <AvatarImage src={salon.logo_url ?? undefined} className="object-cover" />
            <AvatarFallback className="rounded-2xl text-2xl font-bold bg-white/20 text-white backdrop-blur-sm">
              {salon.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-white pb-1 flex-1 min-w-0">
            <h1 className="text-xl font-bold drop-shadow-md truncate">{salon.name}</h1>
            {salon.city && (
              <p className="text-sm opacity-90 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {salon.city}
              </p>
            )}
            {salon.description && (
              <p className="text-xs opacity-75 mt-1 line-clamp-2">{salon.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-5 relative z-10">
        {/* Floating CTA Button */}
        <Button
          className="w-full h-14 text-base font-bold rounded-2xl shadow-lg active:scale-[0.97] transition-all duration-200 relative overflow-hidden group"
          onClick={() => setShowBooking(true)}
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="h-5 w-5 mr-2" />
          Zarezerwuj wizytę
        </Button>

        {/* Quick Contact Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {salon.phone && (
            <a
              href={`tel:${salon.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/80 text-sm font-medium text-foreground whitespace-nowrap active:scale-95 transition-transform shrink-0"
            >
              <Phone className="h-4 w-4 text-primary" />
              Zadzwoń
            </a>
          )}
          {salon.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent([salon.address, salon.city].filter(Boolean).join(", "))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/80 text-sm font-medium text-foreground whitespace-nowrap active:scale-95 transition-transform shrink-0"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Nawiguj
            </a>
          )}
          {salon.email && (
            <a
              href={`mailto:${salon.email}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-muted/80 text-sm font-medium text-foreground whitespace-nowrap active:scale-95 transition-transform shrink-0"
            >
              <Mail className="h-4 w-4 text-primary" />
              Email
            </a>
          )}
        </div>

        {/* Staff Section - Interactive cards */}
        {staff && staff.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Nasz zespół</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {staff.map((member) => {
                const isSelected = selectedStaffId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedStaffId(isSelected ? null : member.id)}
                    className={cn(
                      "flex flex-col items-center min-w-[80px] p-3 rounded-2xl transition-all duration-200 active:scale-95",
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary shadow-sm"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Avatar className={cn(
                      "h-14 w-14 mb-2 ring-2 transition-all duration-200",
                      isSelected ? "ring-primary ring-offset-2" : "ring-transparent"
                    )}>
                      <AvatarImage src={member.avatar_url ?? undefined} className="object-cover" />
                      <AvatarFallback
                        className="text-white font-bold"
                        style={{ backgroundColor: member.color ?? "hsl(var(--primary))" }}
                      >
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-foreground text-center leading-tight">
                      {member.name.split(" ")[0]}
                    </span>
                    {member.role && (
                      <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5 line-clamp-1">
                        {member.role}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedStaffId && (
              <p className="text-xs text-muted-foreground mt-2 text-center animate-in fade-in slide-in-from-bottom-2">
                Filtrowanie usług wg specjalisty…
              </p>
            )}
          </div>
        )}

        <Separator className="opacity-50" />

        {/* Services grouped by category - Accordion style */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Usługi</h2>
            <Badge variant="secondary" className="text-xs font-medium">
              {services?.length ?? 0} usług
            </Badge>
          </div>

          {!servicesByCategory.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Brak dostępnych usług</p>
          ) : (
            <div className="space-y-3">
              {servicesByCategory.map(([catId, { name: catName, services: catServices }]) => {
                const isExpanded = expandedCategories.has(catId) || expandedCategories.has("all");

                return (
                  <div key={catId} className="rounded-2xl overflow-hidden border border-border/50 bg-card">
                    {/* Category header */}
                    <button
                      onClick={() => {
                        // On first click, remove "all" and set just this one
                        if (expandedCategories.has("all")) {
                          setExpandedCategories(new Set([catId]));
                        } else {
                          toggleCategory(catId);
                        }
                      }}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-muted/50 active:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: `${primaryColor}cc` }}
                        >
                          {catName.charAt(0)}
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-sm text-foreground">{catName}</h3>
                          <p className="text-[11px] text-muted-foreground">{catServices.length} usług</p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Services list */}
                    {isExpanded && (
                      <div className="border-t border-border/30 divide-y divide-border/30 animate-in slide-in-from-top-1 fade-in duration-200">
                        {catServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-3.5 hover:bg-muted/30 active:bg-muted/50 active:scale-[0.99] transition-all duration-150 cursor-pointer group"
                            onClick={() => setShowBooking(true)}
                          >
                            <div className="flex-1 min-w-0 pr-3">
                              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {service.name}
                              </h4>
                              {service.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {service.duration} min
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-sm text-foreground">
                                {Number(service.price).toFixed(0)} zł
                              </span>
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-3.5 w-3.5 text-primary" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info card */}
        <Card className="border-border/30 bg-muted/30 rounded-2xl">
          <CardContent className="p-4 space-y-2.5 text-sm">
            {salon.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="text-muted-foreground">{[salon.address, salon.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {salon.phone && (
              <a href={`tel:${salon.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {salon.phone}
              </a>
            )}
            {salon.email && (
              <a href={`mailto:${salon.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {salon.email}
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

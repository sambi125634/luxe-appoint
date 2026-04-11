import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Heart, Info, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { SalonGallery } from "@/components/client-app/SalonGallery";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { ClientData } from "@/components/booking/ClientForm";

export function SalonProfile() {
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInfo, setShowInfo] = useState(false);
  const [overrideAutoData, setOverrideAutoData] = useState(false);

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

  // Fetch logged-in user profile for auto-fill
  const { data: userProfile } = useQuery({
    queryKey: ["client-profile-for-booking"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, email")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const autoClientData: ClientData | null = 
    userProfile && !overrideAutoData && 
    userProfile.first_name && userProfile.last_name && 
    userProfile.phone && userProfile.email
      ? {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          phone: userProfile.phone,
          email: userProfile.email,
          notes: "",
          acceptRodo: true,
          acceptMarketing: false,
          confirmationMethod: "sms" as const,
        }
      : null;

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
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-[70vh] rounded-xl" />
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

  const isFav = favoriteLink?.is_favorite ?? false;
  const primaryColor = salon.theme_primary_color ?? "hsl(var(--primary))";
  const secondaryColor = salon.theme_secondary_color ?? "hsl(var(--primary))";

  const maskedPhone = autoClientData?.phone
    ? autoClientData.phone.slice(0, 4) + " *** " + autoClientData.phone.slice(-3)
    : "";

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Compact salon header */}
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 bg-black/20 backdrop-blur-md text-white hover:bg-black/30 rounded-full h-9 w-9"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Avatar className="h-10 w-10 rounded-xl border-2 border-white/30 shrink-0">
          <AvatarImage src={salon.logo_url ?? undefined} className="object-cover" />
          <AvatarFallback className="rounded-xl text-sm font-bold bg-white/20 text-white backdrop-blur-sm">
            {salon.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 text-white">
          <h1 className="text-sm font-bold truncate">{salon.name}</h1>
          {salon.city && (
            <p className="text-[11px] opacity-80 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {salon.city}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-all"
            onClick={() => setShowInfo(!showInfo)}
          >
            {showInfo ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          </button>

          {favoriteLink && (
            <button
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300",
                isFav ? "bg-red-500/90" : "bg-black/20 hover:bg-black/30"
              )}
              onClick={() => toggleFavorite.mutate()}
            >
              <Heart className={cn(
                "h-4 w-4 transition-all duration-300",
                isFav ? "fill-white text-white" : "text-white"
              )} />
            </button>
          )}
        </div>
      </div>

      {/* Expandable info panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="px-4 py-4 space-y-2.5 bg-muted/50">
              {salon.description && (
                <p className="text-sm text-muted-foreground">{salon.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {salon.phone && (
                  <a
                    href={`tel:${salon.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background text-xs font-medium active:scale-95 transition-transform"
                  >
                    <Phone className="h-3.5 w-3.5 text-primary" /> {salon.phone}
                  </a>
                )}
                {salon.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent([salon.address, salon.city].filter(Boolean).join(", "))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background text-xs font-medium active:scale-95 transition-transform"
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {salon.address}
                  </a>
                )}
                {salon.email && (
                  <a
                    href={`mailto:${salon.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background text-xs font-medium active:scale-95 transition-transform"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" /> {salon.email}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking-as identity tile */}
      {autoClientData && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {autoClientData.firstName} {autoClientData.lastName.charAt(0)}.
              </p>
              <p className="text-[11px] text-muted-foreground">{maskedPhone}</p>
            </div>
          </div>
          <button
            onClick={() => setOverrideAutoData(true)}
            className="text-xs text-primary font-medium px-2 py-1 rounded-md hover:bg-primary/10 transition-colors shrink-0"
          >
            Zmień
          </button>
        </div>
      )}

      {/* Gallery section */}
      {/* TODO: Admin panel - upload zdjęć przez Supabase Storage */}
      <div className="mt-3 mb-1">
        <h3 className="text-sm font-medium px-4 pb-2 text-foreground">
          Nasze realizacje
        </h3>
        <SalonGallery salonId={salonId!} />
      </div>

      {/* Main booking widget — displayed directly */}
      <div className="mt-2">
        <BookingWidget salonId={salonId} skipIntro autoClientData={autoClientData} />
      </div>
    </div>
  );
}

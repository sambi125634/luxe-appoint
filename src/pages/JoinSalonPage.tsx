import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ClientOnboarding } from "@/components/client-app/ClientOnboarding";

export default function JoinSalonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const { data: salon, isLoading } = useQuery({
    queryKey: ["join-salon", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("salons")
        .select("id, name, slug, address, city, logo_url, theme_primary_color")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/auth?redirect=/join/${slug}`);
        return;
      }

      if (!salon) return;

      const { error } = await supabase
        .from("client_salon_links")
        .upsert({ user_id: user.id, salon_id: salon.id, invite_code: slug }, { onConflict: "user_id,salon_id" });

      if (error) throw error;

      // Ensure user has client role
      await supabase.from("user_roles").upsert(
        { user_id: user.id, role: "client" as any },
        { onConflict: "user_id,role" }
      );

      setJoined(true);
      toast.success(`Dołączono do ${salon.name}!`);
      setTimeout(() => navigate("/app"), 1500);
    } catch (err) {
      toast.error("Nie udało się dołączyć do salonu");
    } finally {
      setJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="text-center py-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Salon nie znaleziony</h2>
            <p className="text-sm text-muted-foreground">Ten link zaproszenia jest nieprawidłowy.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm border-border/50">
        <CardContent className="flex flex-col items-center text-center py-8 px-6">
          <Avatar className="h-20 w-20 rounded-xl mb-4">
            <AvatarImage src={salon.logo_url ?? undefined} />
            <AvatarFallback
              className="rounded-xl text-2xl font-bold"
              style={{ backgroundColor: salon.theme_primary_color ?? undefined }}
            >
              {salon.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h1 className="text-xl font-bold text-foreground mb-1">{salon.name}</h1>
          {salon.city && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-6">
              <MapPin className="h-3 w-3" /> {salon.city}
            </p>
          )}

          {joined ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-foreground">Dołączono!</p>
              <p className="text-sm text-muted-foreground">Przekierowuję do aplikacji...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Zapraszamy do naszego salonu! Dołącz, aby rezerwować wizyty i korzystać z naszych usług.
              </p>
              <Button className="w-full h-12 text-base" onClick={handleJoin} disabled={joining}>
                {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Dołącz do salonu
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

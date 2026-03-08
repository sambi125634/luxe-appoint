import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function ClientProfile() {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["client-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      return data;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Wylogowano pomyślnie");
    navigate("/auth");
  };

  const initials = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .map((n) => n?.charAt(0))
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground mb-6">Mój profil</h1>

      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold text-foreground">
          {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Użytkownik"}
        </h2>
      </div>

      <Card className="border-border/50 mb-6">
        <CardContent className="divide-y divide-border/50 p-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{profile?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Telefon</p>
              <p className="text-sm text-foreground">{profile?.phone ?? "Nie podano"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Prywatność i dane</p>
              <p className="text-xs text-muted-foreground">
                Twoje dane są przechowywane zgodnie z RODO
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Wyloguj się
      </Button>
    </div>
  );
}

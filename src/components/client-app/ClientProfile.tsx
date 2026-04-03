import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Mail, Phone, Shield, ChevronRight,
  Bell, Moon, HelpCircle, Star, Edit2, Check, X, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";

export function ClientProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

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

  const { data: salonCount } = useQuery({
    queryKey: ["client-salon-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { count } = await supabase
        .from("client_salon_links")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count ?? 0;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Brak użytkownika");
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editFirstName || null,
          last_name: editLastName || null,
          phone: editPhone || null,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-profile"] });
      setIsEditing(false);
      toast.success("Profil zaktualizowany");
    },
    onError: () => {
      toast.error("Nie udało się zaktualizować profilu");
    },
  });

  const handleStartEdit = () => {
    setEditFirstName(profile?.first_name ?? "");
    setEditLastName(profile?.last_name ?? "");
    setEditPhone(profile?.phone ?? "");
    setIsEditing(true);
  };

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

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Użytkownik";

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mój profil</h1>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={handleStartEdit} className="text-primary">
            <Edit2 className="h-4 w-4 mr-1" />
            Edytuj
          </Button>
        )}
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-3">
          <Avatar className="h-24 w-24 ring-4 ring-primary/10">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {salonCount != null && salonCount > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {salonCount} {salonCount === 1 ? "salon" : "salonów"}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="w-full space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Imię"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
              />
              <Input
                placeholder="Nazwisko"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
              />
            </div>
            <Input
              placeholder="Telefon"
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Anuluj
              </Button>
              <Button
                className="flex-1"
                onClick={() => updateProfile.mutate()}
                disabled={updateProfile.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Zapisz
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
          </>
        )}
      </div>

      {/* Contact info */}
      {!isEditing && (
        <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden">
          <CardContent className="divide-y divide-border/30 p-0">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                <p className="text-sm text-foreground truncate">{profile?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Telefon</p>
                <p className="text-sm text-foreground">{profile?.phone ?? "Nie podano"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings menu */}
      <Card className="border-border/40 rounded-2xl mb-4 overflow-hidden">
        <CardContent className="divide-y divide-border/30 p-0">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Powiadomienia</span>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Moon className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Tryb ciemny</span>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Favorites shortcut */}
      <button
        onClick={() => navigate("/app/profile/favorites")}
        className="w-full mb-4"
      >
        <Card className="border-border/40 rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <CardContent className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <Star className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Ulubione salony</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </button>

      {/* Info cards */}
      <Card className="border-border/40 rounded-2xl mb-6 overflow-hidden">
        <CardContent className="divide-y divide-border/30 p-0">
          <button className="flex items-center justify-between px-4 py-3.5 w-full text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Prywatność i dane</p>
                <p className="text-[11px] text-muted-foreground">Zgodne z RODO</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between px-4 py-3.5 w-full text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pomoc i wsparcie</p>
                <p className="text-[11px] text-muted-foreground">FAQ, kontakt</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl font-semibold"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Wyloguj się
      </Button>

      <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
        Beauty Funnels v1.0 • Powered with ❤️
      </p>
    </div>
  );
}

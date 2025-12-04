import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Palette, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { SalonProfile } from "./types";

export function SalonProfileSettings() {
  const [profile, setProfile] = useState<SalonProfile>({
    name: "Demo Salon Beauty",
    description: "Profesjonalny salon kosmetyczny oferujący szeroki zakres usług pielęgnacyjnych.",
    address: "ul. Piękna 15/3",
    city: "Warszawa",
    phone: "+48 500 600 700",
    email: "kontakt@demosalon.pl",
    logoUrl: "",
    themePrimaryColor: "#7c3aed",
    themeSecondaryColor: "#a78bfa",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Zapisano",
      description: "Profil salonu został zaktualizowany.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Informacje o salonie
          </CardTitle>
          <CardDescription>
            Podstawowe dane Twojego salonu wyświetlane klientom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa salonu</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Nazwa Twojego salonu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Miasto"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="pl-10"
                placeholder="ul. Przykładowa 1/2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis salonu</Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="Krótki opis Twojego salonu..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Dane kontaktowe
          </CardTitle>
          <CardDescription>
            Informacje kontaktowe dla klientów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+48 500 000 000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="pl-10"
                  placeholder="kontakt@salon.pl"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Branding i wygląd
          </CardTitle>
          <CardDescription>
            Dostosuj wygląd widgetu rezerwacji do swojej marki
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo salonu</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Wybierz plik
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG do 2MB</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Kolor główny</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={profile.themePrimaryColor}
                  onChange={(e) => setProfile({ ...profile, themePrimaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  id="primaryColor"
                  value={profile.themePrimaryColor}
                  onChange={(e) => setProfile({ ...profile, themePrimaryColor: e.target.value })}
                  placeholder="#7c3aed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Kolor dodatkowy</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={profile.themeSecondaryColor}
                  onChange={(e) => setProfile({ ...profile, themeSecondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  id="secondaryColor"
                  value={profile.themeSecondaryColor}
                  onChange={(e) => setProfile({ ...profile, themeSecondaryColor: e.target.value })}
                  placeholder="#a78bfa"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ 
            background: `linear-gradient(135deg, ${profile.themePrimaryColor}15, ${profile.themeSecondaryColor}15)` 
          }}>
            <p className="text-sm text-muted-foreground mb-2">Podgląd kolorów:</p>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: profile.themePrimaryColor }}
              />
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: profile.themeSecondaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
}

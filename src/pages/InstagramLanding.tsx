import { useParams, useSearchParams, Link } from "react-router-dom";
import { Calendar, MapPin, Phone, Clock, Instagram, Sparkles, ArrowRight, Mail, Scissors, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SalonData {
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  social_url: string | null;
  theme_primary_color: string | null;
  settings: Record<string, unknown> | null;
}

// Fallback for demo or when salon not found
const fallbackSalonData: SalonData = {
  name: "Demo Salon Beauty",
  description: "Twój ulubiony salon kosmetyczny w sercu miasta. Oferujemy profesjonalne usługi z najwyższej jakości produktami.",
  logo_url: null,
  address: "ul. Piękna 15, 00-001 Warszawa",
  city: "Warszawa",
  phone: "+48 123 456 789",
  email: "kontakt@demosalon.pl",
  social_url: "https://instagram.com/demosalonbeauty",
  theme_primary_color: null,
  settings: null,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function extractInstagramHandle(socialUrl: string | null): string | null {
  if (!socialUrl) return null;
  // Handle both full URLs and @handles
  if (socialUrl.startsWith("@")) return socialUrl;
  const match = socialUrl.match(/instagram\.com\/([^/?]+)/);
  return match ? `@${match[1]}` : socialUrl.startsWith("http") ? null : `@${socialUrl}`;
}

function getInstagramUrl(socialUrl: string | null): string | null {
  if (!socialUrl) return null;
  if (socialUrl.includes("instagram.com")) return socialUrl;
  const handle = socialUrl.replace("@", "");
  return `https://instagram.com/${handle}`;
}

function extractWorkingHours(settings: Record<string, unknown> | null): string | null {
  if (!settings) return null;
  const bookingSettings = settings.bookingSettings as Record<string, unknown> | undefined;
  if (!bookingSettings) return null;
  const hours = bookingSettings.workingHours as string | undefined;
  return hours || null;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-serif font-bold">Salon nie znaleziony</h1>
        <p className="text-muted-foreground">
          Ten link może być nieaktualny lub salon nie jest już aktywny.
        </p>
        <Link to="/">
          <Button variant="outline" className="mt-4">Strona główna</Button>
        </Link>
      </div>
    </div>
  );
}

export default function InstagramLanding() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "instagram";

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchSalon = async () => {
      const { data, error } = await supabase
        .from("salons")
        .select("name, description, address, city, phone, email, logo_url, social_url, theme_primary_color, settings")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        // Use fallback for demo slug
        if (slug === "demo-salon" || slug === "demo") {
          setSalon(fallbackSalonData);
        } else {
          setNotFound(true);
        }
      } else {
        setSalon(data as SalonData);
      }
      setLoading(false);
    };

    fetchSalon();
  }, [slug]);

  useEffect(() => {
    if (salon) {
      document.title = `${salon.name} | Rezerwacja Online`;
    }
  }, [salon]);

  if (loading) return <LoadingSkeleton />;
  if (notFound || !salon) return <NotFoundState />;

  const bookingUrl = `/s/${slug}?utm_source=${ref}&utm_medium=landing`;
  const pricingUrl = `/s/${slug}?utm_source=${ref}&utm_medium=landing&tab=services`;
  const instagramHandle = extractInstagramHandle(salon.social_url);
  const instagramUrl = getInstagramUrl(salon.social_url);
  const workingHours = extractWorkingHours(salon.settings as Record<string, unknown> | null);
  const fullAddress = [salon.address, salon.city].filter(Boolean).join(", ");

  // Dynamic primary color
  const accentColor = salon.theme_primary_color || undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-10"
          style={{ backgroundColor: accentColor || "hsl(var(--primary))" }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-10"
          style={{ backgroundColor: accentColor || "hsl(var(--secondary))", animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo / Name */}
        <div className="text-center space-y-4 animate-fade-in">
          {salon.logo_url ? (
            <img
              src={salon.logo_url}
              alt={`Logo ${salon.name}`}
              className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg ring-2 ring-primary/20"
            />
          ) : (
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg text-white font-serif text-2xl font-bold"
              style={{
                background: accentColor
                  ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                  : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
              }}
            >
              {getInitials(salon.name)}
            </div>
          )}
          <h1 className="text-2xl font-serif font-bold">{salon.name}</h1>
          {salon.description && (
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {salon.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {/* Primary CTA - Book Now */}
          <Link to={bookingUrl} className="block">
            <Button
              className="w-full h-14 text-lg gap-3 shadow-lg group"
              style={
                accentColor
                  ? {
                      background: `linear-gradient(to right, ${accentColor}, ${accentColor}cc)`,
                      color: "#fff",
                    }
                  : undefined
              }
            >
              <Calendar className="w-5 h-5" />
              Zarezerwuj wizytę
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          {/* Pricing CTA */}
          <Link to={pricingUrl} className="block">
            <Button variant="outline" className="w-full h-12 gap-2 text-base">
              <Scissors className="w-4 h-4" />
              Zobacz cennik usług
            </Button>
          </Link>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            {salon.phone && (
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => window.open(`tel:${salon.phone!.replace(/\s/g, "")}`)}
              >
                <Phone className="w-4 h-4" />
                Zadzwoń
              </Button>
            )}
            {fullAddress && (
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() =>
                  window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`)
                }
              >
                <MapPin className="w-4 h-4" />
                Mapa
              </Button>
            )}
            {salon.email && !salon.phone && (
              <Button
                variant="outline"
                className="h-12 gap-2"
                onClick={() => window.open(`mailto:${salon.email}`)}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            )}
          </div>

          {/* Email button (shown as full-width when phone + address exist) */}
          {salon.email && salon.phone && (
            <Button
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={() => window.open(`mailto:${salon.email}`)}
            >
              <Mail className="w-4 h-4" />
              Napisz email
            </Button>
          )}

          {/* Info cards */}
          <div className="grid gap-3 pt-2">
            {workingHours && (
              <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Godziny otwarcia</p>
                  <p className="text-muted-foreground">{workingHours}</p>
                </div>
              </div>
            )}
            {fullAddress && (
              <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Adres</p>
                  <p className="text-muted-foreground">{fullAddress}</p>
                </div>
              </div>
            )}
            {salon.phone && (
              <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Telefon</p>
                  <p className="text-muted-foreground">{salon.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social proof / Instagram */}
        {instagramHandle && instagramUrl && (
          <div
            className="text-center pt-4 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              {instagramHandle}
            </a>
          </div>
        )}

        {/* Footer */}
        <div
          className="text-center pt-6 text-xs text-muted-foreground animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <p>
            Powered by{" "}
            <span className="text-primary font-medium">Beauty Calendar</span>
          </p>
        </div>
      </div>
    </div>
  );
}

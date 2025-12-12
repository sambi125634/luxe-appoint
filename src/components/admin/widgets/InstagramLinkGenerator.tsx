import { useState } from "react";
import { Instagram, Copy, QrCode, Link, ExternalLink, Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface InstagramLinkGeneratorProps {
  salonSlug: string;
  salonName: string;
}

export function InstagramLinkGenerator({ salonSlug, salonName }: InstagramLinkGeneratorProps) {
  const [campaignName, setCampaignName] = useState("instagram");
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = window.location.origin;
  
  // Direct booking link with UTM
  const bookingUrl = `${baseUrl}/s/${salonSlug}?utm_source=instagram&utm_medium=social&utm_campaign=${campaignName}`;
  
  // Linktree-style landing page
  const landingUrl = `${baseUrl}/i/${salonSlug}?ref=instagram`;

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopied(type);
    toast.success("Link skopiowany do schowka!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = (elementId: string, filename: string) => {
    const svg = document.getElementById(elementId);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx?.drawImage(img, 0, 0, 512, 512);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Instagram Booking Link</CardTitle>
            <CardDescription>Generuj linki do bio i stories</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="campaign">Nazwa kampanii (do trackingu)</Label>
          <Input
            id="campaign"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="np. black-friday, summer-promo"
          />
          <p className="text-xs text-muted-foreground">
            Używane do śledzenia źródła rezerwacji w raportach
          </p>
        </div>

        <Tabs defaultValue="booking">
          <TabsList className="w-full">
            <TabsTrigger value="booking" className="flex-1">Link do rezerwacji</TabsTrigger>
            <TabsTrigger value="landing" className="flex-1">Mini landing page</TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-4 mt-4">
            {/* Booking Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <Label>Link do rezerwacji (dla bio)</Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={bookingUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(bookingUrl, "booking")}
                >
                  {copied === "booking" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code for Stories */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-muted-foreground" />
                <Label>Kod QR dla Stories</Label>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <QRCodeSVG 
                    id="booking-qr"
                    value={bookingUrl} 
                    size={120}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadQR("booking-qr", `${salonSlug}-instagram-qr.png`)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Pobierz QR (512x512)
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Idealny do dodania na stories
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-4 mt-4">
            {/* Landing Page Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <Label>Mini landing page (Linktree-style)</Label>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={landingUrl} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(landingUrl, "landing")}
                >
                  {copied === "landing" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Strona z logo, opisem i przyciskami: Rezerwuj, Cennik, Kontakt, Mapa
              </p>
            </div>

            {/* QR for landing */}
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG 
                  id="landing-qr"
                  value={landingUrl} 
                  size={120}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQR("landing-qr", `${salonSlug}-landing-qr.png`)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Pobierz QR
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(landingUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Podgląd strony
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Wskazówki dla Instagram:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Dodaj link do bio swojego profilu</li>
            <li>• Użyj kodu QR w stories z CTA "Swipe up" lub "Link w bio"</li>
            <li>• Śledź konwersje w zakładce Statystyki → Źródła</li>
            <li>• Twórz różne kampanie dla różnych promocji</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

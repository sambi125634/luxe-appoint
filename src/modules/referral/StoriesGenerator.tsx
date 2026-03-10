import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Download, Instagram, QrCode, Sparkles } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";

interface StoriesGeneratorProps {
  isDemo?: boolean;
}

export function StoriesGenerator({ isDemo }: StoriesGeneratorProps) {
  const [salonName, setSalonName] = useState("Beauty Studio Anna");
  const [salonHandle, setSalonHandle] = useState("@beautystudioanna");
  const [clientName, setClientName] = useState("Kasia");
  const [referralCode, setReferralCode] = useState("KASIA9");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const referralUrl = `calendar.beauty-funnels.com/salon/demo?ref=${referralCode}`;

  const generateStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1080x1920 story dimensions
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.5, "#16213e");
    grad.addColorStop(1, "#0f3460");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative circles
    ctx.fillStyle = "rgba(201, 169, 110, 0.1)";
    ctx.beginPath();
    ctx.arc(200, 400, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 1500, 250, 0, Math.PI * 2);
    ctx.fill();

    // Salon name
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 72px serif";
    ctx.textAlign = "center";
    ctx.fillText(salonName, 540, 500);

    // Divider
    ctx.strokeStyle = "#C9A96E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 560);
    ctx.lineTo(740, 560);
    ctx.stroke();

    // Main text
    ctx.fillStyle = "#ffffff";
    ctx.font = "48px sans-serif";
    ctx.fillText("Właśnie byłam u", 540, 700);
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(salonHandle, 540, 780);

    // Recommendation text
    ctx.fillStyle = "#ffffff";
    ctx.font = "36px sans-serif";
    ctx.fillText("Polecam z całego serca! ❤️", 540, 900);

    // Booking CTA
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("Zarezerwuj wizytę 👆", 540, 1050);

    // Referral code box
    ctx.fillStyle = "rgba(201, 169, 110, 0.15)";
    ctx.roundRect(290, 1120, 500, 80, 16);
    ctx.fill();
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 40px monospace";
    ctx.fillText(`Kod: ${referralCode}`, 540, 1172);

    // Benefit text
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "32px sans-serif";
    ctx.fillText("Użyj kodu i odbierz -20 zł", 540, 1260);
    ctx.fillText("na pierwszą wizytę! 🎁", 540, 1310);
  };

  const downloadStory = () => {
    generateStory();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `story-${referralCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Generator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Generator kafelka Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nazwa salonu</Label>
              <Input value={salonName} onChange={e => setSalonName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Handle Instagram</Label>
              <Input value={salonHandle} onChange={e => setSalonHandle(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Imię klientki</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Kod polecający</Label>
              <Input value={referralCode} onChange={e => setReferralCode(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateStory} variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Generuj podgląd
            </Button>
            <Button onClick={downloadStory} size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Pobierz PNG (1080×1920)
            </Button>
          </div>

          {/* Preview */}
          <div className="relative bg-muted rounded-xl overflow-hidden mx-auto" style={{ width: 216, height: 384 }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ width: 216, height: 384 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" id="story-preview-placeholder">
              <p className="text-xs text-muted-foreground text-center px-4">
                Kliknij "Generuj podgląd" aby zobaczyć kafelek Stories
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR kod klientki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeCanvas value={referralUrl} size={120} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Unikalny QR kod</p>
              <p className="text-xs text-muted-foreground mb-2">
                Klientka może go wydrukować, wstawić na IG lub udostępnić znajomym. Każde skanowanie jest śledzone.
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{referralUrl}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Jak działa polecanie przez Stories?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { step: 1, text: "Klientka pobiera gotowy kafelek Stories z wbudowanym kodem" },
              { step: 2, text: "Wstawia na Instagram Stories z linkiem/stickerem" },
              { step: 3, text: "Znajome klikają i rezerwują wizytę z kodem polecającym" },
              { step: 4, text: "Obie strony otrzymują benefit — system trackuje automatycznie" },
            ].map(({ step, text }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {step}
                </div>
                <p className="text-sm">{text}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

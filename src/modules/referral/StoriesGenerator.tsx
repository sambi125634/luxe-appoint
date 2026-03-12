import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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

    canvas.width = 1080;
    canvas.height = 1920;

    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.5, "#16213e");
    grad.addColorStop(1, "#0f3460");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = "rgba(201, 169, 110, 0.1)";
    ctx.beginPath();
    ctx.arc(200, 400, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 1500, 250, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 72px serif";
    ctx.textAlign = "center";
    ctx.fillText(salonName, 540, 500);

    ctx.strokeStyle = "#C9A96E";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 560);
    ctx.lineTo(740, 560);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "48px sans-serif";
    ctx.fillText("Właśnie byłam u", 540, 700);
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(salonHandle, 540, 780);

    ctx.fillStyle = "#ffffff";
    ctx.font = "36px sans-serif";
    ctx.fillText("Polecam z całego serca! ❤️", 540, 900);

    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("Zarezerwuj wizytę 👆", 540, 1050);

    ctx.fillStyle = "rgba(201, 169, 110, 0.15)";
    ctx.roundRect(290, 1120, 500, 80, 16);
    ctx.fill();
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 40px monospace";
    ctx.fillText(`Kod: ${referralCode}`, 540, 1172);

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

  const storiesSteps = [
    t("referralModule.storiesStep1"),
    t("referralModule.storiesStep2"),
    t("referralModule.storiesStep3"),
    t("referralModule.storiesStep4"),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            {t("referralModule.storiesGenerator")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("referralModule.salonName")}</Label>
              <Input value={salonName} onChange={e => setSalonName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("referralModule.instagramHandle")}</Label>
              <Input value={salonHandle} onChange={e => setSalonHandle(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("referralModule.clientName")}</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">{t("referralModule.referralCode")}</Label>
              <Input value={referralCode} onChange={e => setReferralCode(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateStory} variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t("referralModule.generatePreview")}
            </Button>
            <Button onClick={downloadStory} size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5" />
              {t("referralModule.downloadPng")}
            </Button>
          </div>

          <div className="relative bg-muted rounded-xl overflow-hidden mx-auto" style={{ width: 216, height: 384 }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ width: 216, height: 384 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" id="story-preview-placeholder">
              <p className="text-xs text-muted-foreground text-center px-4">
                {t("referralModule.clickGenerate")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            {t("referralModule.qrCodeTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeCanvas value={referralUrl} size={120} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{t("referralModule.uniqueQr")}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {t("referralModule.qrDescription")}
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">{referralUrl}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("referralModule.howStoriesWork")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storiesSteps.map((text, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {idx + 1}
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

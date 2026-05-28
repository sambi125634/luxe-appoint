import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ExternalLink, MessageCircle, Check, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LinkQRTabProps {
  salonSlug: string | null;
  salonName: string;
}

export function LinkQRTab({ salonSlug, salonName }: LinkQRTabProps) {
  const slug = salonSlug || "helena-milewska";
  const link = `https://calendar.beauty-funnels.com/s/${slug}`;
  const embed = `<iframe src="${link}" width="100%" height="700" frameborder="0"></iframe>`;
  const bio = `📅 Zarezerwuj wizytę bez dzwonienia 👇\n🔗 calendar.beauty-funnels.com/s/${slug}`;
  const smsInvite = `Aniu, możesz teraz rezerwować wizyty w ${salonName} przez aplikację — bez dzwonienia! Dołącz tutaj: ${link} 💜`;

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("✓ Skopiowano!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = (format: "png" | "svg") => {
    const svg = document.querySelector("#salon-qr svg") as SVGElement | null;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    if (format === "svg") {
      const blob = new Blob([xml], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `qr-${slug}.svg`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const img = new Image();
      const blob = new Blob([xml], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        canvas.toBlob((b) => {
          if (!b) return;
          const u = URL.createObjectURL(b);
          const a = document.createElement("a");
          a.href = u; a.download = `qr-${slug}.png`; a.click();
          URL.revokeObjectURL(u);
        }, "image/png");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
    toast.success(`✓ Pobrano QR (${format.toUpperCase()})`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">🔗 Zaproś klientki do swojej aplikacji</h2>
        <p className="text-sm text-muted-foreground mt-1">Udostępnij gdzie chcesz — każde kliknięcie to nowa klientka w Twojej bazie</p>
      </div>

      {/* Link */}
      <div className="space-y-2">
        <Label>Twój link do aplikacji</Label>
        <Input value={link} readOnly className="font-mono text-sm" />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => copy(link, "link")}>
            {copied === "link" ? <><Check className="w-4 h-4 mr-1 text-green-600" /> Skopiowano!</> : <><Copy className="w-4 h-4 mr-1" /> Kopiuj</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(link, "_blank")}>
            <ExternalLink className="w-4 h-4 mr-1" /> Otwórz
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Zarezerwuj wizytę: ${link}`)}`, "_blank")}>
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* QR */}
      <div className="border rounded-2xl p-6 bg-card flex flex-col items-center gap-4">
        <div id="salon-qr" className="bg-white p-4 rounded-2xl shadow-sm">
          <QRCodeSVG value={link} size={220} level="H" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => downloadQR("png")}><Download className="w-4 h-4 mr-1" /> PNG (social media)</Button>
          <Button variant="outline" size="sm" onClick={() => downloadQR("png")}><Download className="w-4 h-4 mr-1" /> PDF (druk A6)</Button>
          <Button variant="outline" size="sm" onClick={() => downloadQR("svg")}><Download className="w-4 h-4 mr-1" /> SVG (jakość logo)</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">Wydrukuj i umieść przy kasie, na lustrze, na wizytówce</p>
      </div>

      {/* Embed */}
      <div className="space-y-2">
        <Label>Osadź widget na swojej stronie www</Label>
        <pre className="bg-gray-900 text-green-400 rounded-xl p-3 text-xs overflow-x-auto font-mono">{embed}</pre>
        <Button variant="outline" size="sm" onClick={() => copy(embed, "embed")}>
          {copied === "embed" ? <><Check className="w-4 h-4 mr-1 text-green-600" /> Skopiowano!</> : <><Copy className="w-4 h-4 mr-1" /> Kopiuj kod</>}
        </Button>
      </div>

      {/* Instagram bio */}
      <div className="space-y-2">
        <Label>Gotowy tekst do bio na Instagramie</Label>
        <pre className="bg-muted rounded-xl p-3 text-sm whitespace-pre-wrap">{bio}</pre>
        <Button variant="outline" size="sm" onClick={() => copy(bio, "bio")}>
          {copied === "bio" ? <><Check className="w-4 h-4 mr-1 text-green-600" /> Skopiowano!</> : <><Copy className="w-4 h-4 mr-1" /> Kopiuj</>}
        </Button>
      </div>

      {/* SMS invite */}
      <div className="space-y-2">
        <Label>Wyślij zaproszenie SMS do klientek bez aplikacji</Label>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 text-sm">
          31 klientek nie ma jeszcze Twojej aplikacji
        </div>
        <pre className="bg-muted rounded-xl p-3 text-sm whitespace-pre-wrap">{smsInvite}</pre>
        <Button className="w-full" onClick={() => toast.success("✓ Zaproszenia wysłane do 31 klientek")}>
          Wyślij do 31 klientek bez aplikacji
        </Button>
      </div>
    </div>
  );
}
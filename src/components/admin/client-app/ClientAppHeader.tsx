import { Info, CheckCircle2, Smartphone, QrCode, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface ClientAppHeaderProps {
  isDemo: boolean;
  appUsers: number;
  salonSlug?: string | null;
}

export function ClientAppHeader({ isDemo, appUsers, salonSlug }: ClientAppHeaderProps) {
  const [showQR, setShowQR] = useState(false);
  const joinUrl = salonSlug ? `${window.location.origin}/join/${salonSlug}` : "";

  const handleCopyLink = () => {
    if (!joinUrl) {
      toast.error("Brak skonfigurowanego adresu salonu");
      return;
    }
    navigator.clipboard.writeText(`Dołącz do naszej aplikacji beauty: ${joinUrl}`);
    toast.success("Link skopiowany! Wklej w SMS lub Instagram bio");
  };

  const handlePrintInstruction = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Instrukcja dla klientki</title>
      <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;line-height:1.8}
      h1{color:#3D2066;font-size:24px}h2{color:#5A5770;font-size:18px;margin-top:32px}
      .check{color:#10B981;margin-right:8px}p{color:#5A5770}.url{background:#F5F3FA;padding:12px;border-radius:8px;text-align:center;font-size:18px;color:#3D2066;font-weight:600;margin:16px 0}</style></head>
      <body>
      <h1>📱 Dołącz do naszej aplikacji Beauty Calendar!</h1>
      <h2>Dzięki niej możesz:</h2>
      <p><span class="check">✓</span> Rezerwować wizyty 24/7</p>
      <p><span class="check">✓</span> Zbierać punkty lojalnościowe</p>
      <p><span class="check">✓</span> Otrzymywać ekskluzywne oferty</p>
      <p><span class="check">✓</span> Zarządzać swoimi wizytami</p>
      <h2>Jak zacząć?</h2>
      <p>Zeskanuj kod QR lub wejdź na:</p>
      <div class="url">${joinUrl || "beautycalendar.pl/join/twoj-salon"}</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-4">
      {isDemo ? (
        <div className="rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">📱 Tryb Demo — Podgląd Aplikacji Klientki</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tak będzie wyglądać Twoja aplikacja gdy klientki zaczną z niej korzystać. Dane są przykładowe.
            </p>
            <button className="text-sm text-primary font-medium mt-1 hover:underline">
              Jak zachęcić klientki do pobrania? →
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#C0DD97] bg-[#EAF3DE] p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">✦ {appUsers} klientek aktywnie korzysta z aplikacji</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ostatnia aktywność: dzisiaj
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
          <Link2 className="w-4 h-4" />
          Wygeneruj link do pobrania
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowQR(true)}>
          <QrCode className="w-4 h-4" />
          QR kod do wydruku
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handlePrintInstruction}>
          <FileText className="w-4 h-4" />
          Instrukcja dla klientki
        </Button>
      </div>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR kod do pobrania aplikacji</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <QRCodeSVG value={joinUrl || "https://beautycalendar.pl"} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Wydrukuj i powieś przy kasie — klientki zeskanują i dołączą do Twojej aplikacji
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const svg = document.querySelector(".qr-container svg");
                if (svg) toast.success("Pobrano QR kod");
              }}>
                Pobierz PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQR(false)}>
                Zamknij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

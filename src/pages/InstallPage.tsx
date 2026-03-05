import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smartphone, Download, Share, ArrowLeft, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Wróć
        </Button>

        <div className="text-center mb-8">
          <Smartphone className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="font-serif text-3xl font-bold mb-2">Zainstaluj aplikację</h1>
          <p className="text-muted-foreground">Beauty Calendar jako aplikacja mobilna na Twoim telefonie</p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-medium">Aplikacja jest już zainstalowana! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">Znajdziesz ją na ekranie głównym telefonu.</p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />Zainstaluj Beauty Calendar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">📱</span>
                  iPhone (Safari)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p>Otwórz tę stronę w <strong>Safari</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p>Kliknij ikonę <Share className="inline w-4 h-4" /> <strong>Udostępnij</strong> na dole ekranu</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p>Wybierz <strong>"Dodaj do ekranu początkowego"</strong></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">🤖</span>
                  Android (Chrome)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <p>Otwórz tę stronę w <strong>Chrome</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <p>Kliknij <strong>⋮ menu</strong> w prawym górnym rogu</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <p>Wybierz <strong>"Zainstaluj aplikację"</strong> lub <strong>"Dodaj do ekranu głównego"</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

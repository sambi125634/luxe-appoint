import { useState } from "react";
import { Copy, Check, Link, Code, FileCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookingWidget } from "./types";

interface EmbedCodeModalProps {
  widget: BookingWidget;
  isOpen: boolean;
  onClose: () => void;
}

export function EmbedCodeModal({ widget, isOpen, onClose }: EmbedCodeModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [responsive, setResponsive] = useState(true);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(800);

  const baseUrl = window.location.origin;
  const widgetUrl = `${baseUrl}/book/${widget.slug}`;
  
  const getIframeCode = () => {
    if (responsive) {
      return `<div style="position: relative; width: 100%; max-width: 100%; overflow: hidden;">
  <iframe 
    src="${widgetUrl}" 
    style="width: 100%; height: ${height}px; border: none; border-radius: 12px;"
    title="Rezerwacja - ${widget.name}"
    loading="lazy"
  ></iframe>
</div>`;
    }
    return `<iframe 
  src="${widgetUrl}" 
  width="${width}" 
  height="${height}" 
  style="border: none; border-radius: 12px;"
  title="Rezerwacja - ${widget.name}"
  loading="lazy"
></iframe>`;
  };

  const getScriptCode = () => {
    return `<div id="beauty-calendar-widget" data-widget="${widget.slug}"></div>
<script src="${baseUrl}/widget.js" async></script>`;
  };

  const getPopupCode = () => {
    return `<a 
  href="${widgetUrl}" 
  target="_blank"
  rel="noopener noreferrer"
  style="display: inline-block; padding: 12px 24px; background: ${widget.theme.primaryColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
>
  Zarezerwuj wizytę
</a>`;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success("Skopiowano do schowka!");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const CopyButton = ({ text, type }: { text: string; type: string }) => (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => handleCopy(text, type)}
    >
      {copiedType === type ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          Skopiowano
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Kopiuj
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Kod embed - {widget.name}
          </DialogTitle>
          <DialogDescription>
            Wybierz sposób osadzenia widgetu na swojej stronie
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="link" className="gap-2 text-xs sm:text-sm">
              <Link className="w-4 h-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="iframe" className="gap-2 text-xs sm:text-sm">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">iFrame</span>
            </TabsTrigger>
            <TabsTrigger value="script" className="gap-2 text-xs sm:text-sm">
              <FileCode className="w-4 h-4" />
              <span className="hidden sm:inline">Script</span>
            </TabsTrigger>
            <TabsTrigger value="button" className="gap-2 text-xs sm:text-sm">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Przycisk</span>
            </TabsTrigger>
          </TabsList>

          {/* Direct Link */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Link bezpośredni</Label>
              <p className="text-sm text-muted-foreground">
                Udostępnij ten link klientom lub umieść go na swojej stronie
              </p>
            </div>
            <div className="flex gap-2">
              <Input value={widgetUrl} readOnly className="font-mono text-sm" />
              <CopyButton text={widgetUrl} type="link" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => window.open(widgetUrl, '_blank')}>
                <ExternalLink className="w-4 h-4" />
                Otwórz w nowym oknie
              </Button>
            </div>
          </TabsContent>

          {/* iFrame */}
          <TabsContent value="iframe" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Kod iFrame</Label>
              <p className="text-sm text-muted-foreground">
                Wklej ten kod HTML w miejscu, gdzie ma pojawić się widget
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between col-span-2">
                <Label htmlFor="responsive">Responsywny</Label>
                <Switch
                  id="responsive"
                  checked={responsive}
                  onCheckedChange={setResponsive}
                />
              </div>
              
              {!responsive && (
                <div className="space-y-2">
                  <Label>Szerokość: {width}px</Label>
                  <Slider
                    value={[width]}
                    onValueChange={([v]) => setWidth(v)}
                    min={300}
                    max={1200}
                    step={50}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Wysokość: {height}px</Label>
                <Slider
                  value={[height]}
                  onValueChange={([v]) => setHeight(v)}
                  min={400}
                  max={1200}
                  step={50}
                />
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                {getIframeCode()}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={getIframeCode()} type="iframe" />
              </div>
            </div>
          </TabsContent>

          {/* Script */}
          <TabsContent value="script" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Kod JavaScript</Label>
              <p className="text-sm text-muted-foreground">
                Zaawansowana integracja z możliwością personalizacji
              </p>
            </div>

            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                {getScriptCode()}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={getScriptCode()} type="script" />
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Integracja przez script wymaga dodatkowej konfiguracji. 
                Skontaktuj się z pomocą techniczną.
              </p>
            </div>
          </TabsContent>

          {/* Button/Popup */}
          <TabsContent value="button" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Przycisk z linkiem</Label>
              <p className="text-sm text-muted-foreground">
                Prosty przycisk otwierający widget w nowym oknie
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">Podgląd:</p>
              <div dangerouslySetInnerHTML={{ __html: getPopupCode() }} />
            </div>

            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                {getPopupCode()}
              </pre>
              <div className="absolute top-2 right-2">
                <CopyButton text={getPopupCode()} type="button" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Help section */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
          <h4 className="font-medium mb-2">💡 Wskazówki</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Link</strong> - najlepszy do udostępniania przez social media i email</li>
            <li>• <strong>iFrame</strong> - najlepsza opcja do osadzenia na stronie</li>
            <li>• <strong>Przycisk</strong> - idealny do CTA w kampaniach</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

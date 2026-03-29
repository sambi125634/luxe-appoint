import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Star, Users, Send, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";

interface ReferralSettingsProps {
  isDemo?: boolean;
}

export function ReferralSettings({ isDemo }: ReferralSettingsProps) {
  const [programActive, setProgramActive] = useState(isDemo || false);
  const [autoActivateVisits, setAutoActivateVisits] = useState(5);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(isDemo ? "https://search.google.com/local/writereview?placeid=ChIJ..." : "");
  const [facebookReviewUrl, setFacebookReviewUrl] = useState("");
  const [autoSendReview, setAutoSendReview] = useState(true);
  const [reviewDelayHours, setReviewDelayHours] = useState(2);
  const [reviewChannel, setReviewChannel] = useState("sms");

  const handleSave = () => {
    toast.success("Ustawienia programu poleceń zapisane");
  };

  return (
    <div className="space-y-6">
      {/* Program poleceń */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Program poleceń
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Aktywny program poleceń</p>
              <p className="text-xs text-muted-foreground">Klientki automatycznie otrzymują linki polecające</p>
            </div>
            <Switch checked={programActive} onCheckedChange={setProgramActive} />
          </div>

          <div>
            <Label className="text-xs">Aktywuj link po X wizytach</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="number" value={autoActivateVisits} onChange={e => setAutoActivateVisits(Number(e.target.value))} className="w-20" min={1} max={20} />
              <span className="text-sm text-muted-foreground">wizytach klientki</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Po tylu zakończonych wizytach system automatycznie wygeneruje link polecający i wyśle go klientce.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Linki do opinii */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Linki do opinii
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Link do opinii Google</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="https://search.google.com/local/writereview?placeid=..."
                value={googleReviewUrl}
                onChange={e => setGoogleReviewUrl(e.target.value)}
                className="flex-1"
              />
              {googleReviewUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(googleReviewUrl, "_blank")}>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs">Link do opinii Facebook (opcjonalnie)</Label>
            <Input
              placeholder="https://facebook.com/twojsalon/reviews"
              value={facebookReviewUrl}
              onChange={e => setFacebookReviewUrl(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Automatyczne prośby o opinię */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Automatyczne prośby o opinię
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Automatycznie wysyłaj prośby</p>
              <p className="text-xs text-muted-foreground">System wyśle prośbę o opinię po każdej wizycie klientki z NPS 9-10</p>
            </div>
            <Switch checked={autoSendReview} onCheckedChange={setAutoSendReview} />
          </div>

          {autoSendReview && (
            <>
              <div>
                <Label className="text-xs">Opóźnienie wysyłki</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" value={reviewDelayHours} onChange={e => setReviewDelayHours(Number(e.target.value))} className="w-20" min={1} max={72} />
                  <span className="text-sm text-muted-foreground">godzin po wizycie</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zalecamy 2-4 godziny — klientka pamięta wizytę ale nie jest już „w biegu".
                </p>
              </div>

              <div>
                <Label className="text-xs">Kanał wysyłki</Label>
                <Select value={reviewChannel} onValueChange={setReviewChannel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Prośby są wysyłane wyłącznie do klientek z NPS 9-10 — tych które naprawdę lubią Twój salon.
              Dzięki temu unikasz negatywnych opinii.
            </span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full gap-2">
        <Settings className="w-4 h-4" />
        Zapisz ustawienia
      </Button>
    </div>
  );
}

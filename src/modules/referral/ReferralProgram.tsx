import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Copy, Send, Gift, Users, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ReferralProgramProps {
  isDemo?: boolean;
}

const mockReferralCodes = [
  { id: "1", clientName: "Anna Kowalska", code: "ANNA2K", referrals: 5, revenue: 2400, clicks: 12, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 250 },
  { id: "2", clientName: "Maria Nowak", code: "MARIA7", referrals: 3, revenue: 1200, clicks: 8, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 150 },
  { id: "3", clientName: "Kasia Wiśniewska", code: "KASIA9", referrals: 8, revenue: 4100, clicks: 24, rewardType: "free_service", rewardValue: 0, rewardsEarned: 400 },
  { id: "4", clientName: "Ola Zielińska", code: "OLA4Z", referrals: 1, revenue: 350, clicks: 3, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 50 },
];

export function ReferralProgram({ isDemo }: ReferralProgramProps) {
  const [referrerRewardType, setReferrerRewardType] = useState("discount_pln");
  const [referrerRewardValue, setReferrerRewardValue] = useState(50);
  const [referrerRewardDescription, setReferrerRewardDescription] = useState("Rabat 50 zł na kolejną wizytę");
  const [refereeRewardType, setRefereeRewardType] = useState("discount_pln");
  const [refereeRewardValue, setRefereeRewardValue] = useState(30);
  const [refereeRewardDescription, setRefereeRewardDescription] = useState("Rabat 30 zł na pierwszą wizytę");

  const referralCodes = isDemo ? mockReferralCodes : [];

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`calendar.beauty-funnels.com/salon/demo?ref=${code}`);
    toast.success("Link skopiowany do schowka");
  };

  const rewardSuffix = (type: string) => type === "discount_percent" ? "%" : "zł";

  return (
    <div className="space-y-6">
      {/* Konfiguracja benefitów */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefit dla polecającej */}
        <div className="border-2 border-primary/20 rounded-2xl p-5 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">💜</div>
            <div>
              <p className="font-semibold">Dla polecającej klientki</p>
              <p className="text-xs text-muted-foreground">Co dostaje gdy ktoś przyjdzie przez jej link?</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Typ benefitu</Label>
              <Select value={referrerRewardType} onValueChange={setReferrerRewardType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_pln">💸 Rabat (zł)</SelectItem>
                  <SelectItem value="discount_percent">% Rabat procentowy</SelectItem>
                  <SelectItem value="free_service">🎁 Darmowy zabieg</SelectItem>
                  <SelectItem value="points">⭐ Punkty lojalnościowe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {referrerRewardType !== "free_service" && (
              <div>
                <Label className="text-xs">Wartość</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={referrerRewardValue} onChange={e => setReferrerRewardValue(Number(e.target.value))} className="w-24" />
                  <span className="text-sm text-muted-foreground">{rewardSuffix(referrerRewardType)}</span>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Opis dla klientki</Label>
              <Input placeholder="np. Rabat 50 zł na kolejną wizytę" value={referrerRewardDescription} onChange={e => setReferrerRewardDescription(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Benefit dla nowej klientki */}
        <div className="border-2 border-pink-200 rounded-2xl p-5 bg-pink-50/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-xl">🌸</div>
            <div>
              <p className="font-semibold">Dla nowej klientki</p>
              <p className="text-xs text-muted-foreground">Co dostaje nowa osoba przychodząc przez link?</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Typ benefitu</Label>
              <Select value={refereeRewardType} onValueChange={setRefereeRewardType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_pln">💸 Rabat (zł)</SelectItem>
                  <SelectItem value="discount_percent">% Rabat procentowy</SelectItem>
                  <SelectItem value="free_service">🎁 Darmowy zabieg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {refereeRewardType !== "free_service" && (
              <div>
                <Label className="text-xs">Wartość</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={refereeRewardValue} onChange={e => setRefereeRewardValue(Number(e.target.value))} className="w-24" />
                  <span className="text-sm text-muted-foreground">{rewardSuffix(refereeRewardType)}</span>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Opis dla klientki</Label>
              <Input placeholder="np. Rabat 30 zł na pierwszą wizytę" value={refereeRewardDescription} onChange={e => setRefereeRewardDescription(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Podgląd wiadomości */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3">PODGLĄD — wiadomość wysyłana klientce po 5. wizycie:</p>
        <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
          <p className="text-sm">
            Cześć <strong>{"{imię}"}</strong>! 🌸
            <br /><br />
            Jesteś jedną z naszych ulubionych klientek i chcemy Ci za to podziękować!
            <br /><br />
            Stworzyłam dla Ciebie specjalny link — gdy znajoma zarezerwuje przez niego wizytę,
            Ty dostajesz <strong>{referrerRewardDescription || "[Twój benefit]"}</strong>,
            a ona <strong>{refereeRewardDescription || "[benefit dla nowej]"}</strong>.
            <br /><br />
            Twój link: <span className="text-primary underline">{"{link_polecajacy}"}</span>
            <br /><br />
            Dziękuję za zaufanie! 💜
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="text-xs">📱 SMS: skrócona wersja</Badge>
          <Badge variant="outline" className="text-xs">📧 Email: pełna wersja</Badge>
        </div>
      </div>

      {/* Lista ambasadorek */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Aktywne ambasadorki
            </CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Gift className="w-3.5 h-3.5" />
              Aktywuj ręcznie
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {referralCodes.map((code, idx) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {code.referrals}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{code.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{code.code}</code>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => handleCopyLink(code.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <p className="font-semibold text-sm text-green-600">{code.revenue.toLocaleString()} zł</p>
                    <p className="text-muted-foreground">Kliknięcia: {code.clicks} · Polecenia: {code.referrals}</p>
                    <p className="text-muted-foreground">Należny rabat: {code.rewardsEarned} zł</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {referralCodes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Brak aktywnych ambasadorek. Program aktywuje się automatycznie po 5. wizycie klientki.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

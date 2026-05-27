import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Send, Gift, Users, Save, Info, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useReferralConfig,
  useUpdateReferralConfig,
  buildRewardDescription,
  isAutoDescription,
  type ReferralProgramConfig,
} from "@/hooks/useReferralConfig";

interface ReferralProgramProps {
  isDemo?: boolean;
}

const mockReferralCodes = [
  { id: "1", clientName: "Anna Kowalska", code: "ANNA2K", referrals: 5, revenue: 2400, clicks: 12, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 250 },
  { id: "2", clientName: "Maria Nowak", code: "MARIA7", referrals: 3, revenue: 1200, clicks: 8, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 150 },
  { id: "3", clientName: "Kasia Wiśniewska", code: "KASIA9", referrals: 8, revenue: 4100, clicks: 24, rewardType: "free_service", rewardValue: 0, rewardsEarned: 400 },
  { id: "4", clientName: "Ola Zielińska", code: "OLA4Z", referrals: 1, revenue: 350, clicks: 3, rewardType: "discount_pln", rewardValue: 50, rewardsEarned: 50 },
];

const DEFAULT_TEMPLATE =
  "Cześć {imię}! 🌸\n\nJesteś jedną z naszych ulubionych klientek i chcemy Ci za to podziękować!\n\nStworzyłam dla Ciebie specjalny link — gdy znajoma zarezerwuje przez niego wizytę, Ty dostajesz {benefit_polecajacej}, a ona {benefit_nowej}.\n\nTwój link: {link}\n\nDziękuję za zaufanie! 💜";

export function ReferralProgram({ isDemo }: ReferralProgramProps) {
  const { data: config, isLoading } = useReferralConfig(isDemo);
  const updateConfig = useUpdateReferralConfig(isDemo);

  // Local draft, synced from config
  const [draft, setDraft] = useState<Partial<ReferralProgramConfig>>({});

  useEffect(() => {
    if (config) setDraft(config);
  }, [config]);

  const value = useMemo<ReferralProgramConfig | null>(
    () => (config ? ({ ...config, ...draft } as ReferralProgramConfig) : null),
    [config, draft]
  );

  const setField = <K extends keyof ReferralProgramConfig>(key: K, v: ReferralProgramConfig[K]) => {
    setDraft((d) => ({ ...d, [key]: v }));
  };

  // Auto-fill referrer description when type/value changes (unless manually edited)
  useEffect(() => {
    if (!value) return;
    if (isAutoDescription(value.referrer_reward_description, value.referrer_reward_type, "referrer")) {
      const next = buildRewardDescription(value.referrer_reward_type, Number(value.referrer_reward_value), "referrer");
      if (next && next !== value.referrer_reward_description) {
        setDraft((d) => ({ ...d, referrer_reward_description: next }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.referrer_reward_type, value?.referrer_reward_value]);

  useEffect(() => {
    if (!value) return;
    if (isAutoDescription(value.referee_reward_description, value.referee_reward_type, "referee")) {
      const next = buildRewardDescription(value.referee_reward_type, Number(value.referee_reward_value), "referee");
      if (next && next !== value.referee_reward_description) {
        setDraft((d) => ({ ...d, referee_reward_description: next }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.referee_reward_type, value?.referee_reward_value]);

  const referralCodes = isDemo ? mockReferralCodes : [];

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`calendar.beauty-funnels.com/salon/demo?ref=${code}`);
    toast.success("Link skopiowany do schowka");
  };

  const rewardSuffix = (type: string) => type === "discount_percent" ? "%" : "zł";

  const renderedPreview = useMemo(() => {
    if (!value) return "";
    return (value.referral_message_template || DEFAULT_TEMPLATE)
      .replace(/\{imię\}/g, "Anna")
      .replace(/\{benefit_polecajacej\}/g, value.referrer_reward_description || "[Twój benefit]")
      .replace(/\{benefit_nowej\}/g, value.referee_reward_description || "[benefit dla nowej]")
      .replace(/\{link\}/g, "calendar.beauty-funnels.com/r/ANNA2K")
      .replace(/\{wizyt\}/g, String(value.activate_after_visits || 5));
  }, [value]);

  const isDirty = useMemo(() => {
    if (!config || !value) return false;
    return (Object.keys(draft) as Array<keyof ReferralProgramConfig>).some(
      (k) => draft[k] !== config[k]
    );
  }, [config, value, draft]);

  const handleSave = () => {
    if (!config) return;
    const patch: Partial<ReferralProgramConfig> = {};
    (Object.keys(draft) as Array<keyof ReferralProgramConfig>).forEach((k) => {
      if (draft[k] !== config[k]) (patch as Record<string, unknown>)[k] = draft[k];
    });
    if (Object.keys(patch).length === 0) return;
    updateConfig.mutate(patch);
  };

  const resetTemplate = () => setField("referral_message_template", DEFAULT_TEMPLATE);

  if (isLoading || !value) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Wczytywanie konfiguracji…</div>;
  }

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
              <Select value={value.referrer_reward_type} onValueChange={(v) => setField("referrer_reward_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_pln">💸 Rabat (zł)</SelectItem>
                  <SelectItem value="discount_percent">% Rabat procentowy</SelectItem>
                  <SelectItem value="free_service">🎁 Darmowy zabieg</SelectItem>
                  <SelectItem value="points">⭐ Punkty lojalnościowe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {value.referrer_reward_type !== "free_service" && (
              <div>
                <Label className="text-xs">Wartość</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={value.referrer_reward_value} onChange={e => setField("referrer_reward_value", Number(e.target.value))} className="w-24" />
                  <span className="text-sm text-muted-foreground">{rewardSuffix(value.referrer_reward_type)}</span>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Opis dla klientki</Label>
              <Input placeholder="np. Rabat 50 zł na kolejną wizytę" value={value.referrer_reward_description} onChange={e => setField("referrer_reward_description", e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">Uzupełnia się automatycznie z typu + wartości. Możesz nadpisać.</p>
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
              <Select value={value.referee_reward_type} onValueChange={(v) => setField("referee_reward_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_pln">💸 Rabat (zł)</SelectItem>
                  <SelectItem value="discount_percent">% Rabat procentowy</SelectItem>
                  <SelectItem value="free_service">🎁 Darmowy zabieg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {value.referee_reward_type !== "free_service" && (
              <div>
                <Label className="text-xs">Wartość</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={value.referee_reward_value} onChange={e => setField("referee_reward_value", Number(e.target.value))} className="w-24" />
                  <span className="text-sm text-muted-foreground">{rewardSuffix(value.referee_reward_type)}</span>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs">Opis dla klientki</Label>
              <Input placeholder="np. Rabat 30 zł na pierwszą wizytę" value={value.referee_reward_description} onChange={e => setField("referee_reward_description", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Edytowalna wiadomość po N wizytach */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>✏️ Wiadomość wysyłana klientce po {value.activate_after_visits}. wizycie</span>
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={resetTemplate}>
              <RotateCcw className="w-3.5 h-3.5" /> Domyślna treść
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Treść wiadomości</Label>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-muted-foreground">Kanał:</Label>
                <Select value={value.referral_message_channel} onValueChange={(v) => setField("referral_message_channel", v)}>
                  <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">📱 SMS</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={value.referral_message_template}
              onChange={(e) => setField("referral_message_template", e.target.value)}
              rows={8}
              className="font-mono text-xs"
            />
            <div className="mt-2 p-2 bg-blue-50 rounded-md text-[11px] text-blue-700 flex items-start gap-2">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Dostępne placeholdery: <code className="bg-white px-1 rounded">{"{imię}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{benefit_polecajacej}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{benefit_nowej}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{link}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{wizyt}"}</code>
              </span>
            </div>
          </div>

          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2">PODGLĄD — jak zobaczy ją klientka:</p>
            <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
              <p className="text-sm whitespace-pre-wrap">{renderedPreview}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Kanał: {value.referral_message_channel.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!isDirty || updateConfig.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {updateConfig.isPending ? "Zapisywanie…" : "Zapisz zmiany"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              Brak aktywnych ambasadorek. Program aktywuje się automatycznie po {value.activate_after_visits}. wizycie klientki.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, ShieldCheck, Save, HelpCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentsSettingsProps {
  isDemo?: boolean;
}

export function PaymentsSettings({ isDemo }: PaymentsSettingsProps) {
  const { salonId } = useSalonId();
  const qc = useQueryClient();

  const { data: salon, isLoading } = useQuery({
    queryKey: ["payments-salon-config", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data, error } = await supabase
        .from("salons")
        .select("p24_merchant_id, p24_pos_id, payment_required, deposit_percent")
        .eq("id", salonId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const [merchantId, setMerchantId] = useState("");
  const [posId, setPosId] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [depositPercent, setDepositPercent] = useState(0);
  const [currency] = useState("PLN");
  const [vatRate, setVatRate] = useState("23");

  useEffect(() => {
    if (salon) {
      setMerchantId(salon.p24_merchant_id || "");
      setPosId(salon.p24_pos_id || "");
      setPaymentRequired(!!salon.payment_required);
      setDepositPercent(Number(salon.deposit_percent) || 0);
    } else if (isDemo) {
      setMerchantId("12345");
      setPosId("12345");
      setPaymentRequired(true);
      setDepositPercent(30);
    }
  }, [salon, isDemo]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!salonId) throw new Error("Brak salonu");
      const { error } = await supabase
        .from("salons")
        .update({
          p24_merchant_id: merchantId || null,
          p24_pos_id: posId || null,
          payment_required: paymentRequired,
          deposit_percent: depositPercent,
        })
        .eq("id", salonId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Zapisano ustawienia płatności");
      qc.invalidateQueries({ queryKey: ["payments-salon-config"] });
    },
    onError: (e: any) => toast.error("Nie udało się zapisać: " + e.message),
  });

  const isConfigured = !!merchantId && !!posId;

  if (isLoading && !isDemo) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Płatności i Finanse</h2>
          <p className="text-muted-foreground mt-1">
            Konfiguruj bramki płatności, walutę, VAT i parametry przedpłat.
          </p>
        </div>

        {/* Przelewy24 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Przelewy24
                </CardTitle>
                <CardDescription>Polska bramka płatności obsługująca BLIK, karty i przelewy ekspresowe.</CardDescription>
              </div>
              {isConfigured ? (
                <Badge variant="default" className="gap-1"><ShieldCheck className="w-3 h-3" /> Aktywne</Badge>
              ) : (
                <Badge variant="outline">Nieskonfigurowane</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Merchant ID
                  <Tooltip><TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>ID sprzedawcy z panelu Przelewy24 (np. 12345).</TooltipContent></Tooltip>
                </Label>
                <Input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} placeholder="12345" disabled={isDemo} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  POS ID
                  <Tooltip><TooltipTrigger><HelpCircle className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>ID punktu sprzedaży. Zwykle taki sam jak Merchant ID.</TooltipContent></Tooltip>
                </Label>
                <Input value={posId} onChange={(e) => setPosId(e.target.value)} placeholder="12345" disabled={isDemo} />
              </div>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                Klucz API (CRC) jest przechowywany jako zaszyfrowany sekret platformy. Skontaktuj się ze wsparciem, aby go ustawić.
                <a href="https://panel.przelewy24.pl" target="_blank" rel="noopener" className="ml-1 inline-flex items-center gap-1 text-primary underline">
                  Panel P24 <ExternalLink className="w-3 h-3" />
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Prepayment policy */}
        <Card>
          <CardHeader>
            <CardTitle>Polityka przedpłat</CardTitle>
            <CardDescription>Kiedy i ile klientka musi zapłacić przy rezerwacji.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label className="text-base">Wymagaj przedpłaty</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Klientki muszą zapłacić przy rezerwacji. Inaczej: tylko klientki wysokiego ryzyka (AI {">"}60).
                </p>
              </div>
              <Switch checked={paymentRequired} onCheckedChange={setPaymentRequired} disabled={isDemo} />
            </div>
            <div className="space-y-2">
              <Label>Wysokość przedpłaty: <strong>{depositPercent}%</strong></Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={depositPercent}
                onChange={(e) => setDepositPercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                disabled={isDemo}
              />
              <p className="text-xs text-muted-foreground">
                0% = pełna kwota wymagana przy wizycie. 30% = standardowy zadatek. 100% = pełna płatność z góry.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency & VAT */}
        <Card>
          <CardHeader>
            <CardTitle>Waluta i VAT</CardTitle>
            <CardDescription>Domyślne parametry rozliczeń i faktur.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Waluta</Label>
                <Input value={currency} disabled />
                <p className="text-xs text-muted-foreground">Obecnie wspierane: PLN.</p>
              </div>
              <div className="space-y-2">
                <Label>Stawka VAT (%)</Label>
                <Input
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  disabled={isDemo}
                />
                <p className="text-xs text-muted-foreground">Standard dla usług kosmetycznych: 23%. Zwolnione: 0%.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stripe placeholder */}
        <Card className="opacity-70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">Stripe <Badge variant="outline">Wkrótce</Badge></CardTitle>
                <CardDescription>Międzynarodowa bramka płatności (karty, Apple Pay, Google Pay).</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isDemo && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Tryb demo — zmiany nie są zapisywane.</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={isDemo || saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Zapisywanie..." : "Zapisz ustawienia płatności"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
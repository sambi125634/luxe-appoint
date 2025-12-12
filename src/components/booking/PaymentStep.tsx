import { useState } from "react";
import { CreditCard, Wallet, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PrepaymentConfig {
  enabled: boolean;
  type: 'full' | 'fixed' | 'percentage';
  amount: number;
  requireForHighRisk: boolean;
  requireForNewClients: boolean;
}

interface PaymentStepProps {
  appointmentId: string;
  servicePrice: number;
  serviceName: string;
  clientEmail: string;
  clientName: string;
  salonId: string;
  prepaymentConfig: PrepaymentConfig;
  onPaymentComplete: () => void;
  onSkip?: () => void;
  isDemo?: boolean;
}

export function PaymentStep({
  appointmentId,
  servicePrice,
  serviceName,
  clientEmail,
  clientName,
  salonId,
  prepaymentConfig,
  onPaymentComplete,
  onSkip,
  isDemo = false,
}: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate prepayment amount
  const calculatePrepaymentAmount = (): number => {
    switch (prepaymentConfig.type) {
      case 'full':
        return servicePrice;
      case 'percentage':
        return Math.round((servicePrice * prepaymentConfig.amount) / 100);
      case 'fixed':
      default:
        return Math.min(prepaymentConfig.amount, servicePrice);
    }
  };

  const prepaymentAmount = calculatePrepaymentAmount();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // In demo mode, simulate payment success after short delay
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "To jest demo!",
        description: "W prawdziwym systemie zostałbyś przekierowany do Przelewy24.",
      });
      setIsProcessing(false);
      onPaymentComplete();
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-p24", {
        body: {
          appointmentId,
          amount: prepaymentAmount,
          clientEmail,
          clientName,
          description: `Zaliczka - ${serviceName}`,
          salonId,
        },
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        // Redirect to Przelewy24
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Brak URL płatności");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Błąd płatności",
        description: error.message || "Nie udało się zainicjować płatności. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isSkippable = !prepaymentConfig.requireForHighRisk && !prepaymentConfig.requireForNewClients;

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-primary/20 text-sm text-center">
          <span className="font-medium text-primary">🎭 Tryb demo</span>
          <span className="text-muted-foreground ml-2">- płatności są symulowane</span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold mb-2">Zaliczka</h2>
        <p className="text-muted-foreground">
          Aby potwierdzić rezerwację, wpłać zaliczkę
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            {prepaymentAmount} zł
          </CardTitle>
          <CardDescription>
            {prepaymentConfig.type === 'full' 
              ? 'Pełna cena usługi'
              : prepaymentConfig.type === 'percentage'
                ? `${prepaymentConfig.amount}% ceny usługi`
                : 'Stała zaliczka'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Usługa</span>
            <span className="font-medium">{serviceName}</span>
          </div>
          <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
            <span className="text-muted-foreground">Cena usługi</span>
            <span className="font-medium">{servicePrice} zł</span>
          </div>
          {prepaymentConfig.type !== 'full' && (
            <div className="flex items-center justify-between text-sm p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-700 dark:text-emerald-300">Do zapłaty na miejscu</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {servicePrice - prepaymentAmount} zł
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment methods info */}
      <div className="flex flex-wrap justify-center gap-3">
        <Badge variant="outline" className="py-2 px-4">
          <img 
            src="https://www.przelewy24.pl/themes/developer/assets/images/logo.svg" 
            alt="P24" 
            className="h-4 mr-2"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          BLIK
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <CreditCard className="w-4 h-4 mr-2" />
          Karty
        </Badge>
        <Badge variant="outline" className="py-2 px-4">
          <Wallet className="w-4 h-4 mr-2" />
          Przelewy
        </Badge>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg text-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">Bezpieczna płatność</p>
          <p className="text-muted-foreground text-xs mt-1">
            Płatność realizowana przez Przelewy24 - lidera płatności online w Polsce.
            Twoje dane są szyfrowane i chronione.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Button
          variant="luxury"
          size="lg"
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Przekierowywanie...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Zapłać {prepaymentAmount} zł
            </>
          )}
        </Button>

        {isSkippable && onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Pomiń płatność online (zapłacę na miejscu)
          </Button>
        )}
      </div>

      {/* Warning for required payment */}
      {!isSkippable && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-300">Zaliczka wymagana</p>
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
              Rezerwacja zostanie potwierdzona dopiero po wpłacie zaliczki.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

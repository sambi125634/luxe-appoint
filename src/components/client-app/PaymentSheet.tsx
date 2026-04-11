import { useState } from "react";
import { CreditCard, Wallet, Loader2, ShieldCheck, Banknote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type PaymentMethod = "blik" | "card" | "transfer";

interface PaymentSheetProps {
  appointmentId: string;
  servicePrice: number;
  serviceName: string;
  salonName: string;
  salonId: string;
  dateTime: string;
  depositPercent: number;
  onPaymentComplete: () => void;
  onSkip?: () => void;
}

export function PaymentSheet({
  appointmentId,
  servicePrice,
  serviceName,
  salonName,
  salonId,
  dateTime,
  depositPercent,
  onPaymentComplete,
  onSkip,
}: PaymentSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("blik");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentAmount = depositPercent > 0
    ? Math.round(servicePrice * depositPercent / 100)
    : servicePrice;

  const isDeposit = depositPercent > 0 && depositPercent < 100;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const returnUrl = `${window.location.origin}/app/payment-success?session=`;
      
      const { data, error } = await supabase.functions.invoke("create-payment-p24", {
        body: {
          appointmentId,
          amount: paymentAmount,
          salonId,
          description: `${isDeposit ? "Depozyt" : "Wizyta"}: ${serviceName} - ${salonName}`,
          clientEmail: "",
          clientName: "",
          methodRefId: selectedMethod === "blik" ? "blik" : undefined,
        },
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Brak URL płatności");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Nie udało się zainicjować płatności.";
      console.error("Payment error:", error);
      toast.error("Błąd płatności", { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  const methods: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "blik",
      label: "BLIK",
      description: "Najszybsza metoda w Polsce",
      icon: <Wallet className="w-5 h-5" />,
      badge: "Polecane",
    },
    {
      id: "card",
      label: "Karta płatnicza",
      description: "Visa, Mastercard, Maestro",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "transfer",
      label: "Przelew błyskawiczny",
      description: "Ponad 20 banków",
      icon: <Banknote className="w-5 h-5" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          {isDeposit ? "Wpłać depozyt" : "Opłać wizytę"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Bezpieczna płatność przez Przelewy24
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Usługa</span>
          <span className="font-medium text-foreground">{serviceName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Salon</span>
          <span className="font-medium text-foreground">{salonName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Termin</span>
          <span className="font-medium text-foreground">{dateTime}</span>
        </div>
        <Separator />
        {isDeposit && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cena usługi</span>
            <span className="text-foreground">{servicePrice} zł</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="font-medium text-foreground">
            {isDeposit ? `Depozyt ${depositPercent}%` : "Do zapłaty"}
          </span>
          <span className="text-xl font-bold text-primary">{paymentAmount} zł</span>
        </div>
        {isDeposit && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 text-center">
            Pozostałe {servicePrice - paymentAmount} zł zapłacisz na miejscu
          </div>
        )}
      </div>

      {/* Payment methods */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground px-1">Metoda płatności</p>
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left",
              selectedMethod === method.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-card hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              selectedMethod === method.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {method.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">{method.label}</span>
                {method.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                    {method.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              selectedMethod === method.id ? "border-primary" : "border-muted-foreground/30"
            )}>
              {selectedMethod === method.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-xl text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="text-muted-foreground">
          Płatność szyfrowana SSL. Dane chronione przez Przelewy24.
        </span>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full h-12 rounded-xl font-semibold text-base gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Przekierowywanie...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Przejdź do płatności — {paymentAmount} zł
            </>
          )}
        </Button>

        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="w-full text-muted-foreground text-xs"
          >
            Zapłać później (na miejscu)
          </Button>
        )}
      </div>
    </motion.div>
  );
}

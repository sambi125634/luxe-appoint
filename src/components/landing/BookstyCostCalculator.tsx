import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BookstyCostCalculatorProps {
  onScrollToForm: () => void;
}

export const BookstyCostCalculator = ({ onScrollToForm }: BookstyCostCalculatorProps) => {
  const [monthlyBookings, setMonthlyBookings] = useState(150);
  const [avgServicePrice, setAvgServicePrice] = useState(150);
  const [commissionPercent, setCommissionPercent] = useState(30);

  const monthlyLoss = Math.round(monthlyBookings * avgServicePrice * (commissionPercent / 100));
  const annualLoss = monthlyLoss * 12;

  return (
    <section id="calculator" className="py-20 lg:py-28">
      <div className="container">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Policz ile kosztuje Cię{" "}
              <span className="text-primary">marketplace</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Platformy typu B{"🤡"}SY pobierają do 45% prowizji od nowych klientek z ich systemu. Policz ile to kosztuje Twój salon.
            </p>
          </div>

          <div className="relative bg-white dark:bg-card rounded-3xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.3)] border border-border/30 p-8 md:p-10 overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-destructive/8 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Kalkulator kosztów marketplace</h3>
                </div>
              </div>

              <div className="space-y-7 mb-8">
                {/* Slider 1 */}
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Ile nowych klientek z marketplace miesięcznie?</Label>
                    <span className="font-bold text-sm bg-primary/5 px-3 py-1 rounded-full">{monthlyBookings}</span>
                  </div>
                  <Slider
                    value={[monthlyBookings]}
                    onValueChange={([v]) => setMonthlyBookings(v)}
                    min={10} max={200} step={5}
                    className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>

                {/* Slider 2 */}
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Średnia cena Twojej usługi</Label>
                    <span className="font-bold text-sm bg-primary/5 px-3 py-1 rounded-full">{avgServicePrice} zł</span>
                  </div>
                  <Slider
                    value={[avgServicePrice]}
                    onValueChange={([v]) => setAvgServicePrice(v)}
                    min={50} max={400} step={10}
                    className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>50 zł</span>
                    <span>400 zł</span>
                  </div>
                </div>

                {/* Slider 3 */}
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Prowizja marketplace od nowych klientek</Label>
                    <span className="font-bold text-sm bg-destructive/5 text-destructive px-3 py-1 rounded-full">{commissionPercent}%</span>
                  </div>
                  <Slider
                    value={[commissionPercent]}
                    onValueChange={([v]) => setCommissionPercent(v)}
                    min={20} max={45} step={1}
                    className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>20%</span>
                    <span>45%</span>
                  </div>
                </div>
              </div>

              {/* Results card */}
              <div className="bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/20 dark:to-muted/10 rounded-2xl p-6 space-y-4 mb-6 border border-border/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Oddajesz marketplace ROCZNIE</span>
                  <motion.span
                    key={annualLoss}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="font-black text-3xl text-destructive tracking-tight"
                  >
                    -{annualLoss.toLocaleString('pl-PL')} zł
                  </motion.span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Tyle oddajesz za klientki pozyskane przez marketplace. A potem nie dostajesz żadnej pomocy w ich utrzymaniu.
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">Z Beauty Calendar:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">0 zł prowizji. Stała opłata od 99 zł/mies.</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 gap-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                onClick={onScrollToForm}
              >
                Zacznij za darmo i zostaw prowizje za sobą
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
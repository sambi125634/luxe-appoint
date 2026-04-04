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
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Policz ile kosztuje Ci{" "}
              <span className="text-primary">marketplace</span>
            </h2>
            <p className="text-muted-foreground">
              Platformy typu B{"🤡"}SY pobierają do 45% prowizji od nowych klientek z ich systemu. Policz ile to kosztuje Twój salon.
            </p>
          </div>

          <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-2 border-destructive/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Kalkulator koszt&#243;w marketplace</h3>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Ile nowych klientek z marketplace masz miesi&#281;cznie?</Label>
                  <span className="font-bold text-sm">{monthlyBookings}</span>
                </div>
                <Slider
                  value={[monthlyBookings]}
                  onValueChange={([v]) => setMonthlyBookings(v)}
                  min={10} max={200} step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10</span>
                  <span>200</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Jaka jest &#347;rednia cena Twojej us&#322;ugi?</Label>
                  <span className="font-bold text-sm">{avgServicePrice} z&#322;</span>
                </div>
                <Slider
                  value={[avgServicePrice]}
                  onValueChange={([v]) => setAvgServicePrice(v)}
                  min={50} max={400} step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50 z&#322;</span>
                  <span>400 z&#322;</span>
                </div>
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Jaki procent prowizji pobiera marketplace od nowych klientek?</Label>
                  <span className="font-bold text-sm text-destructive">{commissionPercent}%</span>
                </div>
                <Slider
                  value={[commissionPercent]}
                  onValueChange={([v]) => setCommissionPercent(v)}
                  min={20} max={45} step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>20%</span>
                  <span>45%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-background/50 dark:bg-black/20 rounded-xl p-5 space-y-3 mb-5">
              <div className="flex justify-between items-center border-b border-destructive/20 pb-3">
                <span className="font-bold">Oddajesz marketplace ROCZNIE:</span>
                <motion.span
                  key={annualLoss}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="font-black text-3xl text-destructive"
                >
                  -{annualLoss.toLocaleString('pl-PL')} z&#322;
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Tyle oddajesz za klientki pozyskane przez marketplace. A potem nie dostajesz &#380;adnej pomocy w ich utrzymaniu.
              </p>
              <div className="flex justify-between items-center bg-emerald-500/10 rounded-lg p-3 mt-2">
                <span className="text-sm font-medium text-emerald-600">Z Beauty Calendar:</span>
                <span className="font-bold text-emerald-600">0 z&#322; prowizji. Sta&#322;a op&#322;ata od 99 z&#322;/mies.</span>
              </div>
            </div>

            <Button className="w-full h-12 gap-2 text-base" onClick={onScrollToForm}>
              Zacznij za darmo i zostaw prowizje za sob&#261;
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
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
  const threeYearLoss = annualLoss * 3;

  return (
    <section className="py-20 lg:py-28">
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
              Ile kosztuje Cię Booksy?{" "}
              <span className="text-primary">Policz sama.</span>
            </h2>
            <p className="text-muted-foreground">
              Przesuń suwaki i zobacz ile naprawdę tracisz na prowizjach.
            </p>
          </div>

          <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-2 border-destructive/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Kalkulator strat Booksy</h3>
                <p className="text-sm text-muted-foreground">Sprawdź ile naprawdę tracisz</p>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {/* Slider 1: Monthly bookings */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Liczba rezerwacji przez Booksy / miesiąc</Label>
                  <span className="font-bold text-sm">{monthlyBookings}</span>
                </div>
                <Slider
                  value={[monthlyBookings]}
                  onValueChange={([v]) => setMonthlyBookings(v)}
                  min={50} max={500} step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50</span>
                  <span>500</span>
                </div>
              </div>

              {/* Slider 2: Average service price */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Średnia cena usługi (zł)</Label>
                  <span className="font-bold text-sm">{avgServicePrice} zł</span>
                </div>
                <Slider
                  value={[avgServicePrice]}
                  onValueChange={([v]) => setAvgServicePrice(v)}
                  min={50} max={400} step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50 zł</span>
                  <span>400 zł</span>
                </div>
              </div>

              {/* Slider 3: Commission % */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Prowizja Booksy (%)</Label>
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
              <div className="flex justify-between items-center">
                <span className="text-sm">Strata miesięczna:</span>
                <span className="font-bold text-destructive">-{monthlyLoss.toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="flex justify-between items-center border-t border-destructive/20 pt-3">
                <span className="font-bold">Tracisz ROCZNIE:</span>
                <motion.span
                  key={annualLoss}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="font-black text-3xl text-destructive"
                >
                  -{annualLoss.toLocaleString('pl-PL')} zł
                </motion.span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Za 3 lata stracisz:</span>
                <span className="font-bold text-destructive">-{threeYearLoss.toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-500/10 rounded-lg p-3 mt-2">
                <span className="text-sm font-medium text-emerald-600">Z Beauty Calendar:</span>
                <span className="font-bold text-emerald-600">0 zł prowizji. Oszczędzasz {annualLoss.toLocaleString('pl-PL')} zł/rok</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mb-4">
              *prowizja Booksy Boost: 20-45% netto od wartości rezerwacji przez marketplace
            </p>

            <Button className="w-full h-12 gap-2 text-base" onClick={onScrollToForm}>
              Przestań tracić — zacznij za darmo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

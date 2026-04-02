import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BookstyCostCalculatorProps {
  onScrollToForm: () => void;
}

export const BookstyCostCalculator = ({ onScrollToForm }: BookstyCostCalculatorProps) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [booksyPercent, setBooksyPercent] = useState(40);
  const [noShowCount, setNoShowCount] = useState(3);
  const [avgAppointmentValue, setAvgAppointmentValue] = useState(250);

  const booksyRevenue = monthlyRevenue * (booksyPercent / 100);
  const booksyMonthlyCost = booksyRevenue * 0.40;
  const booksyAnnualCost = Math.round(booksyMonthlyCost * 12);
  const noShowAnnualCost = Math.round(noShowCount * avgAppointmentValue * 52);
  const totalAnnualLoss = booksyAnnualCost + noShowAnnualCost;

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

            <div className="space-y-5 mb-6">
              {/* Pole 1 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Miesięczny przychód salonu</Label>
                  <span className="font-bold text-sm">{monthlyRevenue.toLocaleString('pl-PL')} zł</span>
                </div>
                <Slider
                  value={[monthlyRevenue]}
                  onValueChange={([v]) => setMonthlyRevenue(v)}
                  min={3000} max={50000} step={500}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 000 zł</span>
                  <span>50 000 zł</span>
                </div>
              </div>

              {/* Pole 2 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>% klientek rezerwujących przez Booksy</Label>
                  <span className="font-bold text-sm">{booksyPercent}%</span>
                </div>
                <Slider
                  value={[booksyPercent]}
                  onValueChange={([v]) => setBooksyPercent(v)}
                  min={10} max={100} step={5}
                />
              </div>

              {/* Pole 3 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>No-showy tygodniowo (śr. wartość wizyty)</Label>
                  <span className="font-bold text-sm">{noShowCount} × {avgAppointmentValue} zł</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Liczba no-showów/tydzień</Label>
                    <Slider
                      value={[noShowCount]}
                      onValueChange={([v]) => setNoShowCount(v)}
                      min={0} max={20} step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Wartość wizyty (zł)</Label>
                    <Input
                      type="number"
                      value={avgAppointmentValue}
                      onChange={e => setAvgAppointmentValue(Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wyniki */}
            <div className="bg-background/50 dark:bg-black/20 rounded-xl p-5 space-y-3 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-sm">Prowizje Booksy rocznie:</span>
                <span className="font-bold text-destructive">-{booksyAnnualCost.toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Straty na no-showach rocznie:</span>
                <span className="font-bold text-destructive">-{noShowAnnualCost.toLocaleString('pl-PL')} zł</span>
              </div>
              <div className="border-t border-destructive/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">TRACISZ łącznie:</span>
                  <motion.span
                    key={totalAnnualLoss}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="font-black text-2xl text-destructive"
                  >
                    -{totalAnnualLoss.toLocaleString('pl-PL')} zł/rok
                  </motion.span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-green-500/10 rounded-lg p-2">
                <span className="text-sm text-green-600 font-medium">Z Beauty Calendar zaoszczędzisz:</span>
                <span className="font-bold text-green-600">+{totalAnnualLoss.toLocaleString('pl-PL')} zł/rok</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mb-4">
              *prowizja Booksy Boost: 40% netto od wartości rezerwacji
            </p>

            <Button className="w-full h-12 gap-2 text-base" onClick={onScrollToForm}>
              Zacznij oszczędzać za darmo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

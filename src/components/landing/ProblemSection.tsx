import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const painCards = [
  {
    icon: "\ud83d\udcf5",
    headline: "Telefon dzwoni podczas zabiegu",
    desc: "Przerywasz klientce. Gubisz skupienie. Inna klientka nie dodzwoni\u0142a si\u0119 i zapisa\u0142a gdzie\u015b indziej. To nie jest standard. To jest codzienno\u015b\u0107.",
  },
  {
    icon: "\ud83e\ude91",
    headline: "Pusty fotel. Znowu.",
    desc: "Klientka nie przysz\u0142a bez s\u0142owa. Termin przepad\u0142. 200\u2013400 z\u0142 wyparowa\u0142o. Przy 3\u20134 no-showach tygodniowo to nawet 60\u00a0000 z\u0142 straty rocznie.",
  },
  {
    icon: "\ud83d\udcca",
    headline: "Nie wiesz ile naprawd\u0119 zarabiasz",
    desc: "Masz przych\u00f3d \u2014 ale ile zostaje po kosztach materia\u0142\u00f3w, pracownik\u00f3w, produkt\u00f3w? Wi\u0119kszo\u015b\u0107 w\u0142a\u015bcicielek zgaduje. My to liczymy automatycznie.",
  },
  {
    icon: "\ud83d\udcbe",
    headline: "Twoje klientki nie s\u0105 Twoje",
    desc: "Korzystasz z platformy marketplace? Jej baza klientek nale\u017cy do platformy. Nie do Ciebie. Gdy odejdziesz \u2014 tracisz wszystko co budowa\u0142a\u015b latami.",
  },
  {
    icon: "\ud83d\udd04",
    headline: "Klientki przychodz\u0105 raz i znikaj\u0105",
    desc: "Pierwsza wizyta. \u015awietna. Potem cisza. \u017badna platforma nie pomaga Ci ich zatrzyma\u0107. Nie wysy\u0142a sekwencji. Nie buduje powracalno\u015bci. Ty musisz to robi\u0107 r\u0119cznie \u2014 albo nie robisz wcale.",
  },
];

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [noShows, setNoShows] = useState(4);
  const [avgVisit, setAvgVisit] = useState(200);

  const noShowLoss = Math.round(noShows * avgVisit * 52);
  const totalLoss = noShowLoss;

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-6">
            <p className="text-amber-500 font-bold text-sm tracking-wider uppercase">
              Uwaga: W\u0142a\u015bcicielki salon\u00f3w beauty w Polsce
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
            Czy pracujesz pe\u0142n\u0105 par\u0105...
            <br />
            <span className="text-muted-foreground font-normal text-2xl">
              i nadal nie wiesz ile naprawd\u0119 zarabiasz?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Wi\u0119kszo\u015b\u0107 w\u0142a\u015bcicielek salon\u00f3w traci od <strong>15\u00a0000</strong> do <strong>60\u00a0000 z\u0142 rocznie</strong> \u2014 nie dlatego \u017ce \u017ale pracuj\u0105. Tylko dlatego \u017ce nie maj\u0105 odpowiednich narz\u0119dzi.
          </p>
        </motion.div>

        {/* Pain cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mb-16">
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              className="p-5 rounded-xl bg-card border border-border/50 hover:border-destructive/20 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <h3 className="font-bold mb-1">{card.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Calculator */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-2 border-destructive/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6 text-destructive" />
              <div>
                <h3 className="font-bold text-lg">Kalkulator strat</h3>
                <p className="text-sm text-muted-foreground">Ile tracisz na no-showach?</p>
              </div>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Miesi\u0119czny przych\u00f3d salonu (z\u0142)</Label>
                  <span className="font-bold">{monthlyRevenue.toLocaleString("pl-PL")} z\u0142</span>
                </div>
                <Slider value={[monthlyRevenue]} min={2000} max={60000} step={500} onValueChange={([v]) => setMonthlyRevenue(v)} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>No-showy tygodniowo</Label>
                  <span className="font-bold">{noShows}</span>
                </div>
                <Slider value={[noShows]} min={0} max={15} step={1} onValueChange={([v]) => setNoShows(v)} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <Label>\u015arednia warto\u015b\u0107 wizyty (z\u0142)</Label>
                  <span className="font-bold">{avgVisit} z\u0142</span>
                </div>
                <Slider value={[avgVisit]} min={50} max={600} step={10} onValueChange={([v]) => setAvgVisit(v)} />
              </div>
            </div>

            <div className="bg-white/10 dark:bg-black/20 rounded-xl p-5 space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span>Straty na no-showach rocznie:</span>
                <span className="font-bold text-destructive">-{noShowLoss.toLocaleString("pl-PL")} z\u0142</span>
              </div>
              <div className="border-t border-destructive/20 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold">Tracisz \u0142\u0105cznie:</span>
                  <motion.span
                    key={totalLoss}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="font-black text-2xl text-destructive"
                  >
                    -{totalLoss.toLocaleString("pl-PL")} z\u0142/rok
                  </motion.span>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-green-600 text-sm font-medium">Z Beauty Calendar odzyskasz:</span>
                  <span className="font-bold text-green-600">+{totalLoss.toLocaleString("pl-PL")} z\u0142/rok</span>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 gap-2" onClick={onScrollToForm}>
              Zacznij odzyskiwa\u0107 te pieni\u0105dze \u2014 za darmo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

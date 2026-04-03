import { X } from "lucide-react";
import { motion } from "framer-motion";

const painBullets = [
  "\u201EDlaczego p\u0142ac\u0119 prowizj\u0119 od klientki, kt\u00F3r\u0105 sama pozyska\u0142am?\u201D",
  "\u201ENie wiem ile naprawd\u0119 zarabiam po odj\u0119ciu materia\u0142\u00F3w i czasu\u201D",
  "\u201EKlientka nie przysz\u0142a \u2014 straci\u0142am slot, pieni\u0105dze i nerwy\u201D",
  "\u201EBoj\u0119 si\u0119 odej\u015B\u0107 z Booksy, bo klientki mnie nie znajd\u0105\u201D",
  "\u201EProwadz\u0119 salon z notatnika i g\u0142owy \u2014 i codziennie co\u015B mi umyka\u201D",
];

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
            Pracujesz na swój salon 10 godzin dziennie.
            <br />
            <span className="text-destructive">A potem oddajesz do 45% zysku komuś, kto nie zrobił ani jednego zabiegu.</span>
          </h2>
        </motion.div>

        {/* Story text */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-4">
            <p>
              Znasz to uczucie? Wstajesz o 7:00. Ostatnia klientka wychodzi o 20:00. 
              Między nimi — telefony, potwierdzenia, przełożone wizyty, klientka 
              która nie przyszła, zamówienia produktów, grafik pracownic.
            </p>
            <p>
              A na koniec miesiąca logujesz się do Booksy i widzisz, że z Twojego 
              przychodu zniknęło kilka tysięcy złotych. Prowizja. Za klientki, 
              które i tak są Twoje. Za klientki, które przyszły z polecenia koleżanki. 
              Za klientki, które chodzą do Ciebie od lat.
            </p>
            <p className="font-semibold text-foreground">
              Oddajesz pieniądze za coś, co powinno być Twoje.
            </p>
          </div>
        </motion.div>

        {/* Pain bullets */}
        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          {painBullets.map((item, i) => (
            <motion.div
              key={i}
              className="flex gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="w-6 h-6 rounded-full bg-destructive/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <X className="w-3.5 h-3.5 text-destructive" />
              </div>
              <p className="text-sm font-medium">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
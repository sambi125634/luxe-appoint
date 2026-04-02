import { X } from "lucide-react";
import { motion } from "framer-motion";

const agitationPoints = [
  {
    label: "Nie możesz po prostu \"zignorować\" prowizji...",
    text: "Bo każdego miesiąca Booksy wyciąga z Twojej kieszeni tysiące złotych. Prowizje Boost sięgają 35-45% od każdej rezerwacji przez ich marketplace. To nie jest \"koszt prowadzenia biznesu\" — to kradzież w białych rękawiczkach.",
  },
  {
    label: "Nie możesz \"po prostu\" podbierać klientek z Booksy...",
    text: "Bo technicznie — te klientki NIE są Twoje. Należą do Booksy. Gdy odejdziesz z platformy, tracisz do nich dostęp. Przez lata budujesz ich bazę, nie swoją.",
  },
  {
    label: "Nie możesz \"po prostu\" zignorować no-showów...",
    text: "Jeden pusty fotel to 200-400 zł wyrzucone w błoto. Przy 3-4 no-showach tygodniowo to 60 000 zł rocznie. W gotówce. Którą mogłaś mieć.",
  },
];

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container relative z-10">
        {/* Attention header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-6">
            <p className="text-amber-500 font-bold text-sm tracking-wider uppercase">
              Uwaga: Właścicielki salonów beauty w Polsce
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
            Czy Twój salon pracuje pełną parą... a Ty i tak nie możesz odkładać pieniędzy?
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Jeśli korzystasz z Booksy, Treatwell lub Fresha — czytaj dalej. Bo zaraz pokażę Ci coś co może kompletnie zmienić Twój biznes.
          </p>
        </motion.div>

        {/* Agitation — eliminate alternatives */}
        <div className="max-w-2xl mx-auto space-y-6 mb-12">
          {agitationPoints.map((item, i) => (
            <motion.div
              key={i}
              className="flex gap-4 p-5 rounded-xl bg-destructive/5 border border-destructive/10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="w-6 h-6 rounded-full bg-destructive/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <X className="w-3.5 h-3.5 text-destructive" />
              </div>
              <div>
                <p className="font-bold mb-1">{item.label}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rhetorical question */}
        <motion.div
          className="text-center py-8 border-y border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl font-bold mb-2">Więc... co masz zrobić?</p>
          <p className="text-muted-foreground">
            Nie możesz ignorować prowizji. Nie możesz zabrać klientek. Nie możesz zatrzymać no-showów.
            <br />
            <span className="font-bold text-foreground">Chyba że masz Beauty Calendar.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

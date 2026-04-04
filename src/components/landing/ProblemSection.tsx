import { X } from "lucide-react";
import { motion } from "framer-motion";

const painBullets = [
  "„Płacę abonament, a do tego prowizję od klientek, które i tak są moje"",
  "„Moja baza klientek jest na cudzej platformie — nie mam do niej pełnego dostępu"",
  "„Klientka nie przyszła — straciłam slot, pieniądze i nerwy. Nikt mi w tym nie pomaga"",
  "„Na marketplace biję się ceną jak na targu — kto taniej, ten wygrywa"",
  "„Nikt nie pomaga mi zatrzymać klientek po pierwszej wizycie — a tam jest prawdziwy zysk"",
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
            Budujesz bazę klientek…
            <br />
            <span className="text-destructive">ale to nie jest Twoja baza.</span>
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
              Platformy marketplace działają jak Allegro dla beauty. Zrzeszają miliony 
              użytkowników, wyświetlają Twój salon obok konkurencji — i pobierają do 45% 
              prowizji od każdej nowej klientki pozyskanej przez ich system.
            </p>
            <p>
              Plan podstawowy? Kosztuje podobnie jak u nas. Ale prawdziwy koszt pojawia się, 
              kiedy chcesz pozyskać nowe klientki — wtedy oddajesz niemal połowę wartości 
              pierwszej wizyty. A potem? Zero pomocy w utrzymaniu tej klientki. 
              Zero narzędzi retencyjnych. Zero strategii powracalności.
            </p>
            <p className="font-semibold text-foreground">
              Płacisz za pozyskanie, ale nikt nie pomaga Ci zarabiać na powrotach. 
              A tam jest prawdziwy zysk.
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
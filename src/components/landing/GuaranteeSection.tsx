import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export const GuaranteeSection = () => {
  return (
    <section className="py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-2 border-green-500/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-2xl mb-2">Podwójna gwarancja zwrotu</h3>
              <p className="text-muted-foreground mb-6">
                Jesteśmy tak pewni Beauty Calendar że stoimy za tym dwoma gwarancjami.
              </p>
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      GWARANCJA 1
                    </span>
                    <span className="font-bold">30 dni — bez pytań</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jeśli z jakiegokolwiek powodu nie będziesz zadowolona w ciągu pierwszych 30 dni — zwracamy 100% opłaty. Zero pytań. Zero formalności. Jeden email wystarczy.
                  </p>
                </div>

                <div className="bg-card rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      GWARANCJA 2
                    </span>
                    <span className="font-bold">Oszczędź 5 000 zł lub wróć koszt</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jeśli w ciągu 90 dni korzystania z Beauty Calendar nie zaoszczędzisz minimum 5 000 zł (prowizje + no-showy) względem poprzedniego systemu — oddamy Ci 3 miesiące abonamentu. Pod warunkiem że uruchomisz Autopilot i skonfigurujesz widget rezerwacji.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

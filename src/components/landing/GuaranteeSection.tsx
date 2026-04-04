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
              <h3 className="font-bold text-2xl mb-2">Gwarancja zwrotu \u2014 30 dni, bez pyta\u0144</h3>
              <p className="text-muted-foreground mb-6">
                Jeste\u015Bmy pewni Beauty Calendar. Dlatego dajemy Ci pe\u0142ne 30 dni na przetestowanie.
              </p>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    GWARANCJA
                  </span>
                  <span className="font-bold">30 dni \u2014 bez pyta\u0144, bez formalno\u015Bci</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Je\u015Bli z jakiegokolwiek powodu nie b\u0119dziesz zadowolona w ci\u0105gu pierwszych 30 dni \u2014 
                  zwracamy 100% op\u0142aty. Jeden email wystarczy. \u017Badnych warunk\u00F3w, \u017Cadnych t\u0142umacze\u0144.
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                A je\u015Bli wybierzesz pakiet FREE \u2014 nie ryzykujesz absolutnie nic. Jest darmowy na zawsze.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
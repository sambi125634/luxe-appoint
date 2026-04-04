import { Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

export const GuaranteeSection = () => {
  return (
    <section className="py-16">
      <div className="container max-w-3xl mx-auto px-4 space-y-6">
        {/* Guarantee 1 */}
        <motion.div
          className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-2 border-green-500/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                GWARANCJA 1
              </span>
              <h3 className="font-bold text-xl mt-2 mb-2">30 dni bez pyta\u0144 \u2014 zwracamy 100%</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Je\u015bli z jakiegokolwiek powodu nie jeste\u015b zadowolona w pierwszych 30 dniach PRO/ELITE \u2014 jeden email wystarczy. Pe\u0142ny zwrot. Zero formalno\u015bci.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Guarantee 2 */}
        <motion.div
          className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
                GWARANCJA 2 \u2014 ELITE
              </span>
              <h3 className="font-bold text-xl mt-2 mb-2">Oszcz\u0119d\u017a 10\u00a0000 z\u0142 w 90 dni lub oddamy 3 miesi\u0105ce abonamentu</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Je\u015bli w ci\u0105gu 90 dni korzystania z ELITE nie odnotujesz oszcz\u0119dno\u015bci minimum 10\u00a0000 z\u0142 (no-showy + odzyskane klientki + czas), oddamy Ci 3 miesi\u0105ce abonamentu.
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Warunek: uruchomiony Autopilot + skonfigurowany Widget.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

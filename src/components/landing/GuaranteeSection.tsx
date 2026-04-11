import { useTranslation } from "react-i18next";
import { Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

export const GuaranteeSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-3xl mx-auto px-4 space-y-4 md:space-y-6">
        <motion.div
          className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-2 border-green-500/20 rounded-2xl p-5 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 md:w-7 md:h-7 text-green-500" />
            </div>
            <div>
              <span className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {t("landing.guarantee.g1badge")}
              </span>
              <h3 className="font-bold text-lg md:text-xl mt-2 mb-2">{t("landing.guarantee.g1title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("landing.guarantee.g1desc")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-5 md:p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 md:w-7 md:h-7 text-amber-500" />
            </div>
            <div>
              <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {t("landing.guarantee.g2badge")}
              </span>
              <h3 className="font-bold text-lg md:text-xl mt-2 mb-2">{t("landing.guarantee.g2title")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t("landing.guarantee.g2desc")}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{t("landing.guarantee.g2condition")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import nailsImg from "@/assets/audience/nails.jpg";
import hairImg from "@/assets/audience/hair.jpg";
import facialImg from "@/assets/audience/facial.jpg";
import lashesImg from "@/assets/audience/lashes.jpg";
import depilationImg from "@/assets/audience/depilation.jpg";
import aestheticsImg from "@/assets/audience/aesthetics.jpg";
import massageImg from "@/assets/audience/massage.jpg";
import spaImg from "@/assets/audience/spa.jpg";
import bodyImg from "@/assets/audience/body.jpg";
import specialistImg from "@/assets/audience/specialist.jpg";

const images = [nailsImg, hairImg, facialImg, lashesImg, depilationImg, aestheticsImg, massageImg, spaImg, bodyImg, specialistImg];

export const AudienceSection = () => {
  const { t } = useTranslation();

  const categories = Array.from({ length: 10 }, (_, i) => ({
    image: images[i],
    title: t(`landing.audience.cat${i + 1}`),
    items: t(`landing.audience.cat${i + 1}items`, { returnObjects: true }) as string[],
  }));

  return (
    <section className="py-16 md:py-20 lg:py-32">
      <div className="container">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
            {t("landing.audience.title1")}
            <br />
            <span className="text-gradient-luxury">{t("landing.audience.title2")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              className="rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <img src={cat.image} alt={cat.title} className="w-full h-24 md:h-32 object-cover" loading="lazy" width={640} height={512} />
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2">{cat.title}</h3>
                <ul className="space-y-1">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-xs text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-8 md:mt-10 p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-2xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="font-bold text-lg mb-2">{t("landing.audience.notListed")}</p>
          <p className="text-muted-foreground text-sm mb-4">{t("landing.audience.notListedDesc")}</p>
          <Button variant="outline" className="gap-2" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
            {t("landing.audience.checkPricing")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

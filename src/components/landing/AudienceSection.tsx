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

const categories = [
  {
    image: nailsImg,
    title: "Paznokcie i dłonie",
    items: ["Salon paznokci", "Manicure hybrydowy", "Przedłużanie paznokci", "Pedicure leczniczy", "Nail art studio"],
  },
  {
    image: hairImg,
    title: "Fryzjerstwo i włosy",
    items: ["Salon fryzjerski", "Barber shop", "Koloryzacja i balayage", "Przedłużanie włosów", "Studio stylizacji"],
  },
  {
    image: facialImg,
    title: "Kosmetyka i twarz",
    items: ["Gabinet kosmetyczny", "Peeling kawitacyjny", "Mikrodermabrazja", "Oczyszczanie wodorowe", "Lifting twarzy"],
  },
  {
    image: lashesImg,
    title: "Rzęsy i brwi",
    items: ["Stylizacja rzęs", "Lash lifting", "Laminacja brwi", "Microblading", "PMU i makijaż permanentny"],
  },
  {
    image: depilationImg,
    title: "Depilacja",
    items: ["Depilacja laserowa", "Depilacja IPL", "Woskowanie i sugaring", "Studio depilacji"],
  },
  {
    image: aestheticsImg,
    title: "Medycyna estetyczna",
    items: ["Gabinet medycyny estetycznej", "Klinika anti-aging", "Mezoterapia", "Botoks i wypełniacze", "Osocze bogatopłytkowe"],
  },
  {
    image: massageImg,
    title: "Masaż i wellness",
    items: ["Salon masażu", "Masaż tajski / leczniczy", "Refleksologia", "Studio wellness i relaksu"],
  },
  {
    image: spaImg,
    title: "SPA i kompleksy",
    items: ["Salon SPA", "Hotel SPA", "Centrum odnowy biologicznej", "Strefa relaksu"],
  },
  {
    image: bodyImg,
    title: "Sylwetka i ciało",
    items: ["Studio modelowania sylwetki", "Kriolipoliza", "Endermologia", "Drenaż limfatyczny"],
  },
  {
    image: specialistImg,
    title: "Specjalistyczne",
    items: ["Gabinet trychologiczny", "Studio bridal (makijaż ślubny)", "Gabinet podologiczny", "Studio opalania natryskowego", "Solarium"],
  },
];

export const AudienceSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Beauty Calendar jest dla Ciebie —
            <br />
            <span className="text-gradient-luxury">niezależnie od tego czym się zajmujesz</span>
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
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-32 object-cover"
                loading="lazy"
                width={640}
                height={512}
              />
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

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-10 p-6 bg-primary/5 border border-primary/10 rounded-2xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="font-bold text-lg mb-2">Prowadzisz salon którego tu nie ma?</p>
          <p className="text-muted-foreground text-sm mb-4">
            Jeśli masz klientów, terminy i usługi — Beauty Calendar jest dla Ciebie. Działa dla każdego salonu usługowego w Polsce.
          </p>
          <Button variant="outline" className="gap-2">
            Porozmawiajmy →
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

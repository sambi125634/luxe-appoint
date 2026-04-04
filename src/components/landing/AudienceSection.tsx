import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const categories = [
  {
    emoji: "\ud83d\udc85",
    title: "Paznokcie i d\u0142onie",
    items: ["Salon paznokci", "Manicure hybrydowy", "Przed\u0142u\u017canie paznokci", "Pedicure leczniczy", "Nail art studio"],
  },
  {
    emoji: "\u2702\ufe0f",
    title: "Fryzjerstwo i w\u0142osy",
    items: ["Salon fryzjerski", "Barber shop", "Koloryzacja i balayage", "Przed\u0142u\u017canie w\u0142os\u00f3w", "Studio stylizacji"],
  },
  {
    emoji: "\u2728",
    title: "Kosmetyka i twarz",
    items: ["Gabinet kosmetyczny", "Peeling kawitacyjny", "Mikrodermabrazja", "Oczyszczanie wodorowe", "Lifting twarzy"],
  },
  {
    emoji: "\ud83e\udee7",
    title: "Rz\u0119sy i brwi",
    items: ["Stylizacja rz\u0119s", "Lash lifting", "Laminacja brwi", "Microblading", "PMU i makija\u017c permanentny"],
  },
  {
    emoji: "\u26a1",
    title: "Depilacja",
    items: ["Depilacja laserowa", "Depilacja IPL", "Woskowanie i sugaring", "Studio depilacji"],
  },
  {
    emoji: "\ud83e\ude7a",
    title: "Medycyna estetyczna",
    items: ["Gabinet medycyny estetycznej", "Klinika anti-aging", "Mezoterapia", "Botoks i wype\u0142niacze", "Osocze bogatop\u0142ytkowe"],
  },
  {
    emoji: "\ud83d\udc86",
    title: "Masa\u017c i wellness",
    items: ["Salon masa\u017cu", "Masa\u017c tajski / leczniczy", "Refleksologia", "Studio wellness i relaksu"],
  },
  {
    emoji: "\ud83c\udf3f",
    title: "SPA i kompleksy",
    items: ["Salon SPA", "Hotel SPA", "Centrum odnowy biologicznej", "Strefa relaksu"],
  },
  {
    emoji: "\ud83d\udcaa",
    title: "Sylwetka i cia\u0142o",
    items: ["Studio modelowania sylwetki", "Kriolipoliza", "Endermologia", "Drena\u017c limfatyczny"],
  },
  {
    emoji: "\ud83d\udd2c",
    title: "Specjalistyczne",
    items: ["Gabinet trychologiczny", "Studio bridal (makija\u017c \u015blubny)", "Gabinet podologiczny", "Studio opalania natryskowego", "Solarium"],
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
            Beauty Calendar jest dla Ciebie \u2014
            <br />
            <span className="text-gradient-luxury">niezale\u017cnie od tego czym si\u0119 zajmujesz</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <h3 className="font-bold text-sm mb-2">{cat.title}</h3>
              <ul className="space-y-1">
                {cat.items.map((item, j) => (
                  <li key={j} className="text-xs text-muted-foreground">{item}</li>
                ))}
              </ul>
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
          <p className="font-bold text-lg mb-2">Prowadzisz salon kt\u00f3rego tu nie ma?</p>
          <p className="text-muted-foreground text-sm mb-4">
            Je\u015bli masz klient\u00f3w, terminy i us\u0142ugi \u2014 Beauty Calendar jest dla Ciebie. Dzia\u0142a dla ka\u017cdego salonu us\u0142ugowego w Polsce.
          </p>
          <Button variant="outline" className="gap-2">
            Porozmawiajmy \u2192
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

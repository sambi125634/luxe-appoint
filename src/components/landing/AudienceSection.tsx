import { motion } from "framer-motion";
import { AnimatedHeadline, containerVariants, cardVariants } from "@/components/ui/AnimatedSection";

const categories = [
  { emoji: "💅", title: "Paznokcie i dłonie", items: ["Salon paznokci", "Manicure hybrydowy", "Przedłużanie paznokci", "Pedicure leczniczy", "Nail art studio"] },
  { emoji: "✂️", title: "Fryzjerstwo i włosy", items: ["Salon fryzjerski", "Barber shop", "Koloryzacja i balayage", "Przedłużanie włosów", "Studio stylizacji"] },
  { emoji: "✨", title: "Kosmetyka i twarz", items: ["Gabinet kosmetyczny", "Peeling kawitacyjny", "Mikrodermabrazja", "Oczyszczanie wodorowe", "Lifting twarzy"] },
  { emoji: "🫧", title: "Rzęsy i brwi", items: ["Stylizacja rzęs", "Lash lifting", "Laminacja brwi", "Microblading", "PMU i makijaż permanentny"] },
  { emoji: "⚡", title: "Depilacja", items: ["Depilacja laserowa", "Depilacja IPL", "Woskowanie i sugaring", "Studio depilacji"] },
  { emoji: "🩺", title: "Medycyna estetyczna", items: ["Gabinet medycyny estetycznej", "Klinika anti-aging", "Mezoterapia", "Botoks i wypełniacze", "Osocze bogatopłytkowe"] },
  { emoji: "💆", title: "Masaż i wellness", items: ["Salon masażu", "Masaż tajski / leczniczy", "Refleksologia", "Studio wellness i relaksu"] },
  { emoji: "🌿", title: "SPA i kompleksy", items: ["Salon SPA", "Hotel SPA", "Centrum odnowy biologicznej", "Strefa relaksu"] },
  { emoji: "💪", title: "Sylwetka i ciało", items: ["Studio modelowania sylwetki", "Kriolipoliza", "Endermologia", "Drenaż limfatyczny"] },
  { emoji: "🔬", title: "Specjalistyczne", items: ["Gabinet trychologiczny", "Studio bridal (makijaż ślubny)", "Gabinet podologiczny", "Studio opalania natryskowego", "Solarium"] },
];

export const AudienceSection = () => {
  return (
    <section className="landing-section-light landing-section-spacing">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-16">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Beauty Calendar jest dla Ciebie —
            <br />
            <span className="apple-accent-gradient">niezależnie od tego czym się zajmujesz</span>
          </h2>
        </AnimatedHeadline>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
              className="landing-card-light p-5 transition-all duration-300 will-change-transform"
            >
              <div className="text-2xl mb-3">{cat.emoji}</div>
              <h3 className="font-bold text-sm mb-2" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{cat.title}</h3>
              <ul className="space-y-1">
                {cat.items.map((item, j) => (
                  <li key={j} className="text-xs landing-text-muted-light">{item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12 p-8 rounded-3xl max-w-2xl mx-auto"
          style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="font-bold text-lg mb-2" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>Prowadzisz salon którego tu nie ma?</p>
          <p className="text-sm mb-4 landing-text-muted-light">
            Jeśli masz klientów, terminy i usługi — Beauty Calendar jest dla Ciebie. Działa dla każdego salonu usługowego w Polsce.
          </p>
          <button className="apple-btn-secondary-light text-sm">
            Porozmawiajmy →
          </button>
        </motion.div>
      </div>

      <div className="h-32 section-fade-to-dark mt-16" />
    </section>
  );
};
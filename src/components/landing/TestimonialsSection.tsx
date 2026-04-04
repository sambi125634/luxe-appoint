import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray, containerVariants, cardVariants } from "@/components/ui/AnimatedSection";

const testimonials = [
  { id: 1, content: "Przeszłam z marketplace 3 miesiące temu. Bałam się, że stracę klientki. Nie straciłam ani jednej. Wysłałam im nowy link do rezerwacji — 90% przeszło w ciągu tygodnia. Teraz mam pełną kontrolę nad swoją bazą.", author: "Karolina W.", role: "Salon kosmetyczny", location: "Kraków", avatar: "KW", rating: 5, result: "Pełna kontrola nad bazą klientek" },
  { id: 2, content: "Skaner magazynowy przez telefon — to jest game changer. Skanuję produkt po zabiegu, system odejmuje ze stanu, a kiedy się kończy — sam przypomina żeby zamówić. Koniec z niespodziankami w środku koloryzacji.", author: "Magda K.", role: "Salon fryzjerski", location: "Wrocław", avatar: "MK", rating: 5, result: "Inwentaryzacja 9x szybsza" },
  { id: 3, content: "True Profit Dashboard otworzył mi oczy. Myślałam że botox to moja najlepsza usługa. Po odjęciu materiałów — peelingi chemiczne są 3x bardziej rentowne. Bez tego raportu nigdy bym się nie dowiedziała.", author: "Anna S.", role: "Klinika medycyny estetycznej", location: "Warszawa", avatar: "AS", rating: 5, result: "Odkryła 3x rentowniejsze usługi" },
  { id: 4, content: "Ścieżka Klientki to coś, czego nie daje żadna inna platforma. Widzę dokładnie, która klientka jest po 1. wizycie, a która po 4. System sam wysyła sekwencje między wizytami. Moje klientki wracają — bo system o to dba.", author: "Izabela M.", role: "SPA & Wellness", location: "Gdańsk", avatar: "IM", rating: 5, result: "Retencja klientek wzrosła o 40%" },
  { id: 5, content: "Nie jestem techniczna — kompletnie. Bałam się, że nie dam rady. Konfiguracja zajęła mi 15 minut. PIĘTNAŚCIE. Teraz nie wyobrażam sobie pracy bez tego systemu. A to, że klientki widzą w aplikacji tylko mój salon? Bezcenne.", author: "Justyna P.", role: "Studio paznokci", location: "Poznań", avatar: "JP", rating: 5, result: "Konfiguracja w 15 minut" },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="landing-card-dark p-6 lg:p-8 h-full flex flex-col">
    <Quote className="w-8 h-8 mb-4 shrink-0" style={{ color: "rgba(139,92,246,0.2)" }} />
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
    <blockquote className="text-base lg:text-lg leading-relaxed mb-4 flex-grow italic" style={{ color: "#1d1d1f", fontFamily: "'Playfair Display', serif" }}>
      &ldquo;{testimonial.content}&rdquo;
    </blockquote>
    {testimonial.result && (
      <div className="mb-4 px-3 py-1.5 rounded-lg inline-block" style={{ background: "rgba(34,197,94,0.06)" }}>
        <span className="text-sm font-bold text-emerald-600">📊 {testimonial.result}</span>
      </div>
    )}
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{testimonial.author}</div>
        <div className="text-sm" style={{ color: "#86868b" }}>{testimonial.role}, {testimonial.location}</div>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveIndex((prev) => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="landing-section-light landing-section-spacing">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-16">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Właścicielki, które{" "}
            <span className="apple-accent-gradient">odzyskały kontrolę nad swoim biznesem</span>
          </h2>
        </AnimatedHeadline>

        <motion.div
          className="hidden lg:grid lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.slice(0, 3).map((t) => (
            <motion.div key={t.id} variants={cardVariants}><TestimonialCard testimonial={t} /></motion.div>
          ))}
        </motion.div>
        <motion.div
          className="hidden lg:grid lg:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.slice(3, 5).map((t) => (
            <motion.div key={t.id} variants={cardVariants}><TestimonialCard testimonial={t} /></motion.div>
          ))}
        </motion.div>

        <div className="lg:hidden max-w-xl mx-auto">
          <TestimonialCard testimonial={testimonials[activeIndex]} />
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  activeIndex === index ? "w-8 bg-[#8b5cf6]" : "w-2 bg-black/10 hover:bg-black/20"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

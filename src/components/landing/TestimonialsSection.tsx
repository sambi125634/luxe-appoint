import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/* [PLACEHOLDER] — Wszystkie testimoniale są fikcyjne i służą jako placeholdery.
   Przed publikacją zastąp je prawdziwymi opiniami klientek. */

const testimonials = [
  {
    id: 1,
    content: "Przeszłam z Booksy po 3 latach. W pierwszym miesiącu no-showy spadły o 70%. AI naprawdę działa — sugeruje terminy które wypełniają luki i klientki je wybierają!",
    author: "Marta K.",
    role: "Klinika Estetyczna Bella",
    location: "Warszawa",
    avatar: "MK",
    rating: 5,
    result: "Zaoszczędziła 4 200 zł/mies na prowizjach", /* [PLACEHOLDER] */
  },
  {
    id: 2,
    content: "Nareszcie wiem ile zarabiam bez przekopywania się przez 10 raportów. Prognoza przychodów to game changer — planuję zakupy produktów z miesięcznym wyprzedzeniem.",
    author: "Karolina W.",
    role: "Studio Urody Glow",
    location: "Kraków",
    avatar: "KW",
    rating: 5,
    result: "Przychód wzrósł o 18% w 3 miesiące", /* [PLACEHOLDER] */
  },
  {
    id: 3,
    content: "Mój zespół 4 osób opanował system w jeden dzień. Z Versum szkolenie trwało tydzień. A prowizji zero — oszczędzam 2 400 zł miesięcznie.",
    author: "Agnieszka M.",
    role: "Salon Fryzjerski Cięcie",
    location: "Poznań",
    avatar: "AM",
    rating: 5,
    result: "Oszczędza 2 400 zł/mies", /* [PLACEHOLDER] */
  },
  {
    id: 4,
    content: "Widget na Instagramie to strzał w dziesiątkę. Widzę dokładnie które Stories przynoszą rezerwacje. Mój ROI z social media wzrósł 3x w dwa miesiące.",
    author: "Patrycja L.",
    role: "Brow Bar Perfect",
    location: "Gdańsk",
    avatar: "PL",
    rating: 5,
    result: "3x wzrost ROI z Instagrama", /* [PLACEHOLDER] */
  },
  {
    id: 5,
    content: "Skaner kodów kreskowych w telefonie — to coś czego szukałam latami! Inwentaryzacja która trwała 3 godziny teraz zajmuje 20 minut. A receptury automatycznie odliczają produkty po zabiegu.",
    author: "Dominika S.",
    role: "SPA & Wellness Harmony",
    location: "Wrocław",
    avatar: "DS",
    rating: 5,
    result: "Inwentaryzacja 9x szybsza", /* [PLACEHOLDER] */
  },
  {
    id: 6,
    content: "Bałam się odejść z Booksy — myślałam że klientki mnie nie znajdą. Ale z Beauty Calendar mam WŁASNĄ bazę i link do rezerwacji który wysyłam przez WhatsApp. Ani jedna klientka nie odeszła.",
    author: "Natalia R.",
    role: "Salon Kosmetyczny Luxe",
    location: "Łódź",
    avatar: "NR",
    rating: 5,
    result: "0 utraconych klientek po migracji", /* [PLACEHOLDER] */
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="glass-card-elevated p-6 lg:p-8 h-full flex flex-col">
    <Quote className="w-8 h-8 text-primary/20 mb-4 shrink-0" />
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
      ))}
    </div>
    <blockquote className="text-base lg:text-lg leading-relaxed mb-4 flex-grow font-serif italic">
      &ldquo;{testimonial.content}&rdquo;
    </blockquote>
    {testimonial.result && (
      <div className="mb-4 px-3 py-1.5 bg-emerald-500/10 rounded-lg inline-block">
        <span className="text-sm font-bold text-emerald-600">📊 {testimonial.result}</span>
      </div>
    )}
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold">{testimonial.author}</div>
        <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.location}</div>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="container">
        {/* Rating header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-2">
            Co mówią właścicielki które przestały płacić prowizje:
          </p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 font-bold">4.9/5</span>
            <span className="text-muted-foreground ml-1 text-sm">(127 opinii) [PLACEHOLDER]</span>
          </div>
        </motion.div>

        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Co mówią{" "}
            <span className="text-gradient-luxury">właścicielki salonów</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dołącz do setek zadowolonych właścicielek salonów w całej Polsce
          </p>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mt-6">
          {testimonials.slice(3, 6).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile: Single card carousel */}
        <div className="lg:hidden max-w-xl mx-auto">
          <TestimonialCard testimonial={testimonials[activeIndex]} />
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeIndex === index
                    ? "w-8 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

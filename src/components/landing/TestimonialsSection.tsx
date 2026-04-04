import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

{/* [PLACEHOLDER \u2014 do zamiany na prawdziwe] */}

const testimonials = [
  {
    id: 1,
    content: "Przesz\u0142am z marketplace 3 miesi\u0105ce temu. Ba\u0142am si\u0119, \u017Ce strac\u0119 klientki. Nie straci\u0142am ani jednej. Wys\u0142a\u0142am im nowy link do rezerwacji \u2014 90% przesz\u0142o w ci\u0105gu tygodnia. Teraz mam pe\u0142n\u0105 kontrol\u0119 nad swoj\u0105 baz\u0105.",
    author: "Karolina W.",
    role: "Salon kosmetyczny",
    location: "Krak\u00F3w",
    avatar: "KW",
    rating: 5,
    result: "Pe\u0142na kontrola nad baz\u0105 klientek",
  },
  {
    id: 2,
    content: "Skaner magazynowy przez telefon \u2014 to jest game changer. Skanuj\u0119 produkt po zabiegu, system odejmuje ze stanu, a kiedy si\u0119 ko\u0144czy \u2014 sam przypomina \u017Ceby zam\u00F3wi\u0107. Koniec z niespodziankami w \u015Brodku koloryzacji.",
    author: "Magda K.",
    role: "Salon fryzjerski",
    location: "Wroc\u0142aw",
    avatar: "MK",
    rating: 5,
    result: "Inwentaryzacja 9x szybsza",
  },
  {
    id: 3,
    content: "True Profit Dashboard otworzy\u0142 mi oczy. My\u015Bla\u0142am \u017Ce botox to moja najlepsza us\u0142uga. Po odj\u0119ciu materia\u0142\u00F3w \u2014 peelingi chemiczne s\u0105 3x bardziej rentowne. Bez tego raportu nigdy bym si\u0119 nie dowiedzia\u0142a.",
    author: "Anna S.",
    role: "Klinika medycyny estetycznej",
    location: "Warszawa",
    avatar: "AS",
    rating: 5,
    result: "Odkry\u0142a 3x rentowniejsze us\u0142ugi",
  },
  {
    id: 4,
    content: "\u015Acie\u017Cka Klientki to co\u015B, czego nie daje \u017Cadna inna platforma. Widz\u0119 dok\u0142adnie, kt\u00F3ra klientka jest po 1. wizycie, a kt\u00F3ra po 4. System sam wysy\u0142a sekwencje mi\u0119dzy wizytami. Moje klientki wracaj\u0105 \u2014 bo system o to dba.",
    author: "Izabela M.",
    role: "SPA & Wellness",
    location: "Gda\u0144sk",
    avatar: "IM",
    rating: 5,
    result: "Retencja klientek wzros\u0142a o 40%",
  },
  {
    id: 5,
    content: "Nie jestem techniczna \u2014 kompletnie. Ba\u0142am si\u0119, \u017Ce nie dam rady. Konfiguracja zaj\u0119\u0142a mi 15 minut. PI\u0118TNA\u015ACIE. Teraz nie wyobra\u017Cam sobie pracy bez tego systemu. A to, \u017Ce klientki widz\u0105 w aplikacji tylko m\u00F3j salon? Bezcenne.",
    author: "Justyna P.",
    role: "Studio paznokci",
    location: "Pozna\u0144",
    avatar: "JP",
    rating: 5,
    result: "Konfiguracja w 15 minut",
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
        <span className="text-sm font-bold text-emerald-600">{"\uD83D\uDCCA"} {testimonial.result}</span>
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
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            W\u0142a\u015Bcicielki, kt\u00F3re{" "}
            <span className="text-gradient-luxury">odzyska\u0142y kontrol\u0119 nad swoim biznesem</span>
          </h2>
        </div>

        {/* Desktop: grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
          {testimonials.slice(3, 5).map((testimonial) => (
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
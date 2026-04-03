import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

{/* [PLACEHOLDER — do zamiany na prawdziwe] */}

const testimonials = [
  {
    id: 1,
    content: "Przeszłam z Booksy 3 miesiące temu. Bałam się, że stracę klientki. Nie straciłam ani jednej. Za to oszczędzam 2 400 zł miesięcznie na prowizjach. Żałuję tylko, że nie zrobiłam tego rok wcześniej.",
    author: "Karolina W.",
    role: "Salon kosmetyczny",
    location: "Kraków",
    avatar: "KW",
    rating: 5,
    result: "Oszczędza 2 400 zł/mies na prowizjach",
  },
  {
    id: 2,
    content: "Skaner magazynowy przez telefon — to jest game changer. Skanuję produkt po zabiegu, system odejmuje ze stanu, a kiedy się kończy — sam przypomina żeby zamówić. Koniec z niespodziankami w środku koloryzacji.",
    author: "Magda K.",
    role: "Salon fryzjerski",
    location: "Wrocław",
    avatar: "MK",
    rating: 5,
    result: "Inwentaryzacja 9x szybsza",
  },
  {
    id: 3,
    content: "True Profit Dashboard otworzył mi oczy. Myślałam że botox to moja najlepsza usługa. Po odjęciu materiałów — peelingi chemiczne są 3x bardziej rentowne. Bez tego raportu nigdy bym się nie dowiedziała.",
    author: "Anna S.",
    role: "Klinika medycyny estetycznej",
    location: "Warszawa",
    avatar: "AS",
    rating: 5,
    result: "Odkryła 3x rentowniejsze usługi",
  },
  {
    id: 4,
    content: "Moje 3 pracowniczki mają osobne kalendarze, klientki rezerwują same nawet o 23:00, a ja w końcu mam weekendy wolne. 149 zł miesięcznie? To najlepsza inwestycja jaką kiedykolwiek zrobiłam w mój biznes.",
    author: "Izabela M.",
    role: "SPA & Wellness",
    location: "Gdańsk",
    avatar: "IM",
    rating: 5,
    result: "Weekendy wolne, klientki rezerwują same",
  },
  {
    id: 5,
    content: "Nie jestem techniczna — kompletnie. Bałam się, że nie dam rady. Konfiguracja zajęła mi 15 minut. PIĘTNAŚCIE. Teraz nie wyobrażam sobie pracy bez tego systemu.",
    author: "Justyna P.",
    role: "Studio paznokci",
    location: "Poznań",
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
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Właścicielki salonów, które{" "}
            <span className="text-gradient-luxury">przestały oddawać swoje pieniądze</span>
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

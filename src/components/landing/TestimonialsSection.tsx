import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    content: "Przeszłam z Booksy po 3 latach. W pierwszym miesiącu no-showy spadły o 70%. AI naprawdę działa — sugeruje terminy które wypełniają luki i klientki je wybierają!",
    author: "Marta K.",
    role: "Klinika Estetyczna Bella",
    location: "Warszawa",
    avatar: "MK",
    rating: 5,
  },
  {
    id: 2,
    content: "Nareszcie wiem ile zarabiam bez przekopywania się przez 10 raportów. Prognoza przychodów to game changer — planuję zakupy produktów z miesięcznym wyprzedzeniem.",
    author: "Karolina W.",
    role: "Studio Urody Glow",
    location: "Kraków",
    avatar: "KW",
    rating: 5,
  },
  {
    id: 3,
    content: "Mój zespół 4 osób opanował system w jeden dzień. Z Versum szkolenie trwało tydzień. A prowizji zero — oszczędzam 400 zł miesięcznie.",
    author: "Agnieszka M.",
    role: "Salon Fryzjerski Cięcie",
    location: "Poznań",
    avatar: "AM",
    rating: 5,
  },
  {
    id: 4,
    content: "Widget na Instagramie to strzał w dziesiątkę. Widzę dokładnie które Stories przynoszą rezerwacje. Mój ROI z social media wzrósł 3x w dwa miesiące.",
    author: "Patrycja L.",
    role: "Brow Bar Perfect",
    location: "Gdańsk",
    avatar: "PL",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="glass-card-elevated p-6 lg:p-8 h-full flex flex-col">
    <Quote className="w-8 h-8 text-primary/20 mb-4 shrink-0" />
    
    {/* Stars */}
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
      ))}
    </div>

    {/* Content */}
    <blockquote className="text-base lg:text-lg leading-relaxed mb-6 flex-grow font-serif italic">
      "{testimonial.content}"
    </blockquote>

    {/* Author */}
    <div className="flex items-center gap-3 mt-auto">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold">{testimonial.author}</div>
        <div className="text-sm text-muted-foreground">
          {testimonial.role}, {testimonial.location}
        </div>
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
            Co mówią{" "}
            <span className="text-gradient-luxury">właściciele salonów</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dołącz do setek zadowolonych właścicieli salonów w całej Polsce
          </p>
        </div>

        {/* Desktop: 3-column grid (show first 3) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile: Single card carousel */}
        <div className="lg:hidden max-w-xl mx-auto">
          <TestimonialCard testimonial={testimonials[activeIndex]} />
          
          {/* Dots */}
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

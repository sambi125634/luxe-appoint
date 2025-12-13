import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const timer = setInterval(goToNext, 6000);
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

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Quote icon */}
            <Quote className="absolute -top-6 -left-6 w-16 h-16 text-primary/10" />
            
            {/* Main testimonial */}
            <div className="glass-card-elevated p-8 lg:p-12">
              <div className={cn(
                "transition-all duration-500",
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}>
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-xl lg:text-2xl leading-relaxed mb-8 font-serif italic">
                  "{testimonials[activeIndex].content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                    {testimonials[activeIndex].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {testimonials[activeIndex].author}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonials[activeIndex].role}, {testimonials[activeIndex].location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrev}
                className="rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true);
                      setActiveIndex(index);
                      setTimeout(() => setIsAnimating(false), 500);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      activeIndex === index
                        ? "w-8 bg-primary"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

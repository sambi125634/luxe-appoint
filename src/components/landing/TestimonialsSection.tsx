import { useState } from "react";
import { Star, Play, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Placeholder — zamień na prawdziwy URL po wgraniu wideo
const VIDEO_URL: string | null = null;

const VIDEO_TESTIMONIAL = {
  author: "Monika R.",
  role: "Salon kosmetyczny",
  location: "Warszawa",
  rating: 5,
};

const writtenTestimonials = [
  {
    id: 1,
    content:
      "Przeszłam z marketplace 3 miesiące temu. Bałam się, że stracę klientki. Nie straciłam ani jednej. Wysłałam im nowy link do rezerwacji — 90% przeszło w ciągu tygodnia.",
    author: "Karolina W.",
    role: "Salon kosmetyczny",
    location: "Kraków",
    avatar: "KW",
    rating: 5,
    result: "Pełna kontrola nad bazą klientek",
  },
  {
    id: 2,
    content:
      "True Profit Dashboard otworzył mi oczy. Myślałam że botox to moja najlepsza usługa. Po odjęciu materiałów — peelingi chemiczne są 3x bardziej rentowne.",
    author: "Anna S.",
    role: "Klinika medycyny estetycznej",
    location: "Warszawa",
    avatar: "AS",
    rating: 5,
    result: "Odkryła 3x rentowniejsze usługi",
  },
];

const WrittenCard = ({
  testimonial,
}: {
  testimonial: (typeof writtenTestimonials)[0];
}) => (
  <div className="glass-card-elevated p-6 h-full flex flex-col rounded-2xl">
    <Quote className="w-6 h-6 text-primary/20 mb-3 shrink-0" />
    <div className="flex gap-0.5 mb-3">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
      ))}
    </div>
    <blockquote className="text-sm leading-relaxed mb-4 flex-grow font-serif italic text-muted-foreground">
      &ldquo;{testimonial.content}&rdquo;
    </blockquote>
    {testimonial.result && (
      <div className="mb-3 px-2.5 py-1 bg-emerald-500/10 rounded-lg inline-block">
        <span className="text-xs font-bold text-emerald-600">
          📊 {testimonial.result}
        </span>
      </div>
    )}
    <div className="flex items-center gap-2.5 mt-auto">
      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold text-sm">{testimonial.author}</div>
        <div className="text-xs text-muted-foreground">
          {testimonial.role}, {testimonial.location}
        </div>
      </div>
    </div>
  </div>
);

const PhoneMockup = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="relative w-[260px] lg:w-[280px] rounded-[40px] border-[6px] border-foreground/10 bg-black shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />

        {/* Screen content — 9:16 aspect */}
        <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
          {VIDEO_URL && !playing ? (
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted/60 to-muted z-10"
              aria-label="Odtwórz recenzję wideo"
            >
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <Play className="w-7 h-7 text-primary-foreground ml-1" />
              </div>
            </button>
          ) : VIDEO_URL && playing ? (
            <video
              src={VIDEO_URL}
              autoPlay
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            /* Placeholder when no video yet */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-muted/40 to-muted gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-7 h-7 text-primary ml-1" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Recenzja wideo wkrótce
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Author info below phone */}
      <div className="mt-5 text-center">
        <div className="flex gap-0.5 justify-center mb-1.5">
          {[...Array(VIDEO_TESTIMONIAL.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <div className="font-semibold text-base">{VIDEO_TESTIMONIAL.author}</div>
        <div className="text-sm text-muted-foreground">
          {VIDEO_TESTIMONIAL.role}, {VIDEO_TESTIMONIAL.location}
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  const [mobileIndex, setMobileIndex] = useState(0);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Właścicielki, które{" "}
            <span className="text-gradient-luxury">
              odzyskały kontrolę nad swoim biznesem
            </span>
          </h2>
        </motion.div>

        {/* Desktop: 3-column layout */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Left written testimonial */}
          <motion.div
            className="opacity-90"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 0.9, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <WrittenCard testimonial={writtenTestimonials[0]} />
          </motion.div>

          {/* Center video mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <PhoneMockup />
          </motion.div>

          {/* Right written testimonial */}
          <motion.div
            className="opacity-90"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 0.9, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <WrittenCard testimonial={writtenTestimonials[1]} />
          </motion.div>
        </div>

        {/* Mobile: video on top + carousel below */}
        <div className="lg:hidden space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <PhoneMockup />
          </motion.div>

          <div className="max-w-md mx-auto">
            <WrittenCard testimonial={writtenTestimonials[mobileIndex]} />
            <div className="flex justify-center gap-2 mt-5">
              {writtenTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setMobileIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    mobileIndex === index
                      ? "w-8 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

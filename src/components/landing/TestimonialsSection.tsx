import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Play, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const VIDEO_URL: string | null = "/testimonials/testimonial-1.mp4";
const VIDEO_POSTER: string = "/testimonials/testimonial-1-poster.jpg";

const WrittenCard = ({
  testimonial,
}: {
  testimonial: { content: string; author: string; role: string; location: string; avatar: string; rating: number; result: string };
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
        <span className="text-xs font-bold text-emerald-600">📊 {testimonial.result}</span>
      </div>
    )}
    <div className="flex items-center gap-2.5 mt-auto">
      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
        {testimonial.avatar}
      </div>
      <div>
        <div className="font-semibold text-sm">{testimonial.author}</div>
        <div className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.location}</div>
      </div>
    </div>
  </div>
);

export const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [mobileIndex, setMobileIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const writtenTestimonials = [
    {
      content: t("landing.testimonials.t1content"),
      author: t("landing.testimonials.t1author"),
      role: t("landing.testimonials.t1role"),
      location: t("landing.testimonials.t1location"),
      avatar: "KW",
      rating: 5,
      result: t("landing.testimonials.t1result"),
    },
    {
      content: t("landing.testimonials.t2content"),
      author: t("landing.testimonials.t2author"),
      role: t("landing.testimonials.t2role"),
      location: t("landing.testimonials.t2location"),
      avatar: "AS",
      rating: 5,
      result: t("landing.testimonials.t2result"),
    },
  ];

  const PhoneMockup = () => (
    <div className="flex flex-col items-center">
      <div className="relative w-[260px] lg:w-[280px] rounded-[40px] border-[6px] border-foreground/10 bg-black shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />
        <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
          {VIDEO_URL && !playing ? (
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted/60 to-muted z-10"
              aria-label={t("landing.testimonials.playLabel")}
            >
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <Play className="w-7 h-7 text-primary-foreground ml-1" />
              </div>
            </button>
          ) : VIDEO_URL && playing ? (
            <video
              src={VIDEO_URL}
              poster={VIDEO_POSTER}
              autoPlay
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : VIDEO_URL ? (
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 z-10 group"
              aria-label={t("landing.testimonials.playLabel")}
            >
              <img
                src={VIDEO_POSTER}
                alt={t("landing.testimonials.videoAuthor")}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 group-hover:from-black/20 group-hover:to-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-primary ml-1 fill-primary" />
                </div>
              </div>
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-muted/40 to-muted gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Play className="w-7 h-7 text-primary ml-1" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{t("landing.testimonials.videoSoon")}</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 text-center">
        <div className="flex gap-0.5 justify-center mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>
        <div className="font-semibold text-base">{t("landing.testimonials.videoAuthor")}</div>
        <div className="text-sm text-muted-foreground">{t("landing.testimonials.videoRole")}, {t("landing.testimonials.videoLocation")}</div>
      </div>
    </div>
  );

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="container max-w-6xl">
        <motion.div
          className="text-center mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("landing.testimonials.title1")}{" "}
            <span className="text-gradient-luxury">{t("landing.testimonials.title2")}</span>
          </h2>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          <motion.div className="opacity-90" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 0.9, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            <WrittenCard testimonial={writtenTestimonials[0]} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.15 }}>
            <PhoneMockup />
          </motion.div>
          <motion.div className="opacity-90" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 0.9, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.3 }}>
            <WrittenCard testimonial={writtenTestimonials[1]} />
          </motion.div>
        </div>

        <div className="lg:hidden space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex justify-center">
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
                    mobileIndex === index ? "w-8 bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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

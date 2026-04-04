import { useState } from "react";
import { Smartphone, Check, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AnimatedHeadline, containerVariants, cardVariants, appleEaseArray } from "@/components/ui/AnimatedSection";

const ownerFeatures = [
  "Zarządzaj kalendarzem jednym palcem",
  "Powiadomienia o nowych rezerwacjach",
  "Dashboard z wynikami w czasie real",
  "Szybkie blokowanie terminów",
  "Chat z klientkami",
  "Stany magazynowe i alerty braków",
];

const clientFeatures = [
  "Rezerwuj wizytę w 30 sekund",
  "Widzi TYLKO Twój salon — nie marketplace z konkurencją",
  "Przypomnienia przed wizytą",
  "Wirtualna karta lojalnościowa",
  "Oceniaj i polecaj salon znajomym",
  "Płatności BLIK jednym kliknięciem",
];

export const MobileAppSection = () => {
  const [waitlistEmail, setWaitlistEmail] = useState("");

  const handleWaitlist = () => {
    if (!waitlistEmail || !waitlistEmail.includes("@")) {
      toast.error("Podaj poprawny adres email");
      return;
    }
    toast.success("Dziękujemy! Powiadomimy Cię o premierze 🎉");
    setWaitlistEmail("");
  };

  return (
    <section className="landing-section-dark landing-section-spacing relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)] relative z-10">
        <AnimatedHeadline className="text-center mb-16">
          <p className="eyebrow tracking-widest mb-4 flex items-center justify-center gap-2" style={{ color: "#8b5cf6" }}>
            <Smartphone className="w-4 h-4" />
            Wkrótce dostępne
          </p>
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Prywatna aplikacja w kieszeni Twojej klientki.
            <br />
            <span className="apple-accent-gradient">Tylko Ty. Bez konkurencji.</span>
          </h2>
          <p className="subheadline max-w-2xl mx-auto" style={{ color: "#6e6e73" }}>
            Twoja klientka pobiera aplikację Beauty Calendar i przypisuje się do Twojego salonu.
            Widzi tylko Ciebie — nie marketplace, nie konkurencję. To Twoja prywatna przestrzeń w jej telefonie.
          </p>
        </AnimatedHeadline>

        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { title: "Beauty Calendar Business", subtitle: "Dla właścicielek i managera salonu", features: ownerFeatures, date: "Q3 2026", color: "#8b5cf6" },
            { title: "Beauty Calendar Client", subtitle: "Prywatna aplikacja dla klientek Twojego salonu", features: clientFeatures, date: "Q4 2026", color: "#ec4899" },
          ].map((app, idx) => (
            <motion.div key={idx} variants={cardVariants}>
              <div className="landing-card-dark p-6 lg:p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: `${app.color}08` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${app.color}10` }}>
                      <Smartphone className="w-6 h-6" style={{ color: app.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{app.title}</h3>
                      <p className="text-sm" style={{ color: "#86868b" }}>{app.subtitle}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {app.features.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#6e6e73" }}>
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="flex gap-3 mb-4">
                    {["App Store", "Google Play"].map((store) => (
                      <div key={store} className="px-3 py-2 rounded-lg text-xs cursor-not-allowed" style={{ background: "#faf9f7", color: "#c7c7cc" }}>
                        <div className="text-[10px]">Pobierz w</div>
                        <div className="font-semibold">{store}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: "#86868b" }}>
                    <Bell className="w-3 h-3" />
                    Dostępna {app.date} — zapisz się na listę
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: appleEaseArray }}
        >
          <p className="mb-4" style={{ color: "#6e6e73" }}>
            Bądź pierwsza — dołącz do listy oczekujących i dostań aplikację w dniu premiery za darmo.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="twoj@email.pl"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              className="flex-1 bg-white border-black/10 text-[#1d1d1f] placeholder:text-[#c7c7cc]"
            />
            <button onClick={handleWaitlist} className="apple-btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
              <Bell className="w-4 h-4" />
              Powiadom mnie
            </button>
          </div>
          <p className="text-xs mt-3" style={{ color: "#86868b" }}>
            Dołączyło już <span className="font-bold" style={{ color: "#8b5cf6" }}>247</span> właścicielek salonów
          </p>
        </motion.div>
      </div>
    </section>
  );
};

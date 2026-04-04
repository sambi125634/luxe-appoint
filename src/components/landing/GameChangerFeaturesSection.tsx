import { motion } from "framer-motion";
import {
  Brain, Video, FlaskConical, ScanBarcode, TrendingUp, Users,
  ClipboardList, Mail, Route, ShieldAlert, CreditCard, BarChart3, Heart, Link2,
} from "lucide-react";
import { AnimatedHeadline, containerVariants, cardVariants } from "@/components/ui/AnimatedSection";

const features = [
  { icon: Brain, title: "Inteligentny Asystent Grafiku", description: 'Masz lukę między 13:00 a 15:00? AI automatycznie sugeruje ten termin klientkom jako „rekomendowany”. Twój kalendarz wypełnia się sam — bez pustych godzin, bez strat.' },
  { icon: Video, title: "Wideo-prezentacje usług", description: "Klientka widzi Twoją usługę w akcji zanim zarezerwuje. Krótkie wideo w kalendarzu i aplikacji mobilnej buduje zaufanie i zwiększa konwersję rezerwacji nawet o 40%." },
  { icon: FlaskConical, title: "Receptury zabiegowe + True Profit", description: "Dodajesz składniki i ich zużycie per zabieg. System automatycznie oblicza realny koszt usługi, aktualizuje stany magazynowe i pokazuje Twój prawdziwy zysk — nie przychód, a zysk." },
  { icon: ScanBarcode, title: "Skan aparatem → stan magazynowy", description: "Otwierasz kamerę w telefonie lub komputerze, skanujesz kody produktów — stan aktualizuje się na żywo. Koniec z ręcznym liczeniem. Raport gotowy w 3 minuty." },
  { icon: TrendingUp, title: "Prognoza przychodów AI", description: "Na podstawie historii wizyt, sezonowości i aktualnych rezerwacji AI prognozuje Twój przychód na najbliższe tygodnie. Wiesz z wyprzedzeniem ile zarobisz — i co zrobić, żeby zarobić więcej." },
  { icon: Users, title: "Grupy zakupowe klientów", description: "AI automatycznie segreguje klientów wg preferencji: VIP Shopper, Stała, Sezonowa, Odkrywczyni. Wiesz komu zaproponować upsell, a kogo reaktywować — zanim odejdzie." },
  { icon: ClipboardList, title: "Karty konsultacyjne", description: "Tworzysz ankietę od zera lub wybierasz szablon. Przypisujesz do usługi — klient wypełnia automatycznie po rezerwacji. Dane zapisane w profilu. Otwierasz przed wizytą i wiesz wszystko." },
  { icon: Mail, title: "Raporty dla księgowej — 1 klik", description: 'Sprzedaż ze stawkami VAT, prowizje pracowników, podsumowanie kasowe. Wpisujesz email księgowej, klikasz „Wyślij” — koniec. Zero eksportowania, zero załączników.' },
  { icon: Route, title: "Ścieżka Klienta — pipeline 5 wizyt", description: "Sprzedajesz pakiet 5 zabiegów, ale klient płaci za jedną wizytę. System pilnuje, żeby wrócił na kolejne 4 — automatyczne sekwencje między wizytami, upsell pakietów, maksymalizacja LTV." },
  { icon: ShieldAlert, title: "AI Retencja — strefy zagrożenia", description: "System dzieli klientów na strefy: Aktywna, Uwaga, Ryzyko, Krytyczna, Utracona. Dla każdej strefy masz gotowe sekwencje reaktywacyjne. AI wykrywa kto odchodzi i działa zanim będzie za późno." },
  { icon: CreditCard, title: "Auto-zaliczki dla no-showów", description: "Klient nie przyszedł 2 razy? Przy trzeciej rezerwacji system automatycznie wymaga zaliczki. Tylko od tych, którzy nie przychodzą — reszta rezerwuje normalnie. Zero ręcznej konfiguracji." },
  { icon: BarChart3, title: "Śledzenie linków retencyjnych", description: "Każda kampania retencyjna ma konkretne wskaźniki: otwarcia, kliknięcia, rezerwacje, wartość. Wiesz która wiadomość sprzedaje, a która trafia w pustkę." },
  { icon: Heart, title: "Program poleceń z pełną analityką", description: "Twoje klientki jako ambasadorki Twojego salonu. Każda dostaje unikalny link. Widzisz kliknięcia, rezerwacje i konkretną wartość przychodu od każdej polecającej." },
  { icon: Link2, title: "Współpraca z influencerami", description: "Dedykowane linki afiliacyjne ze statystykami ROI. Wiesz ile kliknięć, rezerwacji i ile pieniędzy przyniosła każda współpraca. Podejmujesz decyzje na danych, nie na przeczuciu." },
];

export const GameChangerFeaturesSection = () => {
  return (
    <section className="landing-section-light landing-section-spacing" id="game-changers">
      {/* Transition from dark */}
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-16">
          <p className="eyebrow tracking-widest mb-4 landing-text-muted-light">
            🚀 To zmienia zasady gry
          </p>
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            14 funkcji, których{" "}
            <span className="apple-accent-gradient">nie znajdziesz nigdzie indziej</span>
          </h2>
          <p className="subheadline landing-text-muted-light max-w-2xl mx-auto">
            Każda z tych funkcji sama w sobie jest warta więcej niż cały
            abonament. Razem tworzą system, który pracuje za Ciebie 24/7.
          </p>
        </AnimatedHeadline>

        <motion.div
          className="grid md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className="landing-card-light p-8 transition-all duration-300 will-change-transform"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed landing-text-muted-light">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Section transition */}
      <div className="h-32 section-fade-to-dark mt-16" />
    </section>
  );
};
import { motion } from "framer-motion";
import {
  Brain,
  Video,
  FlaskConical,
  ScanBarcode,
  TrendingUp,
  Users,
  ClipboardList,
  Mail,
  Route,
  ShieldAlert,
  CreditCard,
  BarChart3,
  Heart,
  Link2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Inteligentny Asystent Grafiku",
    description:
      'Masz lukę między 13:00 a 15:00? AI automatycznie sugeruje ten termin klientkom jako „rekomendowany". Twój kalendarz wypełnia się sam — bez pustych godzin, bez strat.',
    accent: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
  },
  {
    icon: Video,
    title: "Wideo-prezentacje usług",
    description:
      "Klientka widzi Twoją usługę w akcji zanim zarezerwuje. Krótkie wideo w kalendarzu i aplikacji mobilnej buduje zaufanie i zwiększa konwersję rezerwacji nawet o 40%.",
    accent: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
  },
  {
    icon: FlaskConical,
    title: "Receptury zabiegowe + True Profit",
    description:
      "Dodajesz składniki i ich zużycie per zabieg. System automatycznie oblicza realny koszt usługi, aktualizuje stany magazynowe i pokazuje Twój prawdziwy zysk — nie przychód, a zysk.",
    accent: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  {
    icon: ScanBarcode,
    title: "Skan aparatem → stan magazynowy",
    description:
      "Otwierasz kamerę w telefonie lub komputerze, skanujesz kody produktów — stan aktualizuje się na żywo. Koniec z ręcznym liczeniem. Raport gotowy w 3 minuty.",
    accent: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Prognoza przychodów AI",
    description:
      "Na podstawie historii wizyt, sezonowości i aktualnych rezerwacji AI prognozuje Twój przychód na najbliższe tygodnie. Wiesz z wyprzedzeniem ile zarobisz — i co zrobić, żeby zarobić więcej.",
    accent: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Grupy zakupowe klientów",
    description:
      "Wiesz od razu: kto jest VIP, kto stała, kto sezonowa, kto odkrywczyni. Wiesz komu zaproponować upsell, a kogo reaktywować — zanim odejdzie.",
    accent: "from-indigo-500/20 to-indigo-500/5",
    iconColor: "text-indigo-500",
  },
  {
    icon: ClipboardList,
    title: "Karty konsultacyjne",
    description:
      "Tworzysz ankietę od zera lub wybierasz szablon. Przypisujesz do usługi — klient wypełnia automatycznie po rezerwacji. Dane zapisane w profilu. Otwierasz przed wizytą i wiesz wszystko.",
    accent: "from-teal-500/20 to-teal-500/5",
    iconColor: "text-teal-500",
  },
  {
    icon: Mail,
    title: "Raporty dla księgowej — 1 klik",
    description:
      'Sprzedaż ze stawkami VAT, prowizje pracowników, podsumowanie kasowe. Wpisujesz email księgowej, klikasz „Wyślij" — koniec. Zero eksportowania, zero załączników.',
    accent: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
  },
  {
    icon: Route,
    title: "Ścieżka Klienta — pipeline 5 wizyt",
    description:
      "Sprzedajesz pakiet 5 zabiegów, ale klient płaci za jedną wizytę. System pilnuje, żeby wrócił na kolejne 4 — automatyczne sekwencje między wizytami, upsell pakietów, maksymalizacja LTV.",
    accent: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
  },
  {
    icon: ShieldAlert,
    title: "AI Retencja — strefy zagrożenia",
    description:
      "Widzisz od razu kto odchodzi — strefy: Aktywna, Uwaga, Ryzyko, Krytyczna, Utracona. Dla każdej strefy masz gotowe sekwencje reaktywacyjne. Działasz zanim będzie za późno.",
    accent: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-500",
  },
  {
    icon: CreditCard,
    title: "Auto-zaliczki dla no-showów",
    description:
      "Klient nie przyszedł 2 razy? Przy trzeciej rezerwacji system automatycznie wymaga zaliczki. Tylko od tych, którzy nie przychodzą — reszta rezerwuje normalnie. Zero ręcznej konfiguracji.",
    accent: "from-fuchsia-500/20 to-fuchsia-500/5",
    iconColor: "text-fuchsia-500",
  },
  {
    icon: BarChart3,
    title: "Śledzenie linków retencyjnych",
    description:
      "Każda kampania retencyjna ma konkretne wskaźniki: otwarcia, kliknięcia, rezerwacje, wartość. Wiesz która wiadomość sprzedaje, a która trafia w pustkę.",
    accent: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
  },
  {
    icon: Heart,
    title: "Program poleceń z pełną analityką",
    description:
      "Twoje klientki jako ambasadorki Twojego salonu. Każda dostaje unikalny link. Widzisz kliknięcia, rezerwacje i konkretną wartość przychodu od każdej polecającej.",
    accent: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
  },
  {
    icon: Link2,
    title: "Współpraca z influencerami",
    description:
      "Dedykowane linki afiliacyjne ze statystykami ROI. Wiesz ile kliknięć, rezerwacji i ile pieniędzy przyniosła każda współpraca. Podejmujesz decyzje na danych, nie na przeczuciu.",
    accent: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
  },
];

export const GameChangerFeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28" id="game-changers">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-4 font-medium">
            🚀 To zmienia zasady gry
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            14 sposobów w jakie{" "}
            <span className="text-primary">Twój salon zarabia więcej</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Każda z tych funkcji sama w sobie jest warta więcej niż cały
            abonament. Razem sprawiają że Twój salon zarabia nawet gdy śpisz.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.5 }}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative flex gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 ${feature.iconColor} group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

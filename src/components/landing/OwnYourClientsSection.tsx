import { AlertTriangle, X, Check, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const OwnYourClientsSection = () => {
  return (
    <section className="py-24">
      <div className="container max-w-5xl mx-auto px-4">
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2 text-sm font-medium text-destructive mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              Wiedziałaś o tym?
            </div>

            <h2 className="text-3xl font-serif font-bold mb-6 leading-tight">
              Pracujesz na budowę
              <span className="text-destructive"> cudzej bazy klientek.</span>
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Platformy marketplace działają jak
                <strong className="text-foreground"> Allegro dla usług beauty.</strong>
                {" "}Wchodzisz, wystawiasz usługi, bijesz się ceną z innymi salonami obok Ciebie. Klientka wybiera najtańszego.
              </p>
              <p>
                Co gorsza — ta klientka
                <strong className="text-foreground"> należy do platformy, nie do Ciebie.</strong>
                {" "}Jej dane, jej historia, jej preferencje — to ich własność. Gdy odejdziesz, nie zabierzesz ich ze sobą.
              </p>
              <p>
                <strong className="text-foreground">Jutro mogą podnieść prowizję.</strong>
                {" "}Pojutrze mogą wyświetlić Twoją konkurencję tej samej klientce za 10 zł taniej.
                {" "}<strong className="text-foreground">A Ty nie możesz nic zrobić.</strong>
              </p>
              <p>
                Przez lata budujesz ich biznes.
                <strong className="text-foreground"> Nie swój.</strong>
                {" "}Bo to ich baza. <span className="text-muted-foreground/60">Nie Twoja.</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Marketplace card */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-sm">🏪</div>
                <span className="font-bold text-sm">Platforma marketplace</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Klientki należą do platformy — nie do Ciebie",
                  "Odejście = utrata całej historii i danych",
                  "Walczysz ceną z konkurencją wyświetlaną obok",
                  "Jutro mogą zmienić zasady — i nic na to nie poradzisz",
                  "Prowizja od każdej nowej wizyty przez Boost",
                  "Brak narzędzi do retencji — klientka wraca do marketplace, nie do Ciebie",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Beauty Calendar card */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">✨</div>
                <span className="font-bold text-sm">Beauty Calendar</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { text: "Twoje klientki. Twoje dane. Na zawsze.", bold: true },
                  { text: "Eksport jednym kliknięciem — żadna platforma nie może Ci ich zabrać" },
                  { text: "Prywatna aplikacja — klientka widzi tylko Twój salon" },
                  { text: "Budujesz własny brand, nie cudzą platformę" },
                  { text: "Automatyczne sekwencje retencyjne — klientki wracają same" },
                  { text: "0% prowizji od rezerwacji. Zawsze. Bez wyjątków." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>
                      {item.bold ? <strong className="text-foreground">{item.text}</strong> : item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground italic font-serif">
                {'"'}Nie budujesz na cudzej ziemi. Budujesz własny dom.{'"'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

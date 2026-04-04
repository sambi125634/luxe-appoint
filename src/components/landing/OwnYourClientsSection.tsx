import { AlertTriangle, X, Check } from "lucide-react";
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
              Wiedzia\u0142a\u015b o tym?
            </div>

            <h2 className="text-3xl font-serif font-bold mb-6 leading-tight">
              Pracujesz na budow\u0119
              <span className="text-destructive"> cudzej bazy klientek.</span>
            </h2>

            <div className="space-y-4 text-muted-foreground">
              <p>
                Platformy marketplace dzia\u0142aj\u0105 jak
                <strong className="text-foreground"> Allegro dla us\u0142ug beauty.</strong>
                {" "}Wchodzisz, wystawiasz us\u0142ugi, bijesz si\u0119 cen\u0105 z innymi salonami obok Ciebie. Klientka wybiera najta\u0144szego.
              </p>
              <p>
                Co gorsza \u2014 ta klientka
                <strong className="text-foreground"> nale\u017cy do platformy, nie do Ciebie.</strong>
                {" "}Jej dane, jej historia, jej preferencje \u2014 to ich w\u0142asno\u015b\u0107. Gdy odejdziesz, nie zabierzesz ich ze sob\u0105.
              </p>
              <p>
                Przez lata budujesz ich biznes.
                <strong className="text-foreground"> Nie sw\u00f3j.</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Marketplace card */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-sm">\ud83c\udfea</div>
                <span className="font-bold text-sm">Platforma marketplace</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  "Klientki nale\u017c\u0105 do platformy",
                  "Odej\u015bcie = utrata ca\u0142ej historii",
                  "Walczysz cen\u0105 z konkurencj\u0105 obok",
                  "Brak narz\u0119dzi do retencji klientek",
                  "Prowizja od ka\u017cdej nowej wizyty",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Beauty Calendar card */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">\u2728</div>
                <span className="font-bold text-sm">Beauty Calendar</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  { text: "Twoje klientki. Na zawsze.", bold: true, extra: " Eksport jednym klikni\u0119ciem" },
                  { text: "Prywatna aplikacja \u2014 tylko Tw\u00f3j salon" },
                  { text: "Budujesz w\u0142asny brand, nie cudzy" },
                  { text: "Automatyczne sekwencje retencyjne" },
                  { text: "0% prowizji od rezerwacji. Zawsze." },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>
                      {item.bold ? <strong className="text-foreground">{item.text}</strong> : item.text}
                      {item.extra}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground italic">
                {"\u201e"}Nie budujesz na cudzej ziemi. Budujesz w\u0142asny dom.{"\u201d"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

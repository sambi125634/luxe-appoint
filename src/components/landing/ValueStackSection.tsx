import { Check } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { name: "System Rezerwacji Online 24/7", desc: "Widget na stron\u0119, Instagram, QR kod", value: "197 z\u0142/mies" },
  { name: "\u015Acie\u017Cka Klientki \u2014 automatyczne sekwencje retencyjne", desc: "Lejek od 1. do 5. wizyty, upsell pakiet\u00F3w, maksymalizacja LTV", value: "497 z\u0142/mies" },
  { name: "AI Autopilot \u2014 potwierdzenia + przypomnienia", desc: "Automatyczne SMS i email, zero r\u0119cznej pracy", value: "297 z\u0142/mies" },
  { name: "AI Prognoza przychod\u00F3w (30 dni)", desc: "Wiesz z wyprzedzeniem ile zarobisz", value: "397 z\u0142/mies" },
  { name: "CRM Klientek + Historia wizyt", desc: "Pe\u0142na baza z segmentacj\u0105 i tagami", value: "147 z\u0142/mies" },
  { name: "Radar Odej\u015B\u0107 \u2014 AI churn detection", desc: "Wykrywa klientki zagro\u017Cone odej\u015Bciem", value: "297 z\u0142/mies" },
  { name: "Zarz\u0105dzanie Magazynem + Receptury", desc: "Stany, dostawy, True Profit na zabieg", value: "197 z\u0142/mies" },
  { name: "Program Polece\u0144 + Google Reviews", desc: "Automatyczne pro\u015Bby o opinie, kody polecaj\u0105ce", value: "147 z\u0142/mies" },
  { name: "Raporty Finansowe + Eksport danych", desc: "VAT, prowizje pracownik\u00F3w, True Profit", value: "97 z\u0142/mies" },
  { name: "Aplikacja mobilna (w\u0142a\u015Bciciel + klientka)", desc: "Prywatna przestrze\u0144 \u2014 klientka widzi TYLKO Tw\u00F3j salon", value: "297 z\u0142/mies" },
  { name: "BONUS: Import z marketplace jednym klikni\u0119ciem", desc: "Przenie\u015B baz\u0119 klientek w 15 minut", value: "997 z\u0142 (jednorazowo)", isBonus: true },
];

export const ValueStackSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5" id="value">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-serif font-bold mb-4">Co dostajesz w Beauty Calendar PRO</h2>
          <p className="text-muted-foreground">Zsumujmy warto\u015B\u0107 tego co otrzymujesz</p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                item.isBonus ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card border-border'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                item.isBonus ? 'bg-amber-500/10' : 'bg-primary/10'
              }`}>
                <Check className={`w-3.5 h-3.5 ${item.isBonus ? 'text-amber-500' : 'text-primary'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {item.isBonus && <span className="text-amber-500 font-bold mr-2">{"\uD83C\uDF81"} BONUS:</span>}
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs line-through text-muted-foreground">{item.value}</p>
                <p className="text-xs font-bold text-primary">W CENIE</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <motion.div
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-1">
            \u0141\u0105czna warto\u015B\u0107 gdyby\u015B p\u0142aci\u0142a za ka\u017Cde narz\u0119dzie osobno:
          </p>
          <p className="text-4xl font-black line-through text-muted-foreground mb-2">3 570 z\u0142/mies</p>
          <p className="text-sm text-muted-foreground mb-3">Twoja cena z Beauty Calendar PRO:</p>
          <p className="text-5xl font-black text-primary mb-2">99 z\u0142 netto/mies</p>
          <p className="text-sm text-muted-foreground">+ 0 z\u0142 prowizji od rezerwacji. Zawsze. Twoja baza = Twoja w\u0142asno\u015B\u0107.</p>
        </motion.div>
      </div>
    </section>
  );
};
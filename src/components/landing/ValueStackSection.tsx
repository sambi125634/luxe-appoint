import { Check } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { name: "System Rezerwacji Online 24/7", desc: "Widget na stronę, Instagram, QR kod", value: "197 zł/mies" },
  { name: "AI Autopilot — potwierdzenia + przypomnienia", desc: "Automatyczne SMS i email, zero ręcznej pracy", value: "297 zł/mies" },
  { name: "AI Prognoza przychodów (30 dni, 94% trafność)", desc: "Wiesz z wyprzedzeniem ile zarobisz", value: "397 zł/mies" },
  { name: "CRM Klientek + Historia wizyt", desc: "Pełna baza z segmentacją i tagami", value: "147 zł/mies" },
  { name: "Ścieżka Klientki — system powrotów", desc: "Automatyczny lejek od 1. do 5. wizyty", value: "497 zł/mies" },
  { name: "Radar Odejść — AI churn detection", desc: "Wykrywa klientki zagrożone odejściem", value: "297 zł/mies" },
  { name: "Zarządzanie Magazynem + Receptury", desc: "Stany, dostawy, True Profit na zabieg", value: "197 zł/mies" },
  { name: "Program Poleceń + Google Reviews", desc: "Automatyczne prośby o opinie, kody polecające", value: "147 zł/mies" },
  { name: "Raporty Finansowe + Eksport danych", desc: "VAT, prowizje pracowników, True Profit", value: "97 zł/mies" },
  { name: "BONUS: Import z Booksy jednym kliknięciem", desc: "Przenieś wszystko w 15 minut", value: "997 zł (jednorazowo)", isBonus: true },
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
          <p className="text-muted-foreground">Zsumujmy wartość tego co otrzymujesz</p>
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
                  {item.isBonus && <span className="text-amber-500 font-bold mr-2">🎁 BONUS:</span>}
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
            Łączna wartość gdybyś płaciła za każde narzędzie osobno:
          </p>
          <p className="text-4xl font-black line-through text-muted-foreground mb-2">3 272 zł/mies</p>
          <p className="text-sm text-muted-foreground mb-3">Twoja cena z Beauty Calendar PRO:</p>
          <p className="text-5xl font-black text-primary mb-2">149 zł/mies</p>
          <p className="text-sm text-muted-foreground">+ 0 zł prowizji od rezerwacji. Zawsze.</p>
        </motion.div>
      </div>
    </section>
  );
};
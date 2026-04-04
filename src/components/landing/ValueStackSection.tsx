import { Check } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { name: "Inteligentny Asystent Grafiku — AI wypełnia luki za Ciebie", desc: "Rekomenduje klientom terminy korzystne dla Twojego kalendarza", value: "397 zł/mies" },
  { name: "Wideo-prezentacje usług w kalendarzu", desc: "Klient widzi efekt zabiegu zanim zarezerwuje", value: "197 zł/mies" },
  { name: "Receptury zabiegowe + True Profit", desc: "Realny koszt usługi, automatyczna aktualizacja magazynu", value: "297 zł/mies" },
  { name: "Skan kodów → aktualizacja magazynu", desc: "Aparat w telefonie lub kamera w komputerze — 3 minuty i gotowe", value: "147 zł/mies" },
  { name: "Prognoza przychodów AI (30 dni)", desc: "Wiesz z wyprzedzeniem ile zarobisz i co zrobić, żeby zarobić więcej", value: "397 zł/mies" },
  { name: "Grupy zakupowe + segregacja klientów AI", desc: "VIP, Stała, Sezonowa, Odkrywczyni — wiesz komu co zaproponować", value: "297 zł/mies" },
  { name: "Karty konsultacyjne z auto-wysyłką", desc: "Ankiety po rezerwacji, dane w profilu klienta, gotowe szablony", value: "197 zł/mies" },
  { name: "Raporty dla księgowej — 1 kliknięcie", desc: "VAT, prowizje, podsumowanie kasowe — email i gotowe", value: "97 zł/mies" },
  { name: "Ścieżka Klienta — pipeline 5 wizyt", desc: "Automatyczne sekwencje między wizytami, upsell pakietów", value: "497 zł/mies" },
  { name: "AI Retencja — strefy zagrożenia + sekwencje", desc: "Wykrywa kto odchodzi i reaguje zanim będzie za późno", value: "397 zł/mies" },
  { name: "Auto-zaliczki dla no-showów", desc: "Wymusza zaliczki tylko od klientów, którzy nie przychodzą", value: "197 zł/mies" },
  { name: "Program poleceń + współpraca z influencerami", desc: "Linki afiliacyjne ze statystykami ROI", value: "197 zł/mies" },
  { name: "Aplikacja mobilna (właściciel + klient)", desc: "Klient widzi TYLKO Twój salon — prywatna przestrzeń w telefonie", value: "297 zł/mies" },
  { name: "BONUS: Import bazy klientów jednym kliknięciem", desc: "Przenieś bazę z marketplace w 15 minut", value: "997 zł (jednorazowo)", isBonus: true },
];

export const ValueStackSection = () => {
  const totalValue = "3 910 zł/mies";

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
          <h2 className="text-3xl font-serif font-bold mb-4">Zsumujmy, co dostajesz</h2>
          <p className="text-muted-foreground">Gdybyś płaciła za każde narzędzie osobno — tyle by Cię to kosztowało</p>
        </motion.div>

        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
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
          <p className="text-4xl font-black line-through text-muted-foreground mb-2">{totalValue}</p>
          <p className="text-sm text-muted-foreground mb-3">Twoja cena z Beauty Calendar PRO:</p>
          <p className="text-5xl font-black text-primary mb-2">99 zł netto/mies</p>
          <p className="text-sm text-muted-foreground">+ 0 zł prowizji od rezerwacji. Zawsze. Twoja baza = Twoja własność.</p>
        </motion.div>
      </div>
    </section>
  );
};

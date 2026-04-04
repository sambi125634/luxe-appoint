import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

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
    <section className="landing-section-light landing-section-spacing" id="value">
      <div className="max-w-[800px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-12">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>Zsumujmy, co dostajesz</h2>
          <p className="subheadline landing-text-muted-light">Gdybyś płaciła za każde narzędzie osobno — tyle by Cię to kosztowało</p>
        </AnimatedHeadline>

        <div className="space-y-3 mb-10">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, ease: appleEaseArray }}
              className={`flex items-center gap-4 p-4 rounded-2xl ${
                item.isBonus
                  ? "bg-amber-50 border border-amber-200"
                  : "landing-card-light"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                item.isBonus ? "bg-amber-100" : "bg-[#8b5cf6]/10"
              }`}>
                <Check className={`w-3.5 h-3.5 ${item.isBonus ? "text-amber-600" : "text-[#8b5cf6]"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>
                  {item.isBonus && <span className="text-amber-600 font-bold mr-2">🎁 BONUS:</span>}
                  {item.name}
                </p>
                <p className="text-xs landing-text-muted-light">{item.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs line-through landing-text-muted-light">{item.value}</p>
                <p className="text-xs font-bold text-[#8b5cf6]">W CENIE</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <motion.div
          className="rounded-3xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))", border: "1px solid rgba(139,92,246,0.15)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: appleEaseArray }}
        >
          <p className="text-sm landing-text-muted-light mb-1">
            Łączna wartość gdybyś płaciła za każde narzędzie osobno:
          </p>
          <p className="text-4xl font-black line-through landing-text-muted-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{totalValue}</p>
          <p className="text-sm landing-text-muted-light mb-3">Twoja cena z Beauty Calendar PRO:</p>
          <p className="text-5xl font-black mb-3 apple-accent-gradient" style={{ fontFamily: "'Playfair Display', serif" }}>99 zł netto/mies</p>
          <p className="text-sm landing-text-muted-light">+ 0 zł prowizji od rezerwacji. Zawsze. Twoja baza = Twoja własność.</p>
        </motion.div>
      </div>

      <div className="h-32 section-fade-to-dark mt-16" />
    </section>
  );
};
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

/* ── Slider component ── */
const CalcSlider = ({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <p className="text-[0.93rem] text-[var(--calc-text)]">{label}</p>
          <p className="text-[0.72rem] text-[var(--calc-muted)] mt-0.5 leading-snug">{hint}</p>
        </div>
        <span className="font-serif text-xl font-bold text-[var(--calc-accent)] whitespace-nowrap shrink-0 min-w-[64px] text-right">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[22px]
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(181,115,122,0.35),0_2px_8px_rgba(0,0,0,0.15)]
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-shadow
          hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_5px_rgba(181,115,122,0.22),0_2px_14px_rgba(0,0,0,0.2)]"
        style={{
          background: `linear-gradient(90deg, rgba(200,149,107,0.5) 0%, rgba(181,115,122,0.5) ${pct}%, rgba(180,150,120,0.12) ${pct}%)`,
        }}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-[0.66rem] text-[var(--calc-muted)]">{format(min)}</span>
        <span className="text-[0.66rem] text-[var(--calc-muted)]">{format(max)}</span>
      </div>
    </div>
  );
};

/* ── Bar row ── */
const BarRow = ({
  label,
  value,
  maxVal,
  type,
}: {
  label: string;
  value: number;
  maxVal: number;
  type: "loss" | "ai";
}) => {
  const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
  const color = type === "loss" ? "rgba(217,79,61,0.45)" : "linear-gradient(135deg, #c8956b, #b5737a)";

  return (
    <div className="flex items-center gap-3 mb-2.5 last:mb-0">
      <span className="text-[0.72rem] text-[var(--calc-muted)] w-[100px] shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[rgba(180,150,120,0.08)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
      <span className={`text-[0.72rem] font-medium w-[78px] text-right shrink-0 ${type === "loss" ? "text-[#D94F3D]" : "text-[#6a9e6a]"}`}>
        {value.toLocaleString("pl-PL")} zł
      </span>
    </div>
  );
};

/* ── Main ── */
const SavingsCalculator = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState(80);
  const [avgValue, setAvgValue] = useState(200);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [staffCount, setStaffCount] = useState(1);
  const [noshowPct, setNoshowPct] = useState(20);

  const results = useMemo(() => {
    const receptionCostYear = hourlyRate * 160 * staffCount * 12;
    const noshowLossYear = Math.round(bookings * (noshowPct / 100) * avgValue * 12);
    const noshowRecovered = Math.round(noshowLossYear * 0.4);

    const aiCostYear = Math.round(bookings * 2 * 2 * 0.74 * 12);
    const totalLoss = receptionCostYear + noshowLossYear;
    const beautyCost = aiCostYear + 149 * 12;

    return {
      receptionCostYear,
      noshowLossYear,
      noshowRecovered,
      totalLoss,
      aiCostYear,
      beautyCost,
    };
  }, [bookings, avgValue, hourlyRate, staffCount, noshowPct]);

  const maxBarVal = Math.max(results.receptionCostYear, results.noshowLossYear, results.beautyCost);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  return (
    <section
      className="w-full max-w-[680px] mx-auto relative z-10"
      style={{
        "--calc-bg": "#faf7f2",
        "--calc-surface": "#ffffff",
        "--calc-surface2": "#f4efe6",
        "--calc-border": "rgba(180,150,120,0.18)",
        "--calc-accent": "#b5737a",
        "--calc-text": "#2c2420",
        "--calc-muted": "rgba(44,36,32,0.45)",
        "--calc-green": "#6a9e6a",
        "--calc-red": "#D94F3D",
      } as React.CSSProperties}
    >
      {/* Hero */}
      <motion.div className="text-center mb-14" {...fadeIn}>
        <span className="inline-block border border-[rgba(181,115,122,0.35)] bg-[rgba(181,115,122,0.06)] text-[var(--calc-accent)] text-[0.68rem] font-medium tracking-[0.16em] uppercase px-4 py-1.5 rounded-full mb-6">
          ✦ Kalkulator Oszczędności
        </span>
        <h2 className="font-serif text-[clamp(2rem,5.5vw,3.1rem)] leading-[1.13] tracking-[0.01em] text-[#2c2420] mb-4 font-light">
          Sprawdź ile Twój salon traci{" "}
          <br className="hidden md:block" />
          każdego roku — bo{" "}
          <em className="italic bg-gradient-to-r from-[#c8956b] to-[#b5737a] bg-clip-text text-transparent font-normal">
            liczby nie kłamią
          </em>
        </h2>
        <p className="text-[var(--calc-muted)] text-[0.97rem] font-light max-w-[490px] mx-auto leading-relaxed">
          Właśnie rozmawiałaś z AI który mógłby pracować dla Twojego salonu 24/7.
          <br />
          Teraz czas na <strong className="text-[#2c2420] font-medium">brutalną prawdę</strong> o tym co Cię to kosztuje —
          każdego dnia gdy go nie masz.
        </p>
      </motion.div>

      {/* Card: Twój salon */}
      <motion.div
        className="bg-[var(--calc-surface)] border border-[var(--calc-border)] rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(180,150,120,0.08)" }}
        {...fadeIn}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(181,115,122,0.25)] to-transparent" />
        <div className="text-[0.68rem] font-medium tracking-[0.13em] uppercase text-[var(--calc-muted)] mb-1 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[var(--calc-border)]">
          Twój salon
        </div>
        <p className="text-[0.78rem] text-[var(--calc-muted)] italic mb-7 leading-snug">
          Zacznij od podstaw — ile wizyt i ile na nich zarabiasz.
        </p>

        <CalcSlider label="Rezerwacje miesięcznie" hint="Ile wizyt przyjmuje Twój salon każdego miesiąca?" value={bookings} min={10} max={500} step={5} format={(v) => String(v)} onChange={setBookings} />
        <CalcSlider label="Średnia wartość jednej wizyty" hint="Od manicure po zabieg laserowy — jaka jest Twoja średnia?" value={avgValue} min={50} max={2000} step={10} format={(v) => `${v} zł`} onChange={setAvgValue} />
      </motion.div>

      {/* Card: Zespół recepcji */}
      <motion.div
        className="bg-[var(--calc-surface)] border border-[var(--calc-border)] rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(180,150,120,0.08)" }}
        {...fadeIn}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(181,115,122,0.25)] to-transparent" />
        <div className="text-[0.68rem] font-medium tracking-[0.13em] uppercase text-[var(--calc-muted)] mb-1 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[var(--calc-border)]">
          Twój zespół recepcji
        </div>
        <p className="text-[0.78rem] text-[var(--calc-muted)] italic mb-7 leading-snug">
          Ile naprawdę płacisz za ręczną obsługę rezerwacji i potwierdzeń?
        </p>

        <CalcSlider label="Stawka godzinowa recepcjonistki" hint="Podstawa do wyliczenia kosztu pełnego etatu (160h / miesiąc)" value={hourlyRate} min={20} max={100} step={1} format={(v) => `${v} zł`} onChange={setHourlyRate} />
        <CalcSlider label="Liczba pracowników recepcji" hint="Ilu pracowników zajmuje się obsługą rezerwacji i telefonami?" value={staffCount} min={1} max={5} step={1} format={(v) => String(v)} onChange={setStaffCount} />
      </motion.div>

      {/* Card: No-shows */}
      <motion.div
        className="bg-[var(--calc-surface)] border border-[var(--calc-border)] rounded-[20px] p-6 md:p-9 mb-5 relative overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(180,150,120,0.08)" }}
        {...fadeIn}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(181,115,122,0.25)] to-transparent" />
        <div className="text-[0.68rem] font-medium tracking-[0.13em] uppercase text-[var(--calc-muted)] mb-1 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-[var(--calc-border)]">
          Cichy złodziej Twoich przychodów
        </div>
        <p className="text-[0.78rem] text-[var(--calc-muted)] italic mb-7 leading-snug">
          Wizyty zarezerwowane, za które nigdy nie dostałaś zapłaty — bo klientka po prostu nie przyszła.
        </p>

        <CalcSlider label="Procent wizyt które nie przychodzą" hint="Klientki które zarezerwowały, ale nie pojawiły się bez odwołania" value={noshowPct} min={0} max={100} step={1} format={(v) => `${v}%`} onChange={setNoshowPct} />

        <p className="text-[0.72rem] text-[var(--calc-muted)] italic mt-6 leading-snug border-t border-[var(--calc-border)] pt-4">
          ✦ Na podstawie danych z salonów używających Beauty Funnels AI — automatyczne potwierdzenia głosowe ratują średnio 40% no-shows. Tyle doliczamy do Twoich oszczędności.
        </p>
      </motion.div>

      {/* Results */}
      <motion.div
        className="bg-[var(--calc-surface)] border border-[rgba(181,115,122,0.22)] rounded-[20px] overflow-hidden mb-5"
        style={{ boxShadow: "0 8px 30px rgba(181,115,122,0.08)" }}
        {...fadeIn}
      >
        {/* Hero result */}
        <div className="bg-gradient-to-br from-[rgba(181,115,122,0.08)] to-[rgba(200,149,107,0.05)] p-6 md:px-10 md:py-8 border-b border-[rgba(181,115,122,0.12)]">
          <p className="text-[0.66rem] font-medium tracking-[0.14em] uppercase text-[var(--calc-accent)] mb-2">
            Tyle traci Twój salon rocznie bez automatyzacji
          </p>
          <p className="font-serif text-[clamp(3rem,10vw,5rem)] font-bold leading-none bg-gradient-to-r from-[#c8956b] to-[#b5737a] bg-clip-text text-transparent">
            {results.totalLoss.toLocaleString("pl-PL")} zł
          </p>
          <p className="text-[0.82rem] text-[var(--calc-muted)] mt-2">
            etat recepcji + utracone wizyty = realna dziura w przychodach której Beauty Funnels kosztuje ułamek
          </p>
        </div>

        {/* 3-stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 border-t border-[var(--calc-border)]">
          <div className="p-5 border-r border-[var(--calc-border)] text-center">
            <p className="font-serif text-xl font-bold text-[#D94F3D] mb-1 leading-none">
              {results.receptionCostYear.toLocaleString("pl-PL")} zł
            </p>
            <p className="text-[0.67rem] text-[var(--calc-muted)] leading-snug">
              koszt etatu<br />recepcji / rok
            </p>
          </div>
          <div className="p-5 md:border-r border-[var(--calc-border)] text-center">
            <p className="font-serif text-xl font-bold text-[#D94F3D] mb-1 leading-none">
              {results.noshowLossYear.toLocaleString("pl-PL")} zł
            </p>
            <p className="text-[0.67rem] text-[var(--calc-muted)] leading-snug">
              utracone przychody<br />z no-shows / rok
            </p>
          </div>
          <div className="p-5 text-center col-span-2 md:col-span-1 border-t md:border-t-0 border-[var(--calc-border)]">
            <p className="font-serif text-xl font-bold text-[#6a9e6a] mb-1 leading-none">
              ~{results.beautyCost.toLocaleString("pl-PL")} zł
            </p>
            <p className="text-[0.67rem] text-[var(--calc-muted)] leading-snug">
              tyle rocznie kosztuje<br />odzyskanie pieniędzy
            </p>
          </div>
        </div>

        {/* Bars */}
        <div className="p-6 md:px-10 bg-[var(--calc-surface2)] border-t border-[var(--calc-border)]">
          <p className="text-[0.66rem] tracking-[0.1em] uppercase text-[var(--calc-muted)] mb-4">
            Porównanie roczne — recepcja vs Beauty Funnels AI
          </p>
          <BarRow label="Koszt etatu" value={results.receptionCostYear} maxVal={maxBarVal} type="loss" />
          <BarRow label="No-shows / rok" value={results.noshowLossYear} maxVal={maxBarVal} type="loss" />
          <BarRow label="Koszt Beauty AI" value={results.beautyCost} maxVal={maxBarVal} type="ai" />
        </div>
      </motion.div>

      {/* Mid copy */}
      <motion.div className="text-center py-10 px-6" {...fadeIn}>
        <h2 className="font-serif text-[clamp(1.5rem,4vw,2.1rem)] leading-[1.25] text-[#2c2420] mb-4 font-light">
          To nie są oszczędności.<br />
          To Twoje pieniądze —<br />
          które już{" "}
          <em className="italic bg-gradient-to-r from-[#c8956b] to-[#b5737a] bg-clip-text text-transparent font-normal">
            na Ciebie czekają.
          </em>
        </h2>
        <p className="text-[var(--calc-muted)] text-[0.92rem] leading-relaxed max-w-[480px] mx-auto">
          Koniec z no-shows z powodu braku czasu na potwierdzenia telefoniczne.
          Koniec z etatem który kosztuje Cię tysiące miesięcznie za zadania
          które AI robi lepiej, szybciej i bez urlopu.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="bg-[var(--calc-surface)] border border-[var(--calc-border)] rounded-[20px] p-6 md:p-9 text-center relative overflow-hidden"
        style={{ boxShadow: "0 4px 20px rgba(180,150,120,0.08)" }}
        {...fadeIn}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#c8956b] to-[#b5737a]" />
        <p className="text-[var(--calc-muted)] text-[0.88rem] leading-relaxed max-w-[420px] mx-auto mb-6">
          Beauty Funnels AI dzwoni do każdej klientki automatycznie —
          zaraz po rezerwacji i dzień przed wizytą.
          Bez Twojego udziału. Bez głuchych telefonów. Bez no-shows.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-white rounded-full px-9 py-4 font-medium text-[0.95rem] hover:opacity-90 hover:-translate-y-0.5 transition-all"
          style={{
            background: "linear-gradient(135deg, #c8956b, #b5737a)",
            boxShadow: "0 8px 30px rgba(181,115,122,0.22)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Chcę odzyskać te pieniądze →
        </button>
      </motion.div>

      {/* Footnote */}
      <p className="text-center text-[0.65rem] text-[rgba(44,36,32,0.22)] mt-6 leading-relaxed">
        Koszt etatu = stawka × 160h × liczba pracowników × 12 miesięcy.
        <br />
        Koszt AI obliczony na podstawie rzeczywistych stawek Retell AI + Twilio dla Polski (~0,74 zł/min).
        <br />
        Redukcja no-shows 40% na podstawie danych z wdrożeń Beauty Funnels. Wyniki są szacunkowe.
      </p>
    </section>
  );
};

export default SavingsCalculator;

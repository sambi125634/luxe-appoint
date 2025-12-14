import { Check, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const comparisonData = [
  { feature: "AI Smart Scheduling", bc: true, booksy: false, fresha: false, versum: false, highlight: false },
  { feature: "Scoring ryzyka klientów", bc: true, booksy: false, fresha: false, versum: false, highlight: false },
  { feature: "Prognoza przychodów", bc: true, booksy: false, fresha: "partial", versum: "partial", highlight: false },
  { feature: "Prowizja od rezerwacji", bc: "0 zł", booksy: "2-5 zł", fresha: "2-3 zł", versum: "1-2 zł", highlight: true },
  { feature: "Przedpłaty online (BLIK)", bc: true, booksy: "partial", fresha: true, versum: "partial", highlight: false },
  { feature: "Support po polsku 24/7", bc: true, booksy: "partial", fresha: "partial", versum: true, highlight: false },
  { feature: "Cena miesięczna", bc: "od 49 zł", booksy: "od 99 zł", fresha: "od 79 zł", versum: "od 149 zł", highlight: false },
];

const StatusIcon = ({ status, isHighlight }: { status: boolean | string; isHighlight?: boolean }) => {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-600" />
      </div>
    );
  }
  if (status === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
        <X className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
    );
  }
  return (
    <span className={cn(
      "text-sm font-medium",
      isHighlight && "text-rose-600 font-bold"
    )}>
      {status}
    </span>
  );
};

export const ComparisonSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/20">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Beauty Calendar vs.{" "}
            <span className="text-gradient-luxury">Konkurencja</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Porównaj sam/sama i podejmij świadomą decyzję
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold">Funkcja</th>
                <th className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <Badge className="mb-2 bg-primary text-primary-foreground">
                      Najlepsza wartość
                    </Badge>
                    <span className="font-bold text-lg text-primary">Beauty Calendar</span>
                  </div>
                </th>
                <th className="py-4 px-4 text-center font-semibold text-muted-foreground">Booksy</th>
                <th className="py-4 px-4 text-center font-semibold text-muted-foreground">Fresha</th>
                <th className="py-4 px-4 text-center font-semibold text-muted-foreground">Versum</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr 
                  key={index}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/30",
                    index % 2 === 0 && "bg-muted/10",
                    row.highlight && "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20"
                  )}
                >
                  <td className={cn(
                    "py-4 px-4 font-medium",
                    row.highlight && "text-rose-600 font-bold"
                  )}>
                    {row.feature}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.bc} isHighlight={row.highlight} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.booksy} isHighlight={row.highlight} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.fresha} isHighlight={row.highlight} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.versum} isHighlight={row.highlight} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <span>Pełna funkcjonalność</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            </div>
            <span>Ograniczona</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
              <X className="w-3 h-3 text-rose-600" />
            </div>
            <span>Brak</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-emerald-500/10 rounded-2xl border border-primary/20">
          <p className="text-xl font-semibold">
            💡 <span className="text-primary font-bold">Oszczędź nawet 15,000 zł rocznie</span> (na prowizjach i no-show) i zyskaj funkcje AI w cenie
          </p>
        </div>
      </div>
    </section>
  );
};

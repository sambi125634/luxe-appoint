import { Check, X, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const comparisonData = [
  { feature: "Prowizja od rezerwacji", bc: "0%", booksy: "25-45%", noSystem: "—", highlight: true },
  { feature: "Roczny koszt (śr. salon)", bc: "1 788 zł", booksy: "36 000–81 000 zł", noSystem: "0 zł (+ chaos)", highlight: true },
  { feature: "Własność danych klientów", bc: true, booksy: false, noSystem: true, highlight: false },
  { feature: "AI (12 funkcji)", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Skaner magazynowy (aparat)", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "CRM z historią i tagami", bc: true, booksy: "partial", noSystem: false, highlight: false },
  { feature: "True Profit per zabieg", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "SMS + email automatyzacja", bc: true, booksy: "partial", noSystem: false, highlight: false },
  { feature: "Własna domena rezerwacji", bc: true, booksy: false, noSystem: false, highlight: false },
  { feature: "Multi-lokalizacja", bc: true, booksy: true, noSystem: false, highlight: false },
  { feature: "White-label", bc: true, booksy: false, noSystem: false, highlight: false },
];

const StatusIcon = ({ status, isHighlight, isBc }: { status: boolean | string; isHighlight?: boolean; isBc?: boolean }) => {
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
      isHighlight && isBc && "text-emerald-600 font-bold",
      isHighlight && !isBc && "text-rose-600 font-bold"
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
            163 funkcje. 0% prowizji.{" "}
            <span className="text-gradient-luxury">1 platforma.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Porównaj fakty — nie opinie.
          </p>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                <th className="py-4 px-4 text-center font-semibold text-muted-foreground">Brak systemu</th>
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
                      <StatusIcon status={row.bc} isHighlight={row.highlight} isBc={true} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.booksy} isHighlight={row.highlight} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <StatusIcon status={row.noSystem} isHighlight={row.highlight} />
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

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Dane porównawcze oparte na publicznie dostępnych cennikach i regulaminach konkurencji (stan na 2026).
        </p>
      </div>
    </section>
  );
};
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    title: "1. Postanowienia ogólne",
    body: "Niniejszy regulamin określa zasady korzystania z aplikacji Beauty Calendar, która umożliwia rezerwację wizyt w salonach beauty, zarządzanie wizytami oraz uczestnictwo w programach lojalnościowych. Korzystanie z aplikacji oznacza akceptację niniejszego regulaminu.",
  },
  {
    title: "2. Zasady korzystania",
    body: "Każdy użytkownik zakłada konto osobiste, które nie może być udostępniane osobom trzecim. Użytkownik zobowiązuje się do podania prawdziwych danych osobowych podczas rejestracji. Zabrania się wykorzystywania aplikacji w celach niezgodnych z prawem lub naruszających prawa osób trzecich.",
  },
  {
    title: "3. Rezerwacje i anulowania",
    body: "Warunki rezerwacji, anulowania i zmiany terminu wizyt są ustalane indywidualnie przez każdy salon. Minimalne wyprzedzenie anulowania lub zmiany terminu jest określone w ustawieniach salonu. Salon może wymagać wpłaty depozytu przy rezerwacji. Szczegółowe zasady anulacji są widoczne na profilu salonu.",
  },
  {
    title: "4. Program lojalnościowy",
    body: "Salony mogą oferować programy lojalnościowe (pieczątki, punkty, kupony rabatowe) za pośrednictwem aplikacji. Warunki programów ustalane są przez poszczególne salony. Beauty Calendar nie ponosi odpowiedzialności za realizację przyznanych nagród.",
  },
  {
    title: "5. Odpowiedzialność",
    body: "Beauty Calendar jest platformą pośredniczącą pomiędzy klientami a salonami. Nie ponosimy odpowiedzialności za jakość usług świadczonych przez salony, terminowość realizacji wizyt ani za szkody powstałe w wyniku korzystania z usług salonów. Reklamacje dotyczące usług należy kierować bezpośrednio do salonu.",
  },
  {
    title: "6. Powiadomienia",
    body: "Aplikacja może wysyłać powiadomienia push, e-mail i SMS dotyczące wizyt, promocji i aktualizacji. Użytkownik może w każdej chwili wyłączyć powiadomienia w ustawieniach profilu.",
  },
  {
    title: "7. Zmiany regulaminu",
    body: "Zastrzegamy sobie prawo do zmiany niniejszego regulaminu. O zmianach poinformujemy użytkowników za pośrednictwem aplikacji lub wiadomości e-mail z co najmniej 14-dniowym wyprzedzeniem. Dalsze korzystanie z aplikacji po wejściu zmian w życie oznacza ich akceptację.",
  },
  {
    title: "8. Kontakt",
    body: "W sprawach dotyczących regulaminu prosimy o kontakt: kontakt@beauty-funnels.com",
  },
];

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3 max-w-[600px] mx-auto">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Regulamin</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-[600px] mx-auto pb-24">
        <p className="text-xs text-muted-foreground mb-6">
          Ostatnia aktualizacja: 11 kwietnia 2026
        </p>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-bold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

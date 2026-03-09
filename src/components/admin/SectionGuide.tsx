import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Lightbulb, ListOrdered, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface SectionGuideConfig {
  goal: string;
  steps: string[];
  painPoint: string;
}

const guideContent: Record<string, SectionGuideConfig> = {
  home: {
    goal: "Widzisz podsumowanie dnia — ile wizyt, ile przychodów, co wymaga uwagi. Dashboard wypełnia się automatycznie danymi z kalendarza i transakcji.",
    steps: [
      "Dodaj pracowników i usługi (lista kontrolna poniżej powie Ci, co jeszcze zostało)",
      "Udostępnij link do widgetu rezerwacji klientkom",
      "Obserwuj statystyki — wizyty, przychody, no-showy",
      "Reaguj na alerty — nieobecności, niski stan magazynu",
    ],
    painPoint: "Koniec z ręcznym liczeniem wizyt i przychodów. Wszystko widzisz w jednym miejscu — nawet prognozę na kolejne dni.",
  },
  calendar: {
    goal: "Zarządzasz wizytami całego salonu w jednym miejscu — widzisz grafik każdego pracownika, dodajesz i edytujesz wizyty jednym kliknięciem.",
    steps: [
      "Upewnij się, że masz dodanych pracowników i ustawione godziny pracy",
      "Kliknij w wolny slot w kalendarzu, aby dodać wizytę",
      "Wybierz klientkę, usługę i pracownika",
      "Wizyta pojawi się w kalendarzu z kolorem przypisanym do pracownika",
      "Udostępnij widget — klientki będą rezerwować same 24/7",
    ],
    painPoint: "Koniec z papierowymi kalendarzami i chaosem przy telefonie podczas zabiegu. Klientki rezerwują same, nawet o 23:00.",
  },
  clients: {
    goal: "Masz pełną bazę klientek z historią wizyt, notatkami i tagami. Profile tworzą się automatycznie przy rezerwacji online.",
    steps: [
      "Dodaj klientki ręcznie lub zaimportuj z pliku CSV",
      "Możesz też poczekać — profil powstanie automatycznie przy pierwszej rezerwacji online",
      "Dodawaj tagi (VIP, stała klientka) i notatki (alergie, preferencje)",
      "Filtruj klientki po tagach, kategoriach zakupowych lub czasie od ostatniej wizyty",
    ],
    painPoint: "Koniec z karteczkami i zeszytami. Każda klientka ma pełen profil — wiesz kto jest VIP, kto dawno nie była i do kogo warto zadzwonić.",
  },
  services: {
    goal: "Twój cennik online. Usługi, kategorie, ceny i czas trwania — to wszystko widzą klientki w widgecie rezerwacji.",
    steps: [
      "Utwórz kategorie usług (np. Twarz, Paznokcie, Ciało)",
      "Dodaj usługi z ceną, czasem trwania i opisem",
      "Przypisz pracowników do usług — każdy wykonuje inne zabiegi",
      "Opcjonalnie: dodaj zdjęcia efektów lub import z CSV",
    ],
    painPoint: "Bez usług klientki nie mogą rezerwować online. Dodaj je raz — cennik aktualizujesz w jednym miejscu, a widget odświeża się automatycznie.",
  },
  staff: {
    goal: "Dodaj członków zespołu (lub siebie), przypisz usługi i ustaw godziny pracy. Bez pracowników kalendarz nie pokaże wolnych slotów.",
    steps: [
      "Kliknij 'Dodaj pracownika' — nawet jeśli pracujesz sama, dodaj siebie",
      "Wpisz imię, stanowisko, email i telefon",
      "Ustaw godziny pracy dla każdego dnia tygodnia",
      "Przypisz usługi, które dany pracownik wykonuje",
      "Wybierz kolor — tak będą oznaczone wizyty w kalendarzu",
    ],
    painPoint: "Bez pracowników nic nie działa — kalendarz jest pusty, a klientki nie mogą rezerwować. To pierwszy krok do uruchomienia systemu.",
  },
  widgets: {
    goal: "Widget rezerwacji to Twój kalendarz online. Wklej go na stronę www lub udostępnij link — klientki rezerwują 24/7.",
    steps: [
      "Skopiuj link do widgetu i udostępnij na Facebooku / Instagramie",
      "Pobierz kod embed i wklej na swoją stronę www",
      "Stwórz widget promocyjny z rabatem na pierwszą wizytę",
      "Śledź statystyki — ile osób odwiedziło widget i ile zarezerwowało",
    ],
    painPoint: "Klientki rezerwują nawet o 23:00, kiedy Ty odpoczywasz. Żadnych telefonów w trakcie zabiegu — system robi to za Ciebie.",
  },
  timeOff: {
    goal: "Zarządzaj urlopami, chorobowymi i szkoleniami zespołu. Nieobecności automatycznie blokują sloty w kalendarzu rezerwacji.",
    steps: [
      "Kliknij 'Dodaj nieobecność'",
      "Wybierz pracownika, typ (urlop, chorobowe, szkolenie) i daty",
      "Dodaj opcjonalną notatkę",
      "Sloty w kalendarzu zablokują się automatycznie — klientki nie zarezerwują w tym czasie",
    ],
    painPoint: "Koniec z ręcznym blokowanie slotów, gdy ktoś jest na urlopie. Dodaj nieobecność raz — reszta dzieje się sama.",
  },
  stats: {
    goal: "Przychody, obłożenie, top usługi, top pracownicy, no-showy — wszystko w jednym miejscu z wykresami i eksportem do CSV.",
    steps: [
      "Wybierz okres: dzienny, tygodniowy lub miesięczny",
      "Analizuj wykresy przychodów i obłożenia",
      "Sprawdź, które usługi i pracownicy generują najwięcej",
      "Eksportuj dane do CSV dla księgowej lub do własnych analiz",
    ],
    painPoint: "Nie musisz już liczyć w Excelu. Widzisz trendy, porównujesz miesiące i podejmujesz decyzje na podstawie danych, nie przeczuć.",
  },
  settings: {
    goal: "Skonfiguruj profil salonu, powiadomienia dla klientek, reguły rezerwacji i integracje z zewnętrznymi narzędziami.",
    steps: [
      "Uzupełnij profil salonu — nazwa, adres, logo, kolory brandingowe",
      "Skonfiguruj powiadomienia SMS/email (potwierdzenie, przypomnienie)",
      "Ustaw reguły rezerwacji — minimalne wyprzedzenie, anulowanie",
      "Podepnij integracje — Google Calendar, bramki płatnicze",
    ],
    painPoint: "Twoje logo i kolory wyświetlają się w widgecie rezerwacji. Profesjonalny wygląd = większe zaufanie klientek.",
  },
  conversations: {
    goal: "Wszystkie rozmowy z klientkami — SMS, email, WhatsApp — w jednym miejscu. Nie przeskakujesz między aplikacjami.",
    steps: [
      "Skonfiguruj integrację komunikacyjną w Ustawieniach → Integracje",
      "Wiadomości od klientek pojawią się automatycznie na liście",
      "Odpowiadaj bezpośrednio z panelu — SMS, email lub WhatsApp",
      "Filtruj kontakty po tagach i historii wiadomości",
    ],
    painPoint: "Koniec z szukaniem SMS-ów i emaili w różnych aplikacjach. Jeden widok = wszystkie rozmowy z każdą klientką.",
  },
  pipeline: {
    goal: "Śledzisz ścieżkę klientki od pierwszego kontaktu do zakończenia pakietu zabiegów. Widzisz kto wymaga uwagi.",
    steps: [
      "Klientki automatycznie przechodzą przez etapy: rezerwacja → 1. wizyta → kolejne wizyty → zakończenie",
      "Przeciągaj karty między kolumnami, aby ręcznie zmienić etap",
      "Kliknij w kartę, aby zobaczyć pełną historię klientki",
      "Zwracaj uwagę na kolumnę 'Nie pojawiła się' — to klientki wymagające reakcji",
    ],
    painPoint: "Widzisz ile klientek 'utknęło' po pierwszej wizycie. Możesz do nich zadzwonić zanim odejdą do konkurencji.",
  },
  accounting: {
    goal: "Raporty finansowe generują się automatycznie: dzienny raport kasowy, VAT, prowizje pracowników, eksport dla księgowej.",
    steps: [
      "Wybierz zakres dat i przeglądaj raporty",
      "Sprawdź dzienny raport kasowy — podliczenie gotówki, karty, online",
      "Generuj raport VAT do rozliczeń z US",
      "Eksportuj dane do CSV/PDF i wyślij księgowej",
    ],
    painPoint: "Koniec z ręcznym podliczaniem utargu. Zamykasz salon, sprawdzasz raport dzienny — wszystko się zgadza.",
  },
  products: {
    goal: "Zarządzasz produktami do sprzedaży detalicznej w salonie — katalog, stany magazynowe, dostawy i raporty sprzedaży.",
    steps: [
      "Dodaj produkty w zakładce Katalog — nazwa, cena, kod EAN, dostawca",
      "Kontroluj stany magazynowe — system ostrzega gdy produkt się kończy",
      "Rejestruj dostawy od dostawców z cenami zakupu",
      "Przeglądaj raporty sprzedaży i marże",
    ],
    painPoint: "Wiesz ile produktów zostało na półce i kiedy zamówić kolejną dostawę. Żadnych niespodzianek przy inwentaryzacji.",
  },
  support: {
    goal: "AI Asystent zna całą platformę Beauty Calendar. Zapytaj o cokolwiek — konfigurację, funkcje, rozwiązanie problemu.",
    steps: [
      "Wpisz pytanie w czacie — po polsku, swoimi słowami",
      "Użyj szybkich akcji, aby zadać typowe pytanie jednym kliknięciem",
      "Asystent odpowie natychmiast z konkretnymi instrukcjami",
      "Jeśli potrzebujesz ludzkiej pomocy — napisz na support@beautyfunnel.pl",
    ],
    painPoint: "Nie musisz szukać w dokumentacji. Pytasz, dostajesz odpowiedź od razu — jak rozmowa z ekspertem, który zna cały system.",
  },
};

interface SectionGuideProps {
  sectionKey: string;
  className?: string;
}

export function SectionGuide({ sectionKey, className }: SectionGuideProps) {
  const storageKey = `section-guide-seen-${sectionKey}`;
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      setIsExpanded(true);
      localStorage.setItem(storageKey, "true");
    }
  }, [storageKey]);

  const config = guideContent[sectionKey];
  if (!config) return null;

  return (
    <div className={cn("mb-6 animate-fade-in", className)}>
      {/* Collapsed state */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors w-full text-left group"
        >
          <Lightbulb className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-primary">Pokaż poradnik</span>
          <span className="text-xs text-muted-foreground ml-1 hidden sm:inline">— co tu zrobisz i jak zacząć</span>
          <ChevronDown className="w-4 h-4 text-primary ml-auto shrink-0 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="p-5 bg-gradient-to-br from-card to-muted/20 border border-border rounded-2xl shadow-soft">
          {/* Close button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Poradnik</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Zwiń
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Goal */}
          <div className="mb-4">
            <p className="text-foreground leading-relaxed">{config.goal}</p>
          </div>

          {/* Steps */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ListOrdered className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jak to zrobić</span>
            </div>
            <ol className="space-y-1.5 ml-0.5">
              {config.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Pain point */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary/90 leading-relaxed">{config.painPoint}</p>
          </div>
        </div>
      )}
    </div>
  );
}

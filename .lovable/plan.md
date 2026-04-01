

## Plan: Generowanie DOCX — Specyfikacja Landing Page Beauty Calendar

### Co zostanie wygenerowane

Dokument DOCX (~15-20 stron) z pełną analizą każdej sekcji landing page'a, zawierający:
- Nazwę sekcji i jej pozycję w flow
- Cel konwersyjny sekcji
- Aktualny copywriting (nagłówki, opisy, CTA)
- Elementy UI/wizualne (ikony, karty, animacje, kolory)
- Dane/statystyki użyte w sekcji
- Uwagi do dopracowania

### Struktura dokumentu

**0. Nawigacja (LandingNavbar)**
- Logo: BeautyCalendar z ikoną Calendar (gold)
- Linki: Funkcje, Cennik, Demo, FAQ
- CTA: "Umów prezentację" (scroll do formularza)
- Link: "Panel klienta" → admin.beauty-funnels.com/auth
- Sticky navbar z blur na scroll, mobile hamburger menu

**1. Hero Section (NewHeroSection)**
- Badge: "Jedyny kalendarz z AI dla salonów beauty"
- H1: "Twój system rezerwacji pracuje za Ciebie 24/7. I nie bierze prowizji od Twoich klientek."
- Subheadline: AI przewiduje przychody, eliminuje no-showy, wypełnia luki — za 0% prowizji
- CTA primary: "Załóż konto za darmo"
- CTA secondary: "Zobacz demo na żywo" → /demo
- Social proof inline: "Zaufało nam już ponad 150+ salonów"
- Trust: Bez karty kredytowej | Gotowe w 5 minut | 0% prowizji — zawsze
- Tło: 3D scene + gradient overlays, framer-motion animacje

**2. Social Proof Bar**
- 4 statystyki z animowanymi licznikami: 150+ salonów, 25000+ rezerwacji/mies., 99.9% uptime, 4.9★ ocena
- Ikony: Building2, Calendar, Clock, Star

**3. Problem Section ("Znasz to?")**
- 4 karty pain points: no-show (300zł strata, 15000zł/rok), prowizja 35-45%, telefon w trakcie zabiegu, brak wiedzy o zarobkach
- Aurora background, framer-motion staggered cards

**4. Transformation Section ("A gdyby Twój kalendarz pracował za Ciebie?")**
- 4 karty rozwiązań ze statystykami: AI luki (+23%), no-show (-67%), prognoza (94%), setup (5 min)
- CTA: "Zobacz jak to działa" → /demo

**5. AI Game Changers ("5 funkcji AI, których nie ma konkurencja")**
- Tab-based UI (lewy panel: 5 tabów, prawy: szczegóły)
- Wypełniacz Luk, Radar Odejść, Prognoza Kasy, Dynamiczne Ceny, Rezerwacja z IG
- Każda z własnymi statystykami i opisami
- CTA: "Zobacz demo tej funkcji"

**6. Comparison Section ("Beauty Calendar vs. Konkurencja")**
- Tabela 7 wierszy × 5 kolumn: BC vs Booksy vs Fresha vs Versum
- Highlighted row: prowizja (BC: 0%, Booksy: 35-45% netto)
- Bottom banner: "Oszczędź nawet 15,000 zł rocznie"

**7. Features Section ("Wszystko czego potrzebujesz. Nic więcej.")**
- 8 tabów z mockupami: AI Autopilot, Kalendarz, Klienci/CRM, Usługi, Płatności, Produkty, Raporty, Widgety
- Każdy tab: 5 feature bullets + interaktywny mockup preview

**8. Interactive Demo Section**
- 2 zakładki: Widok klientki (BookingMockup) / Panel salonu (DashboardMockup)
- Browser chrome frame (macOS dots)
- CTA: "Otwórz pełne demo" → /demo

**9. Testimonials (4 opinie)**
- Marta K. (Warszawa), Karolina W. (Kraków), Agnieszka M. (Poznań), Patrycja L. (Gdańsk)
- Desktop: 3-column grid, Mobile: carousel z dots
- 5-star ratings, cytaty z konkretnymi rezultatami

**10. Audience Section ("Dla kogo jest Beauty Calendar?")**
- 4 karty: Kliniki estetyczne, Salony fryzjerskie, Salony kosmetyczne, SPA i wellness
- Każda z opisem, 3 feature tags, gradient ikona

**11. Pricing Section ("Prosty cennik. Bez niespodzianek.")**
- FREE (0 zł): 1 lokalizacja, 3 pracowników, podstawowe raporty
- PRO (99 zł, "Najpopularniejszy"): AI, prognozy, dynamiczne ceny
- VIP (497 zł setup + 199/mies.): sieci, onboarding, API, custom branding
- Bottom badge: "Prowizja od rezerwacji? 0 zł. Zawsze."

**12. Lead Form Section**
- Primary CTA: "Zacznij za darmo — bez karty kredytowej" → /auth
- Secondary: formularz kontaktowy (imię, nazwisko, email, telefon, nazwa salonu, miasto, wielkość zespołu, URL, zgoda RODO)
- Zapis do tabeli `leads` w Supabase
- Stan sukcesu z linkiem do demo

**13. FAQ Section (6 pytań)**
- Accordion z ikonami (FileText, Clock, Database, Brain, Smartphone, Headphones)
- Klucze i18n: landing.newFaq.q1-q6 / a1-a6

**14. Final CTA Section**
- Urgency badge (animowany pulse)
- H2 z gradient highlight
- CTA primary: scroll do formularza
- CTA secondary: "Zobacz demo" → /demo
- Trust indicators: bezpieczeństwo, płatności, support

**15. Footer**
- 5 kolumn: Brand + social, Produkt, Firma, Zasoby, Legal
- Social: Instagram, Facebook, LinkedIn, YouTube
- Copyright: "© 2024 Beauty Calendar by Beauty Funnels"
- Language switcher + "Made with ❤ in Poland"

### Realizacja techniczna

1. Skrypt JS z biblioteką `docx` w `/tmp/`
2. Format A4, Arial, kolory brand (#C9A96E gold), nagłówki sekcji z numeracją
3. Tabele z opisami pól, listy punktowane
4. QA wizualna (konwersja do obrazów, inspekcja)
5. Plik końcowy: `/mnt/documents/Beauty_Calendar_Landing_Page_Specyfikacja.docx`


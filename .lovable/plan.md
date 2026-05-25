
# Audyt panelu Admin — pełna parytetowość z Demo

## Cel
Realny panel admin (`/admin`) ma mieć **wszystkie funkcje** z panelu demo (`/demo`), działające na realnych danych z bazy zamiast mocków. Pakiety/gating zostawiamy na później — teraz parytet funkcjonalny.

## Stan obecny (po przejrzeniu kodu)
`AdminDashboard.tsx` i `DemoPage.tsx` renderują ten sam zestaw 17 modułów z tym samym sidebarem. Każdy moduł przyjmuje prop `isDemo`. Różnica:
- **Demo** → `isDemo={true}` → moduły czytają dane z plików `*demo-data.ts` / mocków.
- **Admin** → `isDemo` nie ustawiony → moduły mają używać hooków podpiętych do Supabase (`useSalonId`, `useClients`, `useServices`, `useStaffMembers`, `useAutopilot`, `useTrueProfit`, ...).

Ryzyko: część modułów może mieć w trybie real "puste stany" zamiast działającej logiki (formularze bez mutacji, akcje bez wywołań edge functions, panele AI bez podpięcia, brak realtime, brak walidacji konfliktów, brak importu/exportu, itd).

## Sposób pracy
**Moduł-po-module, audyt + naprawa od razu**, w jednej rundzie na moduł:
1. Otwieram moduł w kodzie + porównuję ścieżkę demo vs real.
2. Spisuję krótko: ✅ działa / ⚠️ częściowo / ❌ brak.
3. Naprawiam braki w tej samej turze (RLS + edge fn jeśli trzeba).
4. Krótki raport co zmienione, zanim ruszam do następnego.

## Kolejność modułów (wg priorytetu operacyjnego)

```text
Faza 1 — Fundament dzienny
  1. Dashboard (home)         — KPI, dzisiejsze wizyty, alerty
  2. Kalendarz (calendar)     — Day View, drag&drop, modal wizyty, konflikty
  3. Klienci (clients)        — CRM, tagi, segmentacja, import CSV
  4. Usługi (services)        — warianty, recepty, media
  5. Personel (staff)         — zaproszenia, uprawnienia, godziny pracy

Faza 2 — Lejek i rezerwacje
  6. Widgety (widgets)        — edytor, embed, social proof, analytics
  7. Konwersacje (conversations)
  8. Ścieżka Klientki (pipeline) — 11-step Kanban
  9. Konsultacje (consultation)  — szablony, wysyłka, podpisy

Faza 3 — Pieniądze i raporty
 10. Księgowość (accounting)  — True Profit, raporty miesięczne
 11. Produkty (products)      — magazyn, skaner faktur AI, ruchy

Faza 4 — Automatyzacje (USP)
 12. Retencja (retention)     — sekwencje 45/60/75/90, kolejka
 13. AI Autopilot (autopilot) — 16 funkcji, config, historia
 14. Polecenia (referral)     — kody, leaderboard, Google Reviews

Faza 5 — System
 15. Aplikacja Klientki (client-app) — branding, lojalność, deletion requests
 16. Ustawienia (settings)    — integracje, GC, P24, email, push, RODO
 17. Pomoc & AI (support)     — chatbot Gemini, ticketing
```

## Co sprawdzam w każdym module (checklist)
- **Dane**: czy hooki czytają z bazy po `salonId` (nie z mocków)
- **Mutacje**: czy CRUD wywołuje Supabase / edge function
- **RLS**: czy polityki pozwalają na operację (admin/staff)
- **Loading & empty states**: skeleton + sensowny pusty stan + CTA
- **Walidacje**: Zod / formularze przed submit
- **Realtime / refetch**: po mutacji UI się odświeża
- **Edge functions**: czy są podpięte i deployowane (logi)
- **Demo guard**: czy demo NIE łamie się gdy real moduł czyta DB

## Format raportu po module
Po każdym module dostaniesz:
- 🔍 **Audit**: co zastane, co brakowało
- 🛠️ **Fix**: pliki zmienione, migracje, edge fn
- ✅ **Verified**: jak sprawdziłem że działa (logi/DB/preview)
- ➡️ **Next**: czy ruszamy do kolejnego, czy trzeba decyzji od Ciebie

## Czego NIE robimy teraz (poza zakresem)
- Pakiety FREE/PRO/ELITE i gating (osobna faza po parytecie)
- Refaktor wizualny / kosmetyka (osobna runda po parytecie)
- Nowe funkcje nieobecne w demo
- Zmiana sidebar/nawigacji

## Start
Po Twoim "ok" zaczynam od **#1 Dashboard (home)** — otwieram `DashboardHome.tsx`, porównuję ścieżki demo vs real, raportuję i poprawiam.

# Plan: Dokumentacja platformy + propozycja sekcji Ustawienia

## Cel
Stworzyć jeden obszerny dokument `.docx` (do wgrania w Twój Cloud / ChatGPT / Claude Projects), który:
1. Wyjaśnia **całą platformę Beauty Calendar** "jak czterolatkowi" — moduł po module, zakładka po zakładce.
2. Zawiera **propozycję nowej architektury sekcji Ustawienia** — co powinno tam być, jak pogrupowane, dlaczego.

Dokument będzie zapisany jako `/mnt/documents/beauty-calendar-platform-overview.docx` i dostarczony przez `<presentation-artifact>` (gotowy do pobrania).

---

## Część 1 — Podsumowanie platformy (rozdziały)

### A. Filozofia i zamysł
- Dlaczego Beauty Calendar powstał (problemy Booksy: prowizje, kradzież klientek, brak danych)
- Dla kogo (salony beauty, kosmetyczki, barberzy, studia paznokci)
- Główne USP: zero prowizji, własne dane, AI Autopilot, True Profit, Private App Space
- Model biznesowy (FREE / PRO 149 zł / ELITE 349 zł + onboarding)

### B. Architektura użytkowników (3 warstwy)
- **Super Admin** (Ty) — zarządzanie tenantami
- **Admin Salonu** (Owner / Staff) — codzienna praca
- **Klientka** (mobile app) — rezerwacje, lojalność, polecenia

### C. Moduły admina — każdy zakładka po zakładce (jak 4-latkowi)
Dla każdego: **Co to jest? → Po co? → Jaki problem rozwiązuje? → Jak działa krok po kroku?**

1. **Dashboard** — co widzisz rano gdy otwierasz
2. **Kalendarz** (Schedule) — Day View kolumny pracowników, drag & drop, AI slot scoring
3. **Klientki** (CRM) — segmentacja VIP/Nowa/Lost, Client Journey 11 kroków, risk score
4. **Wizyty** — modal rezerwacji, conflict check, payment Przelewy24
5. **Usługi** — warianty, recipes (materiały), True Profit
6. **Magazyn** (Inventory) — stock movements, AI skaner faktur, alerty
7. **Polecenia** (Referrals) — linki /r/{code}, nagrody, leaderboard ambasadorek
8. **Opinie Google** — Silent Fans, automatyczne prośby
9. **Retencja** — sekwencje 45/60/75/90 dni, beauty rhythms
10. **Marketing** — kampanie, Instagram landing /ig/{slug}, widgety bookingowe
11. **AI Autopilot** — 16 funkcji, scoring, ostatnie akcje (TYLKO PRAWDZIWE DANE)
12. **Księgowość / True Profit** — koszty materiałów + 35 zł/h staff = realny zysk
13. **Raporty sprzedaży** — McKinsey-style premium
14. **Aplikacja klientki** (Client App) — branding, loyalty, podgląd mobilny
15. **Wsparcie AI** — chatbot Gemini 2.5 Flash
16. **Eksport danych**

### D. Aplikacja klientki (osobny rozdział)
5 tabów: Salons / Visits / For You / Activity / Profile + onboarding, polecenia, beauty rhythms, waitlist, push notifications.

### E. Integracje (jak działają i co dają)
- Google Calendar (bi-directional sync)
- Przelewy24 (płatności)
- Meta Pixel (wewnętrznie)
- Retell AI (voice agent /demo-agent)
- GoHighLevel (white-label "System/Automation")
- Booksy scraper (onboarding)
- SMS (SMSAPI), Email (Resend), Web Push (VAPID)

### F. Bezpieczeństwo i compliance
- RLS per salon_id, multi-tenant isolation
- RODO/GDPR, deletion requests 30 dni
- staff_public_view, CHECK constraints

---

## Część 2 — Propozycja nowej sekcji USTAWIENIA

Obecnie masz 7 zakładek: Profil / Rezerwacje / Powiadomienia / Komunikacja / Integracje / Automatyzacja / Eksport. Propozycja: **przeorganizować w 6 logicznych grup** które pokrywają WSZYSTKIE konfiguracje platformy w jednym miejscu, bez duplikatów z innymi modułami.

### Proponowane zakładki:

**1. Salon (Profil + Branding)**
- Dane salonu, adres, kontakt, NIP
- Logo, kolory marki, hero image
- Godziny otwarcia, dni wolne (święta)
- Slug salonu (URL bookingu)

**2. Rezerwacje (Booking Rules)**
- Slot duration, buffer time, advance booking window
- Polityka anulowania / no-show
- Conditional Prepayment (próg risk score >60)
- Widget bookingowy — wygląd, social proof
- Quick picks, AI slot scoring on/off

**3. Komunikacja (Powiadomienia + Kanały)**
- Email (templates: confirm, reminder, follow-up) + custom DNS dla ELITE
- SMS (SMSAPI nadawca, limity)
- WhatsApp (jeśli dostępne)
- Web Push (VAPID, prompts)
- Timing przypomnień (24h, 2h)

**4. Zespół i Uprawnienia (NOWE — wyciągnięte z osobnych miejsc)**
- Lista pracowników, role (Owner / Staff)
- Uprawnienia per moduł (staff_permissions)
- Stawki godzinowe (do True Profit, domyślnie 35 zł/h)
- Invite link (send-staff-invitation)

**5. Płatności i Finanse**
- Przelewy24 — konfiguracja merchant_id
- Stripe (opcjonalnie)
- Waluta, VAT, format faktur
- Eksport JPK / księgowość

**6. Integracje i Automatyzacja**
- Google Calendar (sync on/off, dwukierunkowość)
- Meta Pixel ID (jeśli wystawiamy w UI)
- AI Autopilot — 16 toggle (przeniesione z dedykowanego modułu? lub link)
- Webhooks (advanced)
- Eksport danych (CSV, JPK)

**7. Prawne i Konto (NOWE)**
- Regulamin świadczenia usług (edytor + publish do /terms)
- Polityka prywatności (edytor + /privacy)
- Cookies policy + banner config
- RODO — wnioski o usunięcie (lista deletion_requests)
- Subskrypcja (FREE/PRO/ELITE — upgrade, faktury, anulowanie)
- Strefa niebezpieczna (usuń salon)

### Zasady projektowe sekcji:
- **Każda zmiana = save z toast** (sonner), brak "ukrytych" form
- **Defaults sensowne** — nowy salon działa bez konfigurowania niczego
- **Tooltips "?"** przy każdej opcji — wyjaśnienie po polsku
- **Sekcje "Tylko PRO/ELITE"** wyszarzone z CTA upgrade
- **Wyszukiwarka ustawień** (Ctrl+K) — kluczowa przy 6 zakładkach × 10 opcji
- **Mobile-friendly** — accordion zamiast tabs na <768px

---

## Deliverable
Po zatwierdzeniu planu wygeneruję:
- `beauty-calendar-platform-overview.docx` (~30–50 stron, polski, Plus Jakarta Sans, struktura nagłówków H1/H2/H3, spis treści)
- Dostarczę przez `<presentation-artifact>` do pobrania
- QA: konwersja do PDF i podgląd każdej strony zanim oddam

**Nie będę zmieniał kodu** — to czysta dokumentacja + propozycja architektury. Implementację nowej sekcji Ustawienia zrobimy w osobnym kroku po Twojej akceptacji proponowanej struktury.

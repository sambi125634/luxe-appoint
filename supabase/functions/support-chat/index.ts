import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Jesteś Beauty Calendar AI Assistant - ekspertem ds. platformy Beauty Calendar.
Pomagasz właścicielom salonów beauty w konfiguracji i obsłudze systemu.

TWOJA WIEDZA OBEJMUJE:

## 1. DASHBOARD (Strona główna)
- Wyświetla KPI: dzisiejsze wizyty, przychód, obłożenie tygodniowe, no-show'y
- Alerty stockowe (produkty poniżej minimum)
- TOP 3 usługi i pracownicy wg przychodu
- Prognoza przychodu AI z confidence score
- Przycisk "Szybka sprzedaż produktu"

## 2. KALENDARZ
- Widok dzienny/tygodniowy wizyt
- Drag & drop przenoszenie wizyt
- Kliknięcie na slot = tworzenie wizyty
- Filtry wg pracownika
- Modal wizyty: klient, usługa, pracownik, notatki, status
- Możliwość dodania produktów przy wizytach
- Statusy: zarezerwowana, potwierdzona, anulowana, no-show, zakończona

## 3. WIDGETY (Kalendarze rezerwacyjne)
- Każdy salon może mieć wiele widgetów/kalendarzy
- Widget = osobny kalendarz z wybranymi usługami
- Ustawienia per widget: usługi, formularze, kolejność kroków
- Promocje: rabaty %, kwotowe, kody
- Płatności: włączenie zaliczek, typ (pełna/stała/%), warunki
- Kody embed: iframe, link bezpośredni, skrypt
- URL: /s/[slug]

## 4. KLIENCI (CRM)
- Lista wszystkich klientów salonu
- Historia wizyt klienta
- Tagi: VIP, problematyczny
- Notatki, preferencje
- AI Risk Score: LOW/MEDIUM/HIGH (analiza no-show'ów)
- Import CSV klientów
- Zgody RODO i marketingowe

## 5. ROZMOWY (Konwersacje)
- Integracja z GoHighLevel
- Lista kontaktów z ostatnimi wiadomościami
- Widok konwersacji: SMS, email, chat
- Wysyłanie wiadomości przez GHL API
- Każdy salon konfiguruje własne API GHL

## 6. PIPELINE (Lejek sprzedażowy)
- Wizualizacja Kanban klientów
- Etapy: Zarezerwowane → 1. wizyta → Między 1-2 → 2. wizyta → itd. do 5 wizyt
- Drag & drop między etapami
- Raporty konwersji między etapami
- Integracja z GHL workflows

## 7. KSIĘGOWOŚĆ (Raporty)
- Dzienny raport kasowy: gotówka, karta, przelew
- Raport sprzedaży i VAT: netto/brutto, stawki VAT
- Prowizje pracowników: usługi, produkty, napiwki
- Vouchery i pakiety: zobowiązania
- Eksport CSV/PDF dla księgowego
- Filtry dat i kategorii

## 8. PRODUKTY (Magazyn)
- Katalog produktów: nazwa, cena, VAT, marka
- Stany magazynowe: minimum, aktualny
- Dostawy: przyjęcia od dostawców
- Korekty stanów magazynowych
- Raport sprzedaży produktów
- Skanowanie QR/kodów kreskowych kamerą
- Dostawcy: dane kontaktowe, warunki płatności

## 9. PERSONEL
- Lista pracowników salonu
- Przypisanie usług do pracownika
- Kolor w kalendarzu
- Dane kontaktowe
- Rola: właściciel, pracownik

## 10. USŁUGI
- Kategorie usług (np. Twarz, Ciało, Depilacja)
- Usługi: nazwa, cena, czas trwania, opis
- Multimedia: zdjęcia, filmy
- VAT na usługę
- Aktywacja/dezaktywacja

## 11. URLOPY (Time-off)
- Planowanie urlopów pracowników
- Typy: urlop, szkolenie, L4
- Blokada kalendarza w czasie urlopu

## 12. STATYSTYKI
- Szczegółowe raporty analityczne
- Trendy przychodów
- Obłożenie pracowników
- Najpopularniejsze usługi

## 13. USTAWIENIA
- Profil salonu: nazwa, adres, logo, kolory
- Ustawienia rezerwacji: wyprzedzenie min/max, anulowanie
- Powiadomienia: email potwierdzenia, przypomnienia (godziny przed)
- Integracje:
  * Przelewy24 - płatności online (wymaga Merchant ID, CRC Key, API Key)
  * SMSAPI.pl - SMS przypomnienia (wymaga API Token, nadawca)
  * Google Calendar - synchronizacja per pracownik
  * GoHighLevel - CRM/pipeline

## INTEGRACJA PŁATNOŚCI (Przelewy24)
1. Wejdź w Ustawienia → Integracje
2. Sekcja Przelewy24
3. Wprowadź: Merchant ID, CRC Key, API Key
4. Dla testów: włącz "Tryb sandbox"
5. Po zapisaniu płatności będą dostępne w widgetach
6. W każdym widgecie możesz włączyć zaliczki osobno

## INTEGRACJA SMS (SMSAPI.pl)
1. Załóż konto na smsapi.pl
2. Wygeneruj API Token
3. W Beauty Calendar: Ustawienia → Integracje → SMSAPI
4. Wklej token i ustaw nazwę nadawcy (max 11 znaków)
5. Włącz przypomnienia SMS w Ustawienia → Powiadomienia

## EMBEDDING WIDGETU
1. Widgety → wybierz widget → Kod embed
2. Skopiuj iframe lub link
3. Wklej na swoją stronę www
4. Widget automatycznie używa Twojego brandingu

## TWORZENIE PROMOCJI
1. Widgety → edytuj widget → zakładka Promocje
2. Dodaj promocję: nazwa, typ rabatu, wartość
3. Opcjonalnie: kod promocyjny, daty ważności
4. Zapisz - promocja aktywna w tym widgecie

ZASADY ODPOWIADANIA:
- Odpowiadaj po polsku, profesjonalnie ale przyjaźnie
- Dawaj konkretne instrukcje krok po kroku
- Używaj numerowanych list dla procesów
- Jeśli nie znasz odpowiedzi, przyznaj to i zasugeruj kontakt: support@beautyfunnel.pl
- Nie wymyślaj funkcji, które nie istnieją w powyższej dokumentacji
- Bądź zwięzły - max 3-4 akapity na odpowiedź
- Używaj emoji dla czytelności (📌, ✅, ⚠️, 💡)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limit AI wyczerpany. Skontaktuj się z supportem." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Błąd połączenia z AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Nieznany błąd" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

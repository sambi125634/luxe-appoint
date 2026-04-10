

## Plan: Aktualizacja CTA i trust indicators w Hero

### Plik: `src/components/landing/NewHeroSection.tsx`

**4 zmiany:**

1. **Primary CTA** — tekst z „Wypróbuj 14 dni za darmo" → **„Wypróbuj bez żadnego ryzyka"**

2. **Secondary CTA** — `onClick` z `scrollToDemo` → `() => window.location.href = '/demo'`

3. **Zielony badge** — zamiana „Zaufało nam już ponad 150+ salonów w całej Polsce" → **„Platforma stworzona w Polsce 🇵🇱"** (flaga zamiast zielonej kropki, border i tło zostają)

4. **Trust indicators** — zamiana trzech checkpointów:
   - ~~Bez karty kredytowej~~ → **Pełna gwarancja satysfakcji**
   - ~~Gotowe w 5 minut~~ → **Dane zawsze Twoje**
   - ~~0% prowizji — zawsze~~ → **0% prowizji — zawsze** (zostaje bez zmian)

### Efekt końcowy (mobile):
```text
[badge: ✨ Zarabiaj więcej...]

Więcej wizyt. Więcej powrotów.
Zero prowizji.

Jedyna platforma beauty z AI...

[Wypróbuj bez żadnego ryzyka →]
[▶ Zobacz demo na żywo        ]

🇵🇱 Platforma stworzona w Polsce

✓ Pełna gwarancja satysfakcji
✓ Dane zawsze Twoje
✓ 0% prowizji — zawsze
```


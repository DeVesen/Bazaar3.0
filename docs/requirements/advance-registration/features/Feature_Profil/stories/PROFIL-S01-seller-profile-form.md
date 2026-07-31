---
id: PROFIL-S01
status: draft
depends-on: []
---

# Story: Steckbrief-Formular (Profil)

## Ziel
Ein Verkäufer kann seine Stammdaten im Steckbrief einsehen und bearbeiten, wobei Type, Gebühr und Provision als schreibgeschützte Felder angezeigt werden.

## Kontext
Die Profil-Seite ist der zentrale Ort, an dem ein Verkäufer seine persönlichen Daten und Kontaktinformationen pflegt. Konditionen (Type, Gebühr, Provision) werden vom Admin vergeben und dürfen vom Verkäufer nicht verändert werden.

## UI-Spezifikation

Steckbrief ist Tab 1 der Profil-Seite. Das Formular besteht aus drei Panel-Blöcken (bg `#f5f9f6`, border 1 px `#d4e8dc`, radius 8 px, padding 15 px 16 px; Titel 11 px · 700 · uppercase · `#3a7057`).

```
┌────────────────────────────────────┐
│ PERSONENDATEN                      │
├────────────────────────────────────┤
│ [Vorname *   50%] [Nachname * 50%] │
│ [Anschrift              100%     ] │
│ [PLZ         50%] [Ort       50%] │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ KONTAKT                            │
├────────────────────────────────────┤
│ [Telefon     50%] [E-Mail  50% 🔒] │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ KONDITIONEN                        │
├────────────────────────────────────┤
│ [Verkäufer-Type  100%        🔒  ] │
│ [Gebühr je Stk. 50% 🔒][Prov. 🔒] │
└────────────────────────────────────┘

         [ Speichern ]   ← primär
```

**Schreibschutz-Hinweise:**
- `🔒` = `disabled` / `readonly`-Styling (PrimeNG `pInputText [disabled]="true"`)
- **E-Mail:** schreibgeschützt im Steckbrief — Änderung nur über Tab „Zugangsdaten" (AC-4)
- **Verkäufer-Type, Gebühr je Stück, Provision:** schreibgeschützt für Verkäufer — nur Admin kann diese Felder ändern (AC-5)
- Alle read-only-Felder zeigen ihren Wert; visuell abgesetzt (gedimmt), kein Fokus möglich

**PrimeNG-Komponenten:**
- Text-Felder: `pInputText`
- Zahlen (Gebühr, Provision): `p-inputnumber` locale DE, `minFractionDigits="2"` — `[readonly]="true"`
- Verkäufer-Type: `p-select` — `[disabled]="true"`
- E-Mail: `pInputText [readonly]="true"`
- Speichern-Button: `p-button severity="primary"`

## Akzeptanzkriterien

- [ ] **AC-1** — WHEN Tab „Steckbrief" geöffnet wird, THEN SHALL das System die aktuellen Stammdaten des eingeloggten Verkäufers in den drei Panels (Personendaten, Kontakt, Konditionen) vorladen.
- [ ] **AC-2** — WHEN der Verkäufer geänderte Daten speichert, THEN SHALL das System die Änderungen persistieren und einen Toast „✓ Profil gespeichert" anzeigen.
- [ ] **AC-3** — IF ein Pflichtfeld (Vorname, Nachname, E-Mail) beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unterhalb des Feldes anzeigen und nicht speichern.
- [ ] **AC-4** — WHILE der Verkäufer im Steckbrief ist, SHALL das System das E-Mail-Feld als read-only rendern und einen Hinweis „Änderung unter Zugangsdaten" anzeigen.
- [ ] **AC-5** — WHILE die Felder Verkäufer-Type, Gebühr je Stück und Provision angezeigt werden, SHALL das System diese als read-only rendern, sodass kein Eingabefokus möglich ist.
- [ ] **AC-6** — IF das Speichern fehlschlägt, THEN SHALL das System die eingegebenen Werte erhalten und „Profil konnte nicht gespeichert werden" in einer Error-InfoArea anzeigen.

## Tags & Piles
**Tags:** #profil #formular #steckbrief #verkäufer #read-only #konditionen

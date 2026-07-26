# Feature: Artikel

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Artikel

---

## Überblick

Übersicht aller Artikel aller Verkäufer. Kein „+ Neu"-Button — Artikel werden ausschließlich über die Artikelannahme angelegt.

---

## 1. Filter-Panel

2-zeiliges Panel:

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche (Bezeichnung, Nummer) — volle Breite |
| 2 | Marken-Dropdown · Kategorien-Dropdown · Verkauf-Status-Dropdown · Artikel-Status-Dropdown |

Zeile 2: **4-Spalten-Grid** (je 25 % Breite), bricht bei schmalen Viewports auf 2 bzw. 1 Spalte um. Gap 10 px.

**Aktive Filter** als `p-chip`-Tags unterhalb des Panels (mit × zum Entfernen).

---

## 2. Tabelle

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Status · **Verkäufer** (Multi-Sort per Shift+Klick).

**Kein „+ Neu"-Button** — Artikel werden ausschließlich über die Artikelannahme angelegt.

**Edit-Button** pro Zeile → öffnet Artikel-Bearbeiten-Dialog.
- Artikelnummer: oben, read-only
- **Löschen-Button** im Footer (links, `danger`), neben Abbrechen + Speichern

---

## 3. Filterbereich (vollständig)

| Filter | Vorhanden |
|---|---|
| Marke | ✅ |
| Kategorie | ✅ |
| Freitext (Nummer, Bezeichnung, Kategorie, Marke, Verkäufer Vor-/Nachname) | ✅ |
| Verkäufer-Status | ✅ |
| Artikelstatus | ✅ |

---

## 4. Artikelstatus-Popup

Klick auf den Artikelstatus-Badge öffnet ein Popup mit Zeitstempeln und Aktions-Buttons:

| Feld | Wert vorhanden | Wert NULL |
|---|---|---|
| Erstellt Am | Zeitstempel (read-only) | — |
| Freigegeben Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Verkauft Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Rückgegeben Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Abgerechnet Am | Zeitstempel (read-only) | — |

**Button-Stil:** `p-button [text]="true" [rounded]="true"` — kein Hintergrund, Icon + optionaler Label.

**Kaskadierungs-Regel beim Löschen:**
Wird ein früherer Zeitstempel gelöscht → alle nachfolgenden werden NULL.
Beispiel: Löschen von „Freigegeben Am" → auch „Verkauft Am" und „Rückgegeben Am" werden NULL.

**Gegenseitige Sperre:**
Ein Artikel kann nicht gleichzeitig „Verkauft" und „Rückgegeben" sein.
→ Ist `verkauftAm` gesetzt → Setzen-Button bei `rückgegebenAm` deaktiviert — und umgekehrt.

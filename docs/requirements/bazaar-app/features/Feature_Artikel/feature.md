---
id: F-BA-006
status: draft
updated: 2026-07-31
---

# Feature: Artikel

## Index
- Überblick — Artikel-Tabelle
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Spalten & Aktionen
- 3. Filterbereich — Filter vollständig
- 4. Artikelstatus-Popup — Status-Popup
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Artikel

**Ziel:** Admin sieht und verwaltet alle Artikel des laufenden Basars.

**User Story:** Als Admin möchte ich alle Artikel mit ihrem Status einsehen und verwalten, damit ich einen Überblick über den gesamten Artikelbestand habe.

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

→ Komponente: [Table](../../../../components/table/component.md)

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

## Akzeptanzkriterien

1. **AC-1** — WHEN die Artikel-Seite geöffnet wird, THEN SHALL das System alle Artikel paginiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN ein Status-Filter gesetzt wird, THEN SHALL das System die Tabelle auf Artikel mit diesem Status einschränken.
3. **AC-3** — WHEN „Edit" bei einem Artikel geklickt wird, THEN SHALL das System ein Popup mit den vorausgefüllten Artikelfeldern öffnen.
4. **AC-4** — IF ein Pflichtfeld (Bezeichnung, Preis, Kategorie, Marke) beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht speichern.
5. **AC-5** — WHEN ein Artikel gespeichert wird, THEN SHALL das System die Tabelle mit den aktualisierten Daten neu laden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #artikel #stammdaten #status #übersicht #crud

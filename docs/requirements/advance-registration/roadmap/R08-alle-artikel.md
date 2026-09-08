---
id: ROADMAP-R08
status: draft
updated: 2026-09-08
---

# R08 — Überblick für den Admin

**Voranmelde-App · Roadmap-Schritt 8 von 12**

## Worum es geht

Der Admin sieht zum ersten Mal den Registrierungsstand: alle vorab erfassten Artikel aller
Verkäufer in einer Liste, filterbar nach Verkäufer, Marke, Kategorie und Freitext — read-only.

## Umfang

- [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) vollständig
- `GET /api/articles` (Admin) mit `sellerId`, `brand`, `category`, `search`, `sort`, `page`,
  `pageSize`; jedes Item trägt den aufgelösten Verkäufer (ID, Nummer, Vor-/Nachname)
- `GET /api/articles/{id}` für das Readonly-Detail-Modal
- Filter-Panel mit Verkäufer-AutoComplete: tippt live, 400 ms Debounce, ab 2 Zeichen,
  maximal 10 Vorschläge über `GET /api/sellers?search=…&pageSize=10`
  ([`api/cross-cutting.md`](../api/cross-cutting.md) Abschnitt 4). Die übrigen Filter lösen
  wie in R04 erst über Enter oder den „Suchen"-Button aus.

## Nicht in diesem Schritt

- Bearbeiten fremder Artikel — ausdrücklich nicht vorgesehen; eigene Artikel bleiben
  ausschließlich über „Meine Artikel" pflegbar
- Filter nach Verkäufer-Status und Artikelstatus — gehören zur Haupt-App
- KPI-Kacheln und Statistiken — R10

## Setzt voraus

[R04](R04-artikelerfassung-rund.md) — es gibt genügend Artikel mehrerer Verkäufer, sonst ist
der Schritt nicht sinnvoll prüfbar. [R06](R06-verkaeuferverwaltung.md) liefert die
Verkäuferliste für das AutoComplete.

## Fertig, wenn — von Hand prüfbar

1. Als Admin „Verwaltung → Artikel" öffnen → Artikel mehrerer Verkäufer stehen in einer Liste,
   je mit Verkäufernummer und Name.
2. Im Verkäufer-Filter zwei Buchstaben tippen → nach kurzer Verzögerung erscheinen Vorschläge;
   Auswahl eines Verkäufers filtert die Liste auf dessen Artikel.
3. Freitextsuche nach einer Artikelnummer, einer Bezeichnung und einem Verkäufernamen findet
   jeweils den passenden Artikel.
4. Klick auf eine Zeile → Detail-Modal öffnet sich, alle Felder sind schreibgeschützt,
   es gibt keinen Speichern-Button.
5. Blättern und Sortieren wirken über die gesamte Treffermenge, nicht nur die sichtbare Seite.
6. Als Verkäufer angemeldet ist die Seite weder in der Sidebar sichtbar noch direkt erreichbar.

## Quellen

- [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md)
- [`api/articles.md`](../api/articles.md) · [`api/sellers.md`](../api/sellers.md) ·
  [`api/cross-cutting.md`](../api/cross-cutting.md)
- [components/artikel-readonly-modal.md](../components/artikel-readonly-modal.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #artikel #admin

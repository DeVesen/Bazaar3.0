---
id: ROADMAP-R05
status: draft
updated: 2026-09-08
---

# R05 — Stammdaten-Hoheit

**Voranmelde-App · Roadmap-Schritt 5 von 12**

## Worum es geht

Bis hierher sind Marken und Kategorien nur nebenbei entstanden — von Verkäufern, über das
AutoComplete-Popup. Jetzt bekommt der Admin die Hoheit darüber: er sieht, was währenddessen
neu angelegt wurde, räumt auf, benennt um, löscht — und pflegt die Verkäufer-Typen samt
Provision und Gebühr.

## Umfang

- [Epic_Marken](../epics/Epic_Marken/epic.md) — Tabelle mit `articleCount`, Anlegen,
  Bearbeiten, Löschen, `PUT`/`DELETE` nur für Admin
- [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) — analog
- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — Tabelle mit `sellerCount`,
  Anlegen, Bearbeiten, Löschen, Default-Typ festlegen
- Badges `✓ Original` (grün) und `Neu` (orange) nach [`spec.md`](../spec.md) §11.2
- Umbenennen zieht in alle betroffenen Artikel nach
- Löschschutz: `409`, wenn noch Artikel an einer Marke oder Kategorie hängen; `409` bei einem
  Verkäufer-Typ, der noch zugewiesen oder aktueller Default-Typ ist
- Änderung eines Verkäufer-Typs wirkt sofort auf alle zugewiesenen Verkäufer
  ([`spec.md`](../spec.md) §11.6)

## Nicht in diesem Schritt

- Verkäuferverwaltung, Einladungen, Blockverwaltung — R06
- Export der Stammdaten in die Haupt-App — R12

## Setzt voraus

[R03](R03-artikelerfassung.md) — es existieren Marken und Kategorien, die per AutoComplete
entstanden sind. Ohne sie ist der Nutzen dieses Schritts nicht prüfbar.

## Fertig, wenn — von Hand prüfbar

1. Als Admin die Markenliste öffnen → die in R03 per Popup angelegte Marke trägt das Badge
   „Neu", eine vom Admin angelegte trägt „✓ Original".
2. Diese Marke umbenennen → der Artikel aus R03 zeigt sofort den neuen Namen.
3. Versuch, eine Marke mit zugewiesenen Artikeln zu löschen → wird mit Hinweis abgelehnt.
4. Eine Marke ohne Artikel löschen → verschwindet.
5. Eine Marke mit einem bereits vorhandenen Namen anlegen (andere Groß-/Kleinschreibung) →
   wird als Duplikat abgelehnt.
6. Bei einem Verkäufer-Typ die Provision ändern → das Profil eines zugewiesenen Verkäufers
   zeigt sofort den neuen Wert.
7. Versuch, den Default-Typ oder einen zugewiesenen Typ zu löschen → wird abgelehnt.
8. Als Verkäufer angemeldet: die Stammdaten-Einträge fehlen in der Sidebar, die Routen sind
   auch direkt nicht erreichbar.

## Quellen

- [Epic_Marken](../epics/Epic_Marken/epic.md) · [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) ·
  [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md)
- [`api/master-data.md`](../api/master-data.md) · [`api/seller-types.md`](../api/seller-types.md)
- [`spec.md`](../spec.md) §4 Stammdaten-Ausnahme · §11.2 · §11.6

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #stammdaten #admin

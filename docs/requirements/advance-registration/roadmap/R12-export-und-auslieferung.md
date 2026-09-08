---
id: ROADMAP-R12
status: draft
updated: 2026-09-08
---

# R12 — Export und Auslieferung

**Voranmelde-App · Roadmap-Schritt 12 von 12**

## Worum es geht

Der Abschluss des Kreislaufs: Am Basar-Morgen zieht der Admin einen JSON-Export, den die
Haupt-App einliest. Danach wird die App auslieferungsfertig gemacht — englische Texte,
ein Durchgang über das responsive Verhalten, Deployment in die Cloud.

## Umfang

- [Epic_Export](../epics/Epic_Export/epic.md) vollständig — `GET /api/export` erzeugt die
  JSON-Datei serverseitig nach dem Schema in [`api/export.md`](../api/export.md), mit
  `Content-Disposition: attachment; filename="basar-export-YYYY-MM-DD.json"`
- Query-Parameter `includeBrands` und `includeCategories` (beide Default `false`); nicht
  angefordert bedeutet **leeres Array**, nicht fehlendes Feld
- Der Export überträgt beim Verkäufer nur den **Namen** des Typs, keine Zahlen
  ([`spec.md`](../spec.md) §11.7)
- Übersetzungen: die in R00 angelegte EN-Datei wird vollständig gefüllt, DE bleibt Referenz
- Responsive-Durchgang über **alle** Seiten gegen [`spec.md`](../spec.md) §10.1 — Desktop,
  Tablet, Mobile, inklusive Modal-Größen und Sidebar-Verhalten
- Deployment nach Azure Container Apps: ein Backend- und ein Frontend-Container, keine
  Microservices ([`spec.md`](../spec.md) §10.0.1); Demo-Hinweis der Login-Seite entfällt in
  Produktion ([`spec.md`](../spec.md) §12.5)

## Nicht in diesem Schritt

- Der Import auf Seiten der Haupt-App — eigenes Vorhaben in [`bazaar-app/`](../../bazaar-app/)
- Ein Rückkanal aus der Haupt-App; der Datenfluss ist einseitig ([`spec.md`](../spec.md) §11.1)

## Setzt voraus

Alle vorherigen Schritte — der Export bildet Verkäufer, Artikel, Typen, Marken und Kategorien
ab und ist erst sinnvoll prüfbar, wenn es davon echte Daten gibt.

## Fertig, wenn — von Hand prüfbar

1. Als Admin den Export auslösen → eine JSON-Datei mit Tagesdatum im Namen wird heruntergeladen.
2. Der Inhalt stimmt Feld für Feld mit dem Schema in [`api/export.md`](../api/export.md) überein;
   beim Verkäufer steht der Typ-**Name**, keine Provision und keine Gebühr.
3. Export ohne `includeBrands`/`includeCategories` → beide Felder sind vorhanden und leer,
   nicht abwesend; mit den Parametern sind sie gefüllt.
4. Die Artikelzahl im Export stimmt mit „Verwaltung → Artikel" überein.
5. Sprache auf Englisch umstellen → in allen Seiten stehen englische Texte, kein Schlüssel und
   kein deutscher Rest bleibt stehen.
6. Jede Seite bei 1280 px, 1024 px und 375 px durchklicken → Sidebar-, Titelleisten- und
   Modal-Verhalten entspricht §10.1.
7. Die ausgelieferte Version zeigt auf der Login-Seite keinen Demo-Hinweis.
8. Die App läuft in der Zielumgebung, Anmeldung und Artikelerfassung funktionieren dort.

## Quellen

- [Epic_Export](../epics/Epic_Export/epic.md)
- [`api/export.md`](../api/export.md)
- [components/export-panel.md](../components/export-panel.md)
- [`spec.md`](../spec.md) §10.0.1 Architektur · §10.1 Responsive Design · §11.1 · §11.7 · §12.5

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #export #deployment #i18n

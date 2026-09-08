---
id: ROADMAP-R10
status: draft
updated: 2026-09-08
---

# R10 — Dashboards

**Voranmelde-App · Roadmap-Schritt 10 von 12**

## Worum es geht

Die Startseite wird zur Startseite: Verkäufer sehen ihren Registrierungsstand — Artikelzahl,
Konditionen, eigene Verkäufernummer, Countdown bis zum Stichtag und ihre Aktivität der letzten
Wochen. Admins sehen dieselbe Seite in einer eigenen Ausprägung mit Systemkennzahlen, und der
Rollen-Umschalter im Sidebar-Footer wechselt zwischen beiden Ansichten.

## Umfang

- [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) — vier KPI-Kacheln,
  Verkäufernummer-Karte, Aktivitäts-Heatmap, Info-Panel; `GET /api/home/seller` liefert
  `articleCount` und die Konditionen des zugewiesenen Typs
- [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) — fünf KPI-Kacheln, Aktivitäts-Heatmap
  über 12 Wochen, Info-Panel; `GET /api/home/admin` liefert `sellerCount`, `articleCount`,
  `categoryCount`, `brandCount`, `heatmapData`
- Termine und Info-Text kommen in **beiden** Ansichten aus `GET /api/public/info`, nicht aus
  den Home-Endpoints — bewusst DRY gehalten
- Countdown-Darstellung nach [`spec.md`](../spec.md) §12.3: erste Zeile Tage, zweite Zeile
  `HH:MM:SS`, Aktualisierung jede Sekunde
- **Rollen-Umschalter** im Sidebar-Footer nach [`spec.md`](../spec.md) §12.4: nur für Admins
  sichtbar, wechselt ohne erneute Anmeldung; die Aktivitäts-Heatmap des Admins erscheint nur
  im Admin-Modus

## Nicht in diesem Schritt

- Öffentliches Countdown-Widget unter `/embed/countdown` — R11
- Export — R12

## Setzt voraus

[R09](R09-einstellungen.md) — ohne gepflegte Termine gibt es keinen Countdown.
[R04](R04-artikelerfassung-rund.md) — ohne Artikel mit Zeitstempeln bleibt die Heatmap leer.

## Fertig, wenn — von Hand prüfbar

1. Als Verkäufer die Startseite öffnen → Artikelzahl stimmt mit der eigenen Artikelliste
   überein, Provision und Gebühr entsprechen dem zugewiesenen Typ.
2. Die Verkäufernummer-Karte zeigt die eigene Nummer.
3. Der Countdown läuft sekundenweise herunter und passt zum in R09 gesetzten Stichtag.
4. Einen Artikel anlegen und die Startseite neu laden → Artikelzahl und Heatmap-Feld des
   heutigen Tages haben sich erhöht.
5. Als Admin die Startseite öffnen → Verkäufer-, Artikel-, Kategorie- und Markenzahl stimmen
   mit den jeweiligen Listen überein.
6. Rollen-Umschalter auf „Verkäufer" stellen → Admin-KPIs und Admin-Heatmap verschwinden,
   die Verkäufer-Ansicht erscheint; zurückschalten stellt alles wieder her — ohne erneute
   Anmeldung.
7. Als Verkäufer ohne Admin-Rechte ist der Rollen-Umschalter nicht sichtbar.
8. Ist ein Termin in den Einstellungen nicht gepflegt, bricht die Startseite nicht — sie
   zeigt den Platzhalter.

## Quellen

- [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) ·
  [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md)
- [`api/home.md`](../api/home.md) · [`api/public.md`](../api/public.md)
- [components/home-dashboard.md](../components/home-dashboard.md) ·
  [components/verkaeufer-nummer.md](../components/verkaeufer-nummer.md) ·
  [activity-heatmap](../../../components/activity-heatmap/component.md) ·
  [kpi-tile](../../../components/kpi-tile/component.md) ·
  [countdown](../../../components/countdown/component.md)
- [`spec.md`](../spec.md) §12.3 Countdown-Darstellung · §12.4 Role-Toggle

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #dashboard #home #role-toggle

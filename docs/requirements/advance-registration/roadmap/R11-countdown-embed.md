---
id: ROADMAP-R11
status: draft
updated: 2026-09-08
---

# R11 — Countdown-Embed

**Voranmelde-App · Roadmap-Schritt 11 von 12**

## Worum es geht

Der erste Teil der App, den Menschen **ohne Konto** sehen: eine einbettbare Live-Timeline aller
Basar-Termine unter `/embed/countdown`, gedacht für die Basar-Webseite per `<iframe>`.

## Umfang

- [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md) vollständig
- Route `/embed/countdown` **außerhalb** der AppShell: kein Login, keine Sidebar, kein
  Sidebar-Footer, keine Titelleiste ([`spec.md`](../spec.md) §7)
- Timeline-Darstellung der fünf Termine aus `GET /api/public/info`, live mitlaufend
- Verhalten bei nicht gepflegten Terminen (`null`) und nach Ablauf aller Termine
- Sicherheitsteil des Epics: Der Endpoint gibt ausschließlich die im Epic genannten
  öffentlichen Felder zurück — keine Verkäufer-, Artikel- oder Kontodaten. Einbettung in
  fremde Seiten muss ohne Anmeldung und ohne Cookies funktionieren.

## Nicht in diesem Schritt

- Startseiten-Countdown — bereits in R10 erledigt
- Anpassbares Aussehen per Query-Parameter, sofern das Epic es nicht ausdrücklich fordert

## Setzt voraus

[R09](R09-einstellungen.md) — `GET /api/public/info` existiert und die Termine sind pflegbar.
[R10](R10-dashboards.md) — die Countdown-Komponente ist bereits gebaut und wird hier
wiederverwendet.

## Fertig, wenn — von Hand prüfbar

1. `/embed/countdown` in einem Browser ohne Anmeldung öffnen (privates Fenster) → die Timeline
   erscheint, ohne Weiterleitung auf die Login-Seite.
2. Die Seite zeigt weder Sidebar noch Titelleiste noch Sidebar-Footer.
3. Eine lokale HTML-Datei mit `<iframe src="…/embed/countdown">` anlegen und öffnen →
   die Timeline läuft darin sichtbar mit.
4. In den Einstellungen einen Termin ändern → nach dem Neuladen zeigt das Widget den neuen Wert.
5. Einen Termin leeren → das Widget bleibt fehlerfrei und zeigt den Platzhalter.
6. Die Antwort von `GET /api/public/info` enthält keine Verkäufer-, Artikel- oder Kontodaten.

## Quellen

- [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md)
- [`api/public.md`](../api/public.md)
- [components/countdown-timeline-page.md](../components/countdown-timeline-page.md) ·
  [countdown](../../../components/countdown/component.md)
- [`spec.md`](../spec.md) §7 Route ohne Sidebar

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #countdown #embed #public

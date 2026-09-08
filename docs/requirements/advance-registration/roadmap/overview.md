---
id: ROADMAP-000
status: draft
updated: 2026-09-08
---

# Roadmap — Voranmelde-App

## Index
- Zweck — wozu dieses Verzeichnis
- Schritte — R00 bis R12
- Abweichung von spec.md §8 — Begründung
- Tags & Piles — Ablage

---

## Zweck

Jede Datei in diesem Verzeichnis ist ein **Arbeitsauftrag für genau einen Umsetzungsschritt**.
Sie beschreibt, worum es in diesem Schritt geht, welche Epics er zusammenfasst, was
ausdrücklich noch nicht dazugehört und woran ein Mensch nach dem Durchlauf **von Hand**
erkennt, dass der Schritt fertig ist.

Die Dateien enthalten keine technische Umsetzung und keinen Ablauf-Prozess — sie sind der
fachliche Auftrag. Welcher Entwicklungs-Workflow den Auftrag abarbeitet, steht bewusst
nicht darin.

Verbindlich bleiben in jedem Fall die Epic-, Entitäts- und API-Dokumente unter
[`epics/`](../epics/), [`entities/`](../entities/overview.md) und [`api/`](../api/overview.md).
Bei Widerspruch gewinnt das Epic, nicht die Roadmap-Datei.

---

## Schritte

| # | Datei | Titel | Nutzer sieht danach |
|---|---|---|---|
| R00 | [R00-fundament.md](R00-fundament.md) | Fundament | lauffähige, leere App |
| R01 | [R01-zugang.md](R01-zugang.md) | „Ich komme rein" | Registrierung + Login |
| R02 | [R02-nummer-und-profil.md](R02-nummer-und-profil.md) | „Ich sehe meine Nummer" | Nummernblöcke + Steckbrief |
| R03 | [R03-artikelerfassung.md](R03-artikelerfassung.md) | „Ich erfasse Artikel" | Artikel anlegen und pflegen |
| R04 | [R04-artikelerfassung-rund.md](R04-artikelerfassung-rund.md) | Artikelerfassung rund | Filter, Serienanlage, Blockerweiterung |
| R05 | [R05-stammdaten.md](R05-stammdaten.md) | Stammdaten-Hoheit | Marken, Kategorien, Verkäufer-Typen |
| R06 | [R06-verkaeuferverwaltung.md](R06-verkaeuferverwaltung.md) | Verkäuferverwaltung | Einladen, Blöcke, Löschen |
| R07 | [R07-konto-sicherheit.md](R07-konto-sicherheit.md) | Konto-Sicherheit | E-Mail, Passwort, Account löschen |
| R08 | [R08-alle-artikel.md](R08-alle-artikel.md) | Überblick für Admin | Artikel aller Verkäufer |
| R09 | [R09-einstellungen.md](R09-einstellungen.md) | Einstellungen | Termine und Parameter pflegbar |
| R10 | [R10-dashboards.md](R10-dashboards.md) | Dashboards | Home mit KPIs, Countdown, Heatmap |
| R11 | [R11-countdown-embed.md](R11-countdown-embed.md) | Countdown-Embed | öffentliche Timeline per iframe |
| R12 | [R12-export-und-auslieferung.md](R12-export-und-auslieferung.md) | Export und Auslieferung | JSON-Export, EN, Deployment |

---

## Abweichung von spec.md §8 — Begründung

Die Epic-Reihenfolge in [`spec.md`](../spec.md) §8 ist nach **Abhängigkeiten** sortiert.
Diese Roadmap sortiert nach **überprüfbarem Nutzen** und weicht deshalb an zwei Stellen ab:

1. **Artikelerfassung vor Stammdaten-Oberfläche** (R03 vor R05).
   Marken und Kategorien entstehen laut [`spec.md`](../spec.md) §11.3 ohnehin implizit über
   das AutoComplete-Popup der Artikelerfassung; `POST /api/brands` und `POST /api/categories`
   sind `authenticated`, nicht `admin`. Für R03 wird darum nur die API dieser beiden Entitäten
   gebraucht, nicht ihre Verwaltungsseite. Ohne diese Umstellung liefern drei Durchläufe
   nacheinander nur leere Admin-Tabellen.

2. **Seed-Daten statt vorgezogener Einstellungen** (R01 statt R09).
   Die Registrierung braucht `defaultTypeId`, `startNumber`, `blockSize` und
   `defaultBlockCount`. Diese Werte kommen ab R01 als Seed aus der Migration; die
   Einstellungsseite in R09 ersetzt die Seeds durch pflegbare Werte.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #voranmelde-app #umsetzung

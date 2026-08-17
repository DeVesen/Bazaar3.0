---
id: F-AR-014
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Countdown-Embed-Widget

## Index
- Überblick — Konzept
- 1. Route & Zugriff — Öffentlicher Zugang
- 2. Darstellung — Timeline-Ansicht
- 3. Backend & API — Öffentlicher Endpoint
- 4. Sicherheit — Embedding-Freigabe
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Route:** `/embed/countdown` (öffentlich, kein Login, kein AppShell/Sidebar)
**Sichtbar für:** Jeder (auch ohne Konto) — gedacht zum Einbetten auf externen Seiten (z. B. Wordpress via `<iframe>`)

**Ziel:** Externe Webseiten (z. B. die Basar-Wordpress-Seite) können per iframe eine Live-Timeline aller Basar-Termine einbinden.

Component-Details → [`countdown-timeline-page`](../../components/countdown-timeline-page.md)

**User Story:** Als Admin möchte ich einen einbettbaren Countdown auf unserer Wordpress-Seite zeigen, damit Besucher ohne Login den aktuellen Stand aller Basar-Termine sehen.

---

## Überblick

Eigenständige, unauthentifizierte Seite ohne Sidebar/Topbar — ausschließlich der Countdown-Inhalt, damit sie sich per `<iframe>` in fremde Seiten (z. B. Wordpress) einbetten lässt.

---

## 1. Route & Zugriff

- Route `/embed/countdown` ist **öffentlich** (kein `AuthGuard`).
- Rendert **ohne** AppShell (keine Sidebar, keine Topbar) — nur der Countdown-Inhalt füllt die Seite.
- Kein Sprachumschalter — nur Deutsch (Zielgruppe lokal, YAGNI).

---

## 2. Darstellung

→ Komponente: [Countdown](../../../../components/countdown/component.md), **Variante `'timeline'`**

Zeigt alle 5 Basar-Phasen als Liste, jede mit eigenem Status:

| Phase | Label | Status-Möglichkeiten |
|---|---|---|
| Voranmeldeschluss | „Voranmeldung endet" | Bevorstehend (Countdown) / Abgeschlossen |
| Abgabe-Start | „Abgabe beginnt" | Bevorstehend / Läuft (Restzeit bis Abgabe-Ende) / Abgeschlossen |
| Abgabe-Ende | „Abgabe endet" | (Teil des Abgabe-Zeitraums, siehe oben) |
| Basar-Start | „Basar beginnt" | Bevorstehend / Läuft / Abgeschlossen |
| Basar-Ende | „Basar endet" | (Teil des Basar-Zeitraums) |

Hintergrund: **transparent** (kein eigener Rahmen/Card) — passt sich dem umgebenden Wordpress-Theme an. Zahlen/Labels in den Bazaar-Akzentfarben (`--accent` `#0e8a5f` für aktive Phase, `--muted` für abgeschlossene).

---

## 3. Backend & API

API-Details → [`api/public.md`](../../api/public.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/public/info` | `public` | Gibt die 5 Termine `{ registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil }` (ISO-8601, aus Epic_Einstellungen gepflegt) sowie `defaultConditions` und `infoText` zurück. Nicht gepflegte Werte sind `null`. |

**DRY-Entscheidung:** Dieser Endpoint wird nicht nur vom Embed-Widget genutzt, sondern auch von Login-Seite, Home_Verkaeufer und Home_Admin — vermeidet Duplizierung der 5 Datumsfelder in mehreren authentifizierten Antworten. Die Home-Endpoints (`/api/home/seller`, `/api/home/admin`) liefern nur noch die jeweils eigenen Kennzahlen, nicht die Termine selbst.

**Name:** ursprünglich `GET /api/public/countdown`. Erweitert und umbenannt, weil die öffentliche Login-Seite zusätzlich Default-Konditionen und `infoText` ohne Auth braucht (Epic_Login Abschnitt 2) — ein Public-Endpoint statt zwei. Das Embed-Widget nutzt davon nur die 5 Termine.

Feldnamen bestätigt gegen Epic_Einstellungen Abschnitt 1 (`registrationDeadline`, `dropOffFrom`, `dropOffUntil`, `bazaarFrom`, `bazaarUntil`) — Pflege-UI dort per `p-datepicker`.

---

## 4. Sicherheit

- `GET /api/public/info` ist bewusst ohne Auth — enthält keine sensiblen Daten (Datum/Uhrzeiten, Default-Konditionen und der Info-Text stehen ohnehin auf der öffentlichen Login-Seite).
- Route `/embed/countdown` ist die **einzige** Route der App, die `X-Frame-Options`/CSP `frame-ancestors` für Embedding freigibt. Alle anderen Routen bleiben gegen Clickjacking geschützt (Default: `DENY`/`same-origin`).
- Kein Admin-Schalter zum Ein-/Ausschalten — immer erreichbar sobald deployed (YAGNI, keine sensiblen Daten).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN `/embed/countdown` ohne Login aufgerufen wird, THEN SHALL das System die Seite ohne Weiterleitung zu `/login` und ohne AppShell (keine Sidebar/Topbar) anzeigen.
2. **AC-2** — THE SYSTEM SHALL alle 5 Phasen (Voranmeldeschluss, Abgabe-Start, Abgabe-Ende, Basar-Start, Basar-Ende) als Liste mit Live-Countdown/Status anzeigen.
3. **AC-3** — THE SYSTEM SHALL die Seite mit transparentem Hintergrund rendern, sodass sie sich in ein fremdes Theme (z. B. Wordpress) einfügt.
4. **AC-4** — THE SYSTEM SHALL für die Route `/embed/countdown` HTTP-Header setzen, die das Einbetten per `<iframe>` von beliebigen Domains erlauben, während alle anderen Routen der App gegen Einbettung geschützt bleiben.
5. **AC-5** — THE SYSTEM SHALL `GET /api/public/info` ohne Authentifizierung bereitstellen und die 5 Termine als ISO-8601-Zeitstempel zurückgeben.
6. **AC-6** — IF ein Termin, `defaultTypeId` oder `infoText` in den Einstellungen nicht gesetzt ist, THEN SHALL `GET /api/public/info` das betreffende Feld als `null` liefern und weiterhin mit HTTP 200 antworten.
7. **AC-7** — WHEN eine Phase in `GET /api/public/info` `null` ist, THEN SHALL die Timeline diese Phase überspringen statt eine leere Zeile anzuzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #countdown #embed #iframe #öffentlich #wordpress #widget

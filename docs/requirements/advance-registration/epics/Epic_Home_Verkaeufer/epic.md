---
id: F-AR-002
status: draft
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Home — Verkäufer-Ansicht

## Index
- Überblick — Konzept
- 1. KPI-Kacheln — Kennzahlen
- 2. Verkäufernummer-Karte — Nummer + QR-Code
- 3. Aktivitäts-Heatmap — Verweis (Admin-only)
- 4. Info-Panel — Freitext
- 5. Backend & API — Endpoint
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home

Component-Details → [`components/custom/home-dashboard.md`](../../components/custom/home-dashboard.md)
**Sichtbar für:** Alle (Verkäufer + Admins im Verkäufer-Modus)

**Ziel:** Verkäufer sieht auf der Home-Seite eine Übersicht seines Registrierungsstatus.

**User Story:** Als Verkäufer möchte ich auf meiner Home-Seite den Status meiner Registrierung und meiner Artikel sehen, damit ich weiß, ob ich für den Basar vorbereitet bin.

---

## Überblick

Die Home-Seite ist die **Einstiegsseite** nach dem Login. Sie zeigt dem Verkäufer auf einen Blick alle relevanten Informationen zum bevorstehenden Basar.

---

## 1. KPI-Kacheln (4 Stück, Grid `c4`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c4`
→ Countdown-Kachel: [Countdown](../../../../components/countdown/component.md) — `variant="kpi"`

| Kachel | Inhalt |
|---|---|
| **Countdown** | Sequence-Mode-Phasen `dropOffFrom` → `dropOffUntil` (Tage / HH:MM:SS, live) — zeigt automatisch Start oder Restzeit der Abgabe. Darunter: Datum der jeweiligen Phase. |
| **Meine Artikel** | Anzahl der bisher erfassten Artikel des eingeloggten Verkäufers. |
| **Meine Konditionen** | Provision (%) und Abgabegebühr pro Stück — read-only, abgeleitet vom zugewiesenen Verkäufer-Typ (kein eigenes Override-Feld in dieser App, siehe `entities/verkaeufer-typ.md`). |
| **Abgabegebühr gesamt** | `Artikel-Anzahl × Abgabegebühr/Stück` — zu erwartende Gesamtgebühr. |

---

## 2. Verkäufernummer-Karte

→ Komponente: [verkaeufer-nummer](../../components/custom/verkaeufer-nummer.md), Variante `card`

Direkt **unterhalb der KPI-Kacheln**, volle Breite. Zeigt dem Verkäufer seine
eigene Verkäufernummer im Klartext (24 px, monospace) und als QR-Code (128 px),
dazu einen Kopieren-Button und den Hinweis „Am Basar-Tag vorzeigen — das
Kassenpersonal scannt den Code."

| Aspekt | Entscheidung |
|---|---|
| Angezeigter Wert | Verkäufer-`id` (8 Zeichen, alphanumerisch) |
| QR-Inhalt | derselbe Wert, unverändert — nichts umkodiert, kein Präfix, keine URL |
| Datenquelle | `sub`-Claim des Access-Tokens über `AuthService` — **kein** neuer Endpoint, kein neues Entity-Feld |
| Sichtbar für | Verkäufer **und** Admin im Verkäufer-Modus (Admins haben ebenfalls eine eigene `id` und dürfen selbst Artikel erfassen) |

**Warum die `id` und nicht die „Nr." aus der Admin-Verkäuferliste:** die Spalte
„Nr." ist der `fromNumber` des ersten Nummernblocks — abgeleitet, `null` solange
kein Block zugewiesen ist, und verschiebbar, wenn der Admin Blöcke umverteilt
([`api/sellers.md`](../../api/sellers.md)). Die `id` ist stabil, immer vorhanden
und genau der Wert, den der Scanner der Haupt-App erwartet
([seller-search](../../../../components/seller-search/component.md)). Ein
drittes, eigenes Nummernfeld wurde verworfen — dieselbe Begründung wie dort:
keine zweite Nummernwelt neben den Artikelnummern.

---

## 3. Aktivitäts-Heatmap

**Nur für Admins sichtbar** (Role-Toggle „Admin") — gehört inhaltlich zum Admin-Dashboard, nicht zur Verkäufer-Ansicht.
Vollständig spezifiziert → [Epic_Home_Admin](../Epic_Home_Admin/epic.md) Abschnitt 2.

---

## 4. Info-Panel

Unterhalb der Heatmap: freies **Informations-Panel** mit mehrzeiligem Text.

→ Komponente: [markdown-text](../../components/custom/markdown-text.md) — dieselbe
Custom-Component wie im [`login-info-panel`](../../components/custom/login-info-panel.md)
(Epic_Login Abschnitt 2), gefüttert mit demselben `infoText`.

- Text wird vom **Admin** in den Einstellungen gepflegt (`infoText`-Parameter)
- **Markdown-Formatierung** unterstützt — welche Elemente genau, steht verbindlich in
  [`markdown-text`](../../components/custom/markdown-text.md) Abschnitt 3.1 und wird
  hier nicht wiederholt
- Zweck: Hinweise zu Abgaberegeln, Öffnungszeiten, organisatorischen Details
- Gleicher Text wie auf der Login-Seite (Info-Area)
- IF `infoText` `null` oder leer ist, blendet `home-dashboard` die Box aus
  (markdown-text Abschnitt 3.3 — die Leaf-Komponente entscheidet das nicht selbst)

---

## 5. Backend & API

API-Details → [`api/home.md`](../../api/home.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/home/seller` | `authenticated` | Gibt `{ articleCount, typeConditions: { commissionRate, itemFee } }` zurück (Konditionen vom zugewiesenen Verkäufer-Typ, kein Override). **Weder Termine noch `infoText`** — beides kommt aus `GET /api/public/info`, das die Seite für den Countdown ohnehin ruft (DRY, siehe Epic_Countdown_Widget). |

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Verkäufer sich anmeldet, THEN SHALL das System seine Home-Seite mit aktuellen Kennzahlen (Anzahl Artikel, eigene Konditionen, Abgabegebühr gesamt) laden und anzeigen.
2. **AC-2** — THE SYSTEM SHALL einen Countdown im Sequence-Mode über die Phasen Abgabe-Start und Abgabe-Ende anzeigen, sofern diese in den Einstellungen hinterlegt sind.
3. **AC-3** — WHEN der Verkäufer noch keine Artikel erfasst hat, THEN SHALL das System einen Hinweis „Noch keine Artikel erfasst" und einen Link zu „Meine Artikel" anzeigen.
4. **AC-4** — WHEN die Home-Seite geladen ist, THEN SHALL das System die eigene Verkäufernummer (Verkäufer-`id`) im Klartext und als QR-Code anzeigen, ohne dafür einen zusätzlichen Endpoint zu rufen.
5. **AC-5** — WHEN der Kopieren-Button der Verkäufernummer-Karte geklickt wird, THEN SHALL das System die Nummer in die Zwischenablage legen und einen Toast „✓ Nummer kopiert" anzeigen.
6. **AC-6** — WHEN die Home-Seite geladen ist und `infoText` gesetzt ist, THEN SHALL das System den Text im Info-Panel **als gerendertes HTML** anzeigen (Umfang → [markdown-text](../../components/custom/markdown-text.md) Abschnitt 3.1) und keine Markdown-Syntaxzeichen unterstützter Elemente im Klartext stehen lassen.
7. **AC-7** — IF `infoText` `null`, leer oder nur Whitespace ist, THEN SHALL das System die Info-Panel-Box vollständig ausblenden statt eine leere Box anzuzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #home #verkäufer #dashboard #registrierung #countdown #verkäufernummer #qr-code

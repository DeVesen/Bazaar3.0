---
id: F-AR-008
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Nummernblöcke

## Index
- Überblick — Konzept
- 1. Block-Anzeige — Darstellung
- 2. Nummernblock-Logik — Vergabe-Regeln
- 3. Hinweis — Admin-Verweis
- 4. Backend & API — Endpoint
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Konto → Nummernblöcke
**Sichtbar für:** Verkäufer (read-only)

Component-Details → [`components/block-liste.md`](../../components/block-liste.md)
Entity-Details → [`entities/nummernblock.md`](../../entities/nummernblock.md)

**Ziel:** Verkäufer sieht seine zugewiesenen Nummernblöcke ein.

**User Story:** Als Verkäufer möchte ich meine zugewiesenen Nummernblöcke einsehen, damit ich weiß, welche Artikelnummern ich vergeben darf.

---

## Überblick

Zeigt dem Verkäufer seine zugewiesenen Nummernblöcke. Nur lesend — keine Möglichkeit, Blöcke zu ändern oder weitere zu beantragen.

---

## 1. Block-Anzeige

Für jeden zugewiesenen Block:

`display: flex; justify-content: space-between; align-items: center; background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px`

| Element | Stil |
|---|---|
| Bereich (z. B. „101 – 110") | 700, 14 px, `--primary` (grün) |
| Zähler (z. B. „10 Nummern · 3 vergeben") | 12 px, muted |

---

## 2. Nummernblock-Logik

- **Startpunkt:** konfigurierbar (`startNumber` in Epic_Einstellungen)
- **Blockgröße:** konfigurierbar (`blockSize` in Epic_Einstellungen)
- Jeder Verkäufer erhält beim Anlegen einen oder mehrere **zusammenhängende** Blöcke
- **Automatische Erweiterung:** Ist der aktuelle Block aufgebraucht und ein neuer Artikel wird angelegt → automatisch nächster freier Block zugewiesen (kanonische Regel — Epic_Meine_Artikel verweist hierher statt sie zu wiederholen)
- Verkäufer kann Blöcke nur **einsehen** — kein Ändern, kein Beantragen

---

## 3. Hinweis

Weitere Blöcke können nur vom Admin im Verkäufer-Bearbeiten-Dialog zugewiesen werden. Die komplette Admin-Verwaltung (Anlegen, Reservieren, Löschen, Überschneidungsprüfung) ist **ausschließlich** dort spezifiziert — nicht in diesem Epic.
Details → [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 4 (Panel-04 Nummernblöcke).

---

## 4. Backend & API

API-Details → [`api/blocks.md`](../../api/blocks.md) (kanonische Stelle für **alle** Nummernblock-Routen, auch die Admin-Routen unter `/api/sellers/{id}/blocks`)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/blocks/mine` | `authenticated` | Gibt alle Nummernblöcke des eingeloggten Verkäufers zurück, je mit `anzahlNummern` und `vergeben` für die Anzeige „10 Nummern · 3 vergeben". |

Rein lesend — es existiert bewusst kein Endpoint, über den ein Verkäufer Blöcke ändern oder beantragen könnte.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN der Verkäufer die Seite „Konto → Nummernblöcke" öffnet, THEN SHALL das System alle ihm zugewiesenen Blöcke mit Bereich (z. B. „101–110") und Zähler (z. B. „10 Nummern · 3 vergeben") anzeigen.
2. **AC-2** — IF dem Verkäufer noch kein Block zugewiesen ist, THEN SHALL das System einen Hinweistext „Noch keine Nummernblöcke zugewiesen" anzeigen.
3. **AC-3** — WHILE der Verkäufer die Seite betrachtet, SHALL das System keine Bearbeitungs- oder Lösch-Aktionen anbieten (rein lesend).
4. **AC-4** — WHEN der aktuelle Block eines Verkäufers aufgebraucht ist und ein neuer Artikel angelegt wird, THEN SHALL das System automatisch den nächsten freien Block zuweisen und in dieser Ansicht anzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #nummernblöcke #verkäufer #artikelnummern #zuweisung #stammdaten

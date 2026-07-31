---
id: F-AR-008
status: draft
updated: 2026-07-31
---

# Epic: Nummernblöcke

## Index
- Überblick — Konzept
- 1. Block-Anzeige — Darstellung
- 2. Nummernblock-Logik — Vergabe-Regeln
- 3. Hinweis — Admin-Verweis
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Konto → Nummernblöcke
**Sichtbar für:** Verkäufer (read-only)

**Ziel:** Admin verwaltet Nummernblöcke und weist sie Verkäufern zu.

**User Story:** Als Admin möchte ich Nummernblöcke definieren und Verkäufern zuweisen, damit jeder Verkäufer eindeutige Artikelnummern erhält.

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

- **Startpunkt:** konfigurierbar (Admin: Einstellungen)
- **Blockgröße:** konfigurierbar (Admin: Einstellungen)
- Jeder Verkäufer erhält beim Anlegen einen oder mehrere **zusammenhängende** Blöcke
- **Automatische Erweiterung:** Ist der aktuelle Block aufgebraucht und ein neuer Artikel wird angelegt → automatisch nächster freier Block zugewiesen
- Verkäufer kann Blöcke nur **einsehen** — kein Ändern, kein Beantragen

---

## 3. Hinweis

Weitere Blöcke können nur vom Admin im Verkäufer-Bearbeiten-Dialog zugewiesen werden.
Details → [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 4 (Panel-04 Nummernblöcke).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit Feldern für Start- und Endnummer öffnen.
2. **AC-2** — IF sich ein neuer Nummernblock mit einem bestehenden überschneidet, THEN SHALL das System eine Fehlermeldung „Nummernbereich überschneidet sich mit bestehendem Block" anzeigen und nicht anlegen.
3. **AC-3** — WHEN einem Verkäufer ein Block zugewiesen wird, THEN SHALL das System den Block in der Tabelle als „Vergeben" markieren und ihn für andere Zuweisungen sperren.
4. **AC-4** — WHEN die Zuweisung aufgehoben wird, THEN SHALL das System den Block wieder als „Frei" markieren.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #nummernblöcke #admin #artikelnummern #zuweisung #stammdaten

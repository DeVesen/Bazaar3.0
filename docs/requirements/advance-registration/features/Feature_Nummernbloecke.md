# Feature: Nummernblöcke

**App:** Voranmelde-App
**Navigation:** Konto → Nummernblöcke
**Sichtbar für:** Verkäufer (read-only)

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
Details → [Feature_Verkaeufer.md](Feature_Verkaeufer.md) Abschnitt 4 (Panel-04 Nummernblöcke).

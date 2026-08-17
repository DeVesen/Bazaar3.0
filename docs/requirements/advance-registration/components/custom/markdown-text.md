---
id: C-010
status: reviewed
reviewed-date: 2026-08-14
---

# Component: markdown-text

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Aufbau — Rendering
- 4. Verwendung in Epics — Einsatzorte
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** Eigener Wrapper — kein PrimeNG-Element beteiligt (reines Text-Rendering)
**Verwendung:** Voranmelde-App — überall dort, wo admin-gepflegter Markdown-Text (`infoText`) angezeigt wird.

---

## Überblick

Rendert admin-gepflegten Markdown-Text (`infoText` aus Epic_Einstellungen). Wird an mehreren Stellen identisch verwendet — daher zentral als Shared Component dokumentiert statt je Epic dupliziert.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────┐
│  📄 Öffnungszeiten:      │
│     Sa 08:00–14:00      │  ← markdown-text
│  **Wichtig:** ...        │
└─────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `content` | `string` | `@Input` | Markdown-Rohtext (`infoText`) |

Keine Outputs — reine Anzeige, keine Interaktion.

---

## 3. Aufbau

Eigener, kleiner Markdown-Renderer (z. B. via `ngx-markdown` oder minimalem eigenem Parser) — unterstützt: Überschriften, Fettdruck, Listen, Trennlinien, Code (wie in Epic_Einstellungen Abschnitt 3 spezifiziert). Kein PrimeNG-Element beteiligt, reines Text-Rendering.

---

## 4. Verwendung in Epics

| Epic | Einsatzort |
|---|---|
| [Epic_Login](../../requirements/advance-registration/epics/Epic_Login/epic.md) | `login-info-panel` |
| [Epic_Home_Verkaeufer](../../requirements/advance-registration/epics/Epic_Home_Verkaeufer/epic.md) | Markdown-Info-Panel (Home-Dashboard) |
| [Epic_Home_Admin](../../requirements/advance-registration/epics/Epic_Home_Admin/epic.md) | Markdown-Info-Panel (Home-Dashboard) |

Überall dieselbe Instanz/derselbe Text (`infoText` aus Epic_Einstellungen).

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den übergebenen Markdown-Text in HTML rendern und dabei Überschriften, Fettdruck, Listen, Trennlinien und Code-Blöcke korrekt darstellen.
2. **AC-2** — THE SYSTEM SHALL keine über die unterstützten Markdown-Elemente hinausgehenden HTML-Tags aus dem Eingabetext ausführen (XSS-Schutz — Admin-Eingabe, aber dennoch sanitized rendern).

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #markdown #info-text #custom-component #shared-across-epics

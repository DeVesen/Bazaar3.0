---
id: C-012
status: draft
updated: 2026-07-31
---

# Component: InfoArea

**Bibliothek:** Eigener Wrapper — kein PrimeNG-Äquivalent
**Verwendung:** Beide Apps — überall dort, wo kontextuelles Feedback direkt im Content-Bereich angezeigt wird.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Typen — Farb- und Ton-Schema
- 3. Visuelles Design — Format & Stil
- 4. Verhalten — Ton-Feedback
- 5. Einsatzorte — Verwendung in Features
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Einzeilige Feedback-Anzeige mit Icon, Nachrichtentext, Farbcodierung und optionalem Ton-Feedback — vier Typen: success, error, warn, info.

---

## Überblick

Die InfoArea ist die Standard-Komponente für kontextuelles Feedback direkt im Content-Bereich. Sie erscheint dort, wo eine Benutzerreaktion nötig ist oder ein Scan-/Aktionsergebnis sofort sichtbar sein muss — im Gegensatz zu Toast-Benachrichtigungen (kurze Auto-dismiss-Einblendungen ohne Reaktionsbedarf).

**Dumb Component:** Alle Daten kommen per `@Input()`. Kein eigenes State-Management.

---

## 1. ASCII-Darstellung

```
┌────────────────────────────────────────────────────┐
│ ✓  Artikel „Nike Air Max" erfolgreich gebucht — 12,50 €  │  ← success
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ ✗  Artikel unbekannt oder falscher Status          │  ← error
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ ⚠  Artikel bereits verkauft                        │  ← warn
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ ℹ  Ersten Artikel eingeben …                       │  ← info
└────────────────────────────────────────────────────┘
```

Format: `[Icon] Nachrichtentext` — einzeilig, fett.

---

## 2. Typen — Farb- und Ton-Schema

| Typ | Hintergrund | Textfarbe | Ton |
|---|---|---|---|
| `success` | Hellgrün | Dunkelgrün | Ping (Sinus 880→1320 Hz) |
| `error` | Hellrot | Dunkelrot | Zonk (Quadratwelle 180→120 Hz) |
| `warn` | Hellgelb | Orangerot | Zonk (Quadratwelle 180→120 Hz) |
| `info` | Hellblau | Dunkelblau | — |

> **Hinweis Ton-Details:** Die genauen Wellenform-Parameter (Sinus / Quadratwelle, Hz-Verlauf) sind in der Haupt-App spezifiziert. Die Voranmelde-App nennt dieselben Ton-Namen (Ping / Zonk) ohne weitere Wellenform-Details.

---

## 3. Visuelles Design

| Element | Stil |
|---|---|
| Layout | Einzeilig, volle Breite des Content-Bereichs |
| Format | `[Icon] Nachrichtentext` |
| Schrift | Fett (`font-weight: 700`) |
| Icon | Inline, links vom Text |
| Hintergrund | Typ-abhängig (siehe Tabelle in Abschnitt 2) |
| Textfarbe | Typ-abhängig (siehe Tabelle in Abschnitt 2) |

---

## 4. Verhalten — Ton-Feedback

Ton wird über die **Web Audio API** ausgespielt. Vibration über `Navigator.vibrate()` ist ergänzend möglich.

| Typ | Ton | Technische Umsetzung |
|---|---|---|
| `success` | Ping | Sinus-Schwingung 880→1320 Hz |
| `error` | Zonk | Quadratwelle 180→120 Hz |
| `warn` | Zonk | Quadratwelle 180→120 Hz |
| `info` | — | kein Ton |

> **App-Hinweis (Haupt-App):** Scan-Feedback ist explizit als „Ton und Vibration" spezifiziert (Web Audio API + `Navigator.vibrate()`).

---

## 5. Einsatzorte

### Haupt-App

**Verkauf-Seite:**

| Situation | Typ | Nachricht |
|---|---|---|
| Beim Navigieren zur Verkauf-Seite | `info` | *„Ersten Artikel eingeben …"* |
| Nach Buchen / Leeren des Warenkorbs | `info` | *„Ersten Artikel eingeben …"* |
| Nach erfolgreichem Scan | `success` | Artikel-Name mit Preis |
| Unbekannter Artikel / falscher Status | `error` | Fehlerbeschreibung |

**Inline-Kamera-Modus** (Artikel-Freigeben-Popup, Rückgabe-Popup):

Nach jedem Scan zeigt die InfoArea das Ergebnis (grün/gelb/rot) mit Ton-Feedback. Anschließend läuft ein Countdown-Display (`scannerPauseMs`, Default 3 000 ms), bevor das Kamerabild erneut erscheint.

**Abgrenzung zu Toast:** Fehler, die eine Benutzerreaktion erfordern, erscheinen in der InfoArea — nicht als Toast. Toasts sind für Aktionsbestätigungen ohne Reaktionsbedarf reserviert (z. B. „✓ Import erfolgreich").

### Voranmelde-App

Keine spezifischen Einsatzorte in den Anforderungen dokumentiert. Die InfoArea steht als gemeinsame Komponente zur Verfügung; konkrete Verwendungsstellen sind in den Feature-Dokumenten festzulegen.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die InfoArea in einem der vier Typen (`success`, `error`, `warn`, `info`) rendern, wobei Hintergrund- und Textfarbe dem Typ-Schema aus Abschnitt 2 entsprechen.
2. **AC-2** — THE SYSTEM SHALL den Inhalt einzeilig im Format `[Icon] Nachrichtentext` in `font-weight: 700` anzeigen.
3. **AC-3** — WHEN der Typ `success` gesetzt ist, THEN SHALL das System einen Ping-Ton (Sinus 880→1320 Hz) über die Web Audio API abspielen.
4. **AC-4** — WHEN der Typ `error` oder `warn` gesetzt ist, THEN SHALL das System einen Zonk-Ton (Quadratwelle 180→120 Hz) über die Web Audio API abspielen.
5. **AC-5** — WHEN der Typ `info` gesetzt ist, THEN SHALL das System keinen Ton abspielen.
6. **AC-6** — WHEN die InfoArea im Inline-Kamera-Modus der Haupt-App erscheint, THEN SHALL das System nach Ablauf von `scannerPauseMs` das Kamerabild erneut anzeigen.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #info-area #feedback #ton #scan #verkauf #kamera

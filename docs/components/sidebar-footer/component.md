---
id: C-009
status: draft
updated: 2026-07-31
---

# Component: Sidebar-Footer

**Bibliothek:** Eigener Wrapper — kein direktes PrimeNG-Äquivalent
**Verwendung:** Nur Voranmelde-App — cross-feature innerhalb dieser App, aber App-spezifisch

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Elemente & Visuelles Design — Farben & Stil
- 3. Sichtbarkeit & Verhalten — Bedingungen
- 4. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Footer-Bereich der Sidebar mit Benutzeridentität, Rollen-Toggle und Logout.

**Verwendungszweck:** Wird im unteren Bereich der App-weiten Sidebar angezeigt und ist in allen Features der Voranmelde-App sichtbar.

---

## Überblick

Der Sidebar-Footer zeigt die Identität des angemeldeten Nutzers (Avatar, Username, Rolle), ermöglicht Admins den Wechsel zwischen den Rollen Admin und Verkäufer, und enthält die Logout-Aktion.

**Nur Voranmelde-App.** Dieser Footer ist nicht Bestandteil der Haupt-App.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────┐
│  [A]  Admin User              ← Avatar  │
│       Administrator           ← Rolle   │
│  ┌──────────┬──────────┐                │
│  │  Admin   │ Verkäufer│  ← Role-Toggle │
│  └──────────┴──────────┘                │
│  🚪 Abmelden                            │
└─────────────────────────────────────────┘
```

---

## 2. Elemente & Visuelles Design

| Element | Stil |
|---|---|
| Avatar-Kreis | 36 px, Hintergrund `#3ecf8e`, Schrift weiß, Initial-Buchstabe 15 px, `font-weight: 700` |
| Username | 13 px, `font-weight: 600`, weiß |
| Role-Label | 11 px, `--sidebar-section`-Farbe |
| Role-Toggle-Container | `background: rgba(255,255,255,0.08)`, `border-radius: 6px` |
| Toggle-Button | `flex: 1`, `padding: 6px 10px`, 12 px, `font-weight: 600`; aktiv = Akzentfarbe + weiß |
| Logout | 13 px, muted; hover = weiß; `margin-top: 8px` |

---

## 3. Sichtbarkeit & Verhalten

| Element | Bedingung |
|---|---|
| Avatar-Kreis | Immer sichtbar — zeigt Initial-Buchstaben des Usernamens |
| Username | Immer sichtbar |
| Role-Label | Immer sichtbar — zeigt aktuelle Rolle des Nutzers |
| Role-Toggle | **Nur für Admins** — Verkäufer sehen keinen Toggle |
| Logout | Immer sichtbar |

Der Role-Toggle erlaubt Admins, zwischen der Admin-Ansicht und der Verkäufer-Ansicht zu wechseln. Der aktive Modus wird durch die Akzentfarbe und weiße Schrift hervorgehoben.

---

## 4. PrimeNG-Basis

```
p-button (styleClass="p-button-text")   ← Toggle-Buttons und Logout-Aktion
```

Avatar-Kreis, Layout und Typografie per CSS — kein PrimeNG-Avatar-Äquivalent.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Avatar-Kreis mit 36 px Durchmesser, Hintergrundfarbe `#3ecf8e`, weißem Initial-Buchstaben (15 px, `font-weight: 700`) des angemeldeten Nutzers rendern.
2. **AC-2** — THE SYSTEM SHALL den Username in 13 px, `font-weight: 600`, weiß und das Role-Label in 11 px in `--sidebar-section`-Farbe unterhalb des Avatars anzeigen.
3. **AC-3** — WHEN der angemeldete Nutzer die Rolle Admin hat, THEN SHALL das System den Role-Toggle mit den Buttons „Admin" und „Verkäufer" anzeigen; der aktive Button SHALL in Akzentfarbe mit weißer Schrift hervorgehoben sein.
4. **AC-4** — WHEN der angemeldete Nutzer die Rolle Verkäufer hat, THEN SHALL das System den Role-Toggle nicht rendern.
5. **AC-5** — THE SYSTEM SHALL den Logout-Eintrag in 13 px muted darstellen; WHEN der Nutzer darüber hovert, SHALL die Schrift auf weiß wechseln.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #sidebar-footer #avatar #role-toggle #logout #voranmelde-app

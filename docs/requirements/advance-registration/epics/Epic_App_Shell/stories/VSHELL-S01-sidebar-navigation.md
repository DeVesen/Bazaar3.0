---
id: VSHELL-S01
status: draft
depends-on: [VPROJ-S01]
---

# Story: Sidebar & Navigation

## Ziel

Admin und Verkäufer navigieren über eine rollenabhängige Sidebar. Admins sehen alle Bereiche; Verkäufer sehen nur „Mein Bereich" und „Konto". Der Sidebar-Footer zeigt Avatar, Rollenname, Role-Toggle (nur Admin) und Logout.

## Kontext

Die Voranmelde-App unterscheidet zwei Rollen. Die Sidebar zeigt nur Einträge, auf die die aktuelle Rolle Zugriff hat. Ein Admin kann ohne erneuten Login zur Verkäufer-Ansicht wechseln (Role-Toggle), um die App aus Verkäuferperspektive zu testen.

## Scope

**In Scope:** Sidebar-Komponente (240 px expandiert / 60 px eingeklappt, Teal `#1b3a4b`), Logo, rollenabhängige Navigationsgruppen mit Gruppen-Labeln, Collapse-Toggle (Sidebar einklappen / ausklappen, Zustand in localStorage), Sidebar-Footer (Avatar, Rollenname, Role-Toggle, Logout), Active-Route-Highlight, Badge für Artikel-Anzahl.

**Out of Scope:** Mobile-Burger-Menü (folgt in VSHELL-S02), Auth-Service (folgt in VSHELL-S04), tatsächliche Artikel-Zahl-API-Anbindung (folgt in Epic_Meine_Artikel).

## UI-Spezifikation

### Expandierte Sidebar (240 px)

```
Admin-Sidebar (240px, #1b3a4b):
┌──────────────────────────┐
│  🛒 Basar Voranmelde  «  │  ← Logo links, «-Button rechts (Collapse-Toggle)
│                          │    "Voranmelde" in #0e8a5f
├──────────────────────────┤
│  MEIN BEREICH            │  ← Gruppen-Label: 10px, uppercase, muted (#8ab4c4)
│  ○ Home                  │
│  ○ Meine Artikel    [5]  │  ← p-badge rechts
│  ──────────────          │  ← visueller Trenner zwischen Gruppen
│  VERWALTUNG              │
│  ○ Verkäufer             │
│  ○ Artikel               │
│  ──────────────          │
│  STAMMDATEN              │
│  ○ Marken                │
│  ○ Kategorien            │
│  ○ Verkäufer-Types       │
│  ──────────────          │
│  SYSTEM                  │
│  ○ Profil                │
│  ○ Einstellungen         │
│  ○ Export                │
├──────────────────────────┤  ← Sidebar-Footer (immer sichtbar)
│  [A]  Admin User         │  ← Avatar (#3ecf8e, 36px)
│       Administrator      │
│  [ Admin | Verkäufer ]   │  ← Role-Toggle
│  🚪 Abmelden             │
└──────────────────────────┘

Verkäufer-Sidebar (expandiert):
┌──────────────────────────┐
│  🛒 Basar Voranmelde  «  │
├──────────────────────────┤
│  MEIN BEREICH            │
│  ○ Home                  │
│  ○ Meine Artikel    [5]  │
│  ──────────────          │
│  KONTO                   │
│  ○ Profil                │
│  ○ Nummernblöcke         │
├──────────────────────────┤
│  [M]  Max Mustermann     │  ← kein Role-Toggle
│       Verkäufer          │
│  🚪 Abmelden             │
└──────────────────────────┘
```

### Eingeklappte Sidebar (60 px)

Zustand: nur Icons, keine Labels, keine Gruppen-Label, kein Footer-Text.

```
┌────┐
│ 🛒 │  ← Logo-Icon, kein Text
│  » │  ← Expand-Toggle (rechts unten, oder als Icon in Logo-Zeile)
├────┤
│ 🏠 │  ← Home (Tooltip on hover: "Home")
│ 📋 │  ← Meine Artikel (Badge-Dot wenn > 0)
│ ── │
│ 👥 │  ← Verkäufer
│ 📦 │  ← Artikel
│ ── │
│ 🏷 │  ← Marken
│ 🗂 │  ← Kategorien
│ 👤 │  ← Verkäufer-Types
│ ── │
│ 🔧 │  ← Profil
│ ⚙  │  ← Einstellungen
│ 📤 │  ← Export
├────┤
│[A] │  ← Avatar only, kein Name/Rolle
└────┘
```

**Hover-Verhalten eingeklappt:** Tooltip mit Label erscheint rechts neben dem Icon (PrimeNG `pTooltip`, Position `right`).
**Badge eingeklappt:** kleiner Dot-Badge am Icon (kein Zahlenwert).

**Gruppen-Label-Stil:**

| Element | Stil |
|---|---|
| Gruppen-Label (z. B. „MEIN BEREICH") | 10 px, uppercase, letter-spacing 0.08em, Farbe `#8ab4c4` (muted), padding 16 px 12 px 4 px |
| Gruppen-Trenner | `<hr>` oder border-top 1px `rgba(255,255,255,0.08)`, margin 8 px 12 px |
| Eingeklappt | Gruppen-Label und Trenner werden ausgeblendet (`display: none`) |

**Collapse-Toggle:**

| Element | Stil |
|---|---|
| Toggle-Button im Header | Icon `pi-chevron-left` (expandiert) / `pi-chevron-right` (eingeklappt), 20 px, muted |
| Sidebar-Breite expandiert | 240 px |
| Sidebar-Breite eingeklappt | 60 px |
| Übergang | `transition: width 200ms ease` |
| Zustand persistent | `localStorage` Key `sidebar-collapsed` (Boolean) |

**Sidebar-Footer-Maße (aus spec.md §13.7):**

| Element | Stil |
|---|---|
| Avatar-Kreis | 36 px, `#3ecf8e`, weiß, Initial-Buchstabe 15 px 700 |
| Username | 13 px, 600, weiß |
| Role-Label | 11 px, section-label-Farbe |
| Role-Toggle-Container | `background: rgba(255,255,255,0.08)`, radius 6 px |
| Toggle-Button | flex: 1, padding 6 px 10 px; aktiv = Akzentfarbe `#0e8a5f` + weiß |
| Logout | 13 px, muted; hover = weiß; mt 8 px |
| Eingeklappt | nur Avatar sichtbar, kein Text/Toggle/Logout |

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine Sidebar-Komponente im expandierten Zustand mit der Breite 240 px und dem Hintergrund `#1b3a4b` rendern.
- [ ] **AC-2** — THE SYSTEM SHALL im Logo-Block „Basar **Voranmelde**" anzeigen, wobei „Voranmelde" in `#0e8a5f` gefärbt ist.
- [ ] **AC-3** — WHILE die aktive Rolle „Admin" ist, SHALL das System die Admin-Navigationsgruppen (Mein Bereich, Verwaltung, Stammdaten, System) mit ihren Gruppen-Labeln und Trennern rendern.
- [ ] **AC-4** — WHILE die aktive Rolle „Verkäufer" ist (einschließlich Admin im Verkäufer-Modus), SHALL das System nur die Verkäufer-Navigationsgruppen (Mein Bereich, Konto) mit ihren Gruppen-Labeln und Trennern rendern.
- [ ] **AC-5** — WHEN der Nutzer einen Navigationseintrag anklickt, THEN SHALL Angular Router zur zugehörigen Route navigieren und der Eintrag als aktiv hervorgehoben werden.
- [ ] **AC-6** — WHEN die Artikel-Anzahl > 0 ist, THEN SHALL ein `p-badge` am Eintrag „Meine Artikel" erscheinen; bei 0 ist kein Badge sichtbar.
- [ ] **AC-7** — THE SYSTEM SHALL im Sidebar-Footer den Avatar mit dem ersten Buchstaben des Nutzernamens und Hintergrund `#3ecf8e` rendern (`p-avatar`).
- [ ] **AC-8** — WHILE die aktive Rolle „Admin" ist, SHALL das System den Role-Toggle (Admin/Verkäufer) im Footer anzeigen.
- [ ] **AC-9** — WHILE die aktive Rolle „Verkäufer" (echter Verkäufer, kein Admin im Verkäufer-Modus) ist, SHALL das System keinen Role-Toggle anzeigen.
- [ ] **AC-10** — WHEN der Nutzer den Collapse-Toggle-Button anklickt, THEN SHALL die Sidebar auf 60 px einklappen, dabei SHALL die Breite per CSS-Transition (200 ms) animiert werden.
- [ ] **AC-11** — WHILE die Sidebar eingeklappt ist, SHALL das System ausschließlich Icons anzeigen; Gruppen-Label, Gruppen-Trenner, Eintrags-Labels, Footer-Text und Role-Toggle werden ausgeblendet.
- [ ] **AC-12** — WHILE die Sidebar eingeklappt ist und der Nutzer über einen Navigationseintrag hovert, SHALL ein `pTooltip` mit dem Eintrags-Label rechts neben dem Icon erscheinen.
- [ ] **AC-13** — WHILE die Sidebar eingeklappt ist und die Artikel-Anzahl > 0 ist, SHALL ein Dot-Badge (ohne Zahlenwert) am Icon „Meine Artikel" erscheinen.
- [ ] **AC-14** — THE SYSTEM SHALL den Collapse-Zustand in `localStorage` unter dem Key `sidebar-collapsed` persistieren und beim nächsten Laden der App wiederherstellen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt und PrimeNG müssen installiert sein |

## Tags & Piles

**Tags:** #sidebar #navigation #layout #role-toggle #primeng #badge #avatar #collapse #navigation-groups

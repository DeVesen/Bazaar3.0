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

**In Scope:** Sidebar-Komponente (240 px, Teal `#1b3a4b`), Logo, rollenabhängige Navigationsgruppen, Sidebar-Footer (Avatar, Rollenname, Role-Toggle, Logout), Active-Route-Highlight, Badge für Artikel-Anzahl.

**Out of Scope:** Mobile-Burger-Menü (folgt in VSHELL-S02), Auth-Service (folgt in VSHELL-S04), tatsächliche Artikel-Zahl-API-Anbindung (folgt in Epic_Meine_Artikel).

## UI-Spezifikation

```
Admin-Sidebar (240px, #1b3a4b):
┌──────────────────────────┐
│  Basar Voranmelde        │  ← "Voranmelde" in #0e8a5f
├──────────────────────────┤
│  MEIN BEREICH            │
│  ○ Home                  │
│  ○ Meine Artikel    [5]  │  ← Badge
│  ──────────────          │
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

Verkäufer-Sidebar:
┌──────────────────────────┐
│  Basar Voranmelde        │
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

**Sidebar-Footer-Maße (aus spec.md §13.7):**

| Element | Stil |
|---|---|
| Avatar-Kreis | 36 px, `#3ecf8e`, weiß, Initial-Buchstabe 15 px 700 |
| Username | 13 px, 600, weiß |
| Role-Label | 11 px, section-label-Farbe |
| Role-Toggle-Container | `background: rgba(255,255,255,0.08)`, radius 6 px |
| Toggle-Button | flex: 1, padding 6 px 10 px; aktiv = Akzentfarbe `#0e8a5f` + weiß |
| Logout | 13 px, muted; hover = weiß; mt 8 px |

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine Sidebar-Komponente mit der Breite 240 px und dem Hintergrund `#1b3a4b` rendern.
- [ ] **AC-2** — THE SYSTEM SHALL im Logo-Block „Basar **Voranmelde**" anzeigen, wobei „Voranmelde" in `#0e8a5f` gefärbt ist.
- [ ] **AC-3** — WHILE die aktive Rolle „Admin" ist, SHALL das System die Admin-Navigationsgruppen (Mein Bereich, Verwaltung, Stammdaten, System) rendern.
- [ ] **AC-4** — WHILE die aktive Rolle „Verkäufer" ist (einschließlich Admin im Verkäufer-Modus), SHALL das System nur die Verkäufer-Navigationsgruppen (Mein Bereich, Konto) rendern.
- [ ] **AC-5** — WHEN der Nutzer einen Navigationseintrag anklickt, THEN SHALL Angular Router zur zugehörigen Route navigieren und der Eintrag als aktiv hervorgehoben werden.
- [ ] **AC-6** — WHEN die Artikel-Anzahl > 0 ist, THEN SHALL ein `p-badge` am Eintrag „Meine Artikel" erscheinen; bei 0 ist kein Badge sichtbar.
- [ ] **AC-7** — THE SYSTEM SHALL im Sidebar-Footer den Avatar mit dem ersten Buchstaben des Nutzernamens und Hintergrund `#3ecf8e` rendern (`p-avatar`).
- [ ] **AC-8** — WHILE die aktive Rolle „Admin" ist, SHALL das System den Role-Toggle (Admin/Verkäufer) im Footer anzeigen.
- [ ] **AC-9** — WHILE die aktive Rolle „Verkäufer" (echter Verkäufer, kein Admin im Verkäufer-Modus) ist, SHALL das System keinen Role-Toggle anzeigen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt und PrimeNG müssen installiert sein |

## Tags & Piles

**Tags:** #sidebar #navigation #layout #role-toggle #primeng #badge #avatar

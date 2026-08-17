---
id: VSHELL-S01
status: draft
depends-on: [VPROJ-S01]
---

# Story: Sidebar & Navigation

## Ziel

Admin und Verkäufer navigieren über eine rollenabhängige Sidebar, gebaut auf PrimeNG 22s `p-sidebar`-Compound-Familie. Admins sehen alle Bereiche; Verkäufer sehen nur „Mein Bereich" und „Konto". Der Sidebar-Footer zeigt Avatar, Rollenname, Role-Toggle (nur Admin) und Logout.

Komponenten-Details → [`components/sidebar.md`](../../../components/sidebar.md), [`components/sidebar-title.md`](../../../components/sidebar-title.md)

## Kontext

Die Voranmelde-App unterscheidet zwei Rollen. Die Sidebar zeigt nur Einträge, auf die die aktuelle Rolle Zugriff hat. Ein Admin kann ohne erneuten Login zur Verkäufer-Ansicht wechseln (Role-Toggle), um die App aus Verkäuferperspektive zu testen.

**Admin ist strukturell auch Verkäufer** (kann eigene Artikel anmelden) — die Gruppe „Mein Bereich" bleibt daher für Admin **immer sichtbar**, unabhängig vom Role-Toggle. Der Role-Toggle blendet ausschließlich die Admin-only-Gruppen (Verwaltung, Stammdaten, System) aus, nicht „Mein Bereich".

## Scope

**In Scope:** Sidebar auf Basis der PrimeNG-22-Compound-Familie `p-sidebar`/`p-sidebar-layout` (siehe Abschnitt „PrimeNG-Element-Mapping"), neue eigene Komponente `sidebar-title` (Logo+Text), rollenabhängige Navigationsgruppen mit Gruppen-Labeln, Sidebar-Footer-Inhalt (Avatar, Rollenname, Role-Toggle, Logout) im `p-sidebar-footer`-Slot, Active-Route-Highlight, Badge für Artikel-Anzahl.

**Out of Scope:** Konkretes Responsive-/Offcanvas-Verhalten inkl. vereinheitlichtem Trigger-Button (folgt in VSHELL-S02), Auth-Service (folgt in VSHELL-S04), tatsächliche Artikel-Zahl-API-Anbindung (folgt in Epic_Meine_Artikel).

## PrimeNG-Element-Mapping

| Teil | Element |
|---|---|
| Äußerer Rahmen | `p-sidebar-layout` |
| Sidebar selbst | `p-sidebar [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open"` |
| Innerer Aufbau | `p-sidebar-aside` → `p-sidebar-panel` → `p-sidebar-header` / `p-sidebar-content` / `p-sidebar-footer` |
| Logo (Header) | neue Komponente `sidebar-title` (siehe [`components/sidebar-title.md`](../../../components/sidebar-title.md)) — **kein** Collapse-Toggle mehr daneben (vereinheitlichter Trigger lebt im Content-Header, siehe VSHELL-S02) |
| Navigationsgruppe | `p-sidebar-group` (eine Instanz pro Gruppe „MEIN BEREICH" etc.) |
| Gruppen-Label | `p-sidebar-group-label` (nativ) |
| Gruppen-Inhalt | `p-sidebar-group-content` → `p-sidebar-menu` |
| Gruppen-Trenner | manuelles `<hr>` zwischen den `p-sidebar-group`-Blöcken (PrimeNG rendert keinen nativ) |
| Navigationseintrag | `p-sidebar-menu-item` → `button[pSidebarMenuButton][routerLink]` |
| Active-Highlight | nativ über `[isActive]="true"` auf `pSidebarMenuButton` (KEIN eigenes CSS/`routerLinkActive`-Handling nötig — Korrektur ggü. ursprünglicher Annahme) |
| Badge (Artikel-Anzahl) | nativ `<p-sidebar-menu-badge>{{count}}</p-sidebar-menu-badge>` innerhalb `p-sidebar-menu-item` (KEIN custom `itemTemplate` nötig — Korrektur ggü. ursprünglicher Annahme) |
| Icons | klassische PrimeIcons-CSS-Klassen (`pi pi-*`), **nicht** die neuen `@primeicons/angular`-Tree-Shakable-Komponenten aus den offiziellen v22-Demos — Konsistenz mit dem Rest des Projekts |
| Rail (`pSidebarRail`) | **nicht verwendet** — Zweck in PrimeNG-Doku nicht dokumentiert, unser Trigger-Button reicht (YAGNI) |
| Sidebar-Footer-Inhalt | Avatar/Rollenname/Role-Toggle/Logout wie bisher spezifiziert, jetzt als Inhalt im `p-sidebar-footer`-Slot statt eigener Wrapper-Komponente |

## UI-Spezifikation

### Expandierte Sidebar (240 px)

```
Admin-Sidebar (240px, #1b3a4b) — Toggle-Button lebt NICHT hier, siehe VSHELL-S02:
┌──────────────────────────┐
│  🛒 Basar Voranmelde     │  ← sidebar-title-Komponente, "Voranmelde" in #0e8a5f
├──────────────────────────┤
│  MEIN BEREICH            │  ← p-sidebar-group-label: 10px, uppercase, muted (#8ab4c4)
│  ○ Home                  │
│  ○ Meine Artikel    [5]  │  ← p-sidebar-menu-badge rechts
│  ──────────────          │  ← manuelles <hr> zwischen p-sidebar-group-Blöcken
│  VERWALTUNG              │
│  ○ Verkäufer             │
│  ○ Alle Artikel          │
│  ──────────────          │
│  STAMMDATEN              │
│  ○ Marken                │
│  ○ Kategorien            │
│  ○ Verkäufer-Typen       │
│  ──────────────          │
│  SYSTEM                  │
│  ○ Profil                │
│  ○ Einstellungen         │
│  ○ Export                │
├──────────────────────────┤  ← p-sidebar-footer (immer sichtbar)
│  [A]  Admin User         │  ← Avatar (#3ecf8e, 36px)
│       Administrator      │
│  [ Admin | Verkäufer ]   │  ← Role-Toggle
│  🚪 Abmelden             │
└──────────────────────────┘

Verkäufer-Sidebar (expandiert):
┌──────────────────────────┐
│  🛒 Basar Voranmelde     │
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

### Eingeklappte Sidebar (60 px, `[collapsible]="'icon'"`)

Zustand: nur Icons, keine Labels, keine Gruppen-Label, kein Footer-Text. Logout und Role-Toggle sind im eingeklappten Zustand nicht zugänglich — die Sidebar muss dafür aufgeklappt werden (bewusste UX-Einschränkung). Ein-/Ausklappen selbst passiert über den vereinheitlichten Trigger-Button im Content-Header (VSHELL-S02) — kein Button innerhalb der Sidebar.

```
┌────┐
│ 🛒 │  ← nur Logo-Icon, kein Toggle hier
├────┤
│ 🏠 │  ← Home (Tooltip on hover: "Home")
│ 📋•│  ← Meine Artikel (Dot-Badge wenn > 0)
│    │
│ 👥 │  ← Verkäufer
│ 📦 │  ← Alle Artikel
│    │
│ 🏷 │  ← Marken
│ 🗂 │  ← Kategorien
│ 👤 │  ← Verkäufer-Typen
│    │
│ 🔧 │  ← Profil
│ ⚙  │  ← Einstellungen
│ 📤 │  ← Export
├────┤
│[A] │  ← Avatar only, kein Name/Rolle/Logout
└────┘
```

**Hover-Verhalten eingeklappt:** Tooltip mit Label erscheint rechts neben dem Icon (PrimeNG `pTooltip`, Position `right`).
**Badge eingeklappt:** kleiner Dot-Badge am Icon (kein Zahlenwert).
**Logout/Role-Toggle eingeklappt:** nicht sichtbar und nicht erreichbar — Sidebar muss aufgeklappt werden.

**Gruppen-Label-Stil:**

| Element | Stil |
|---|---|
| Gruppen-Label (z. B. „MEIN BEREICH") | 10 px, uppercase, letter-spacing 0.08em, Farbe `#8ab4c4` (muted), padding 16 px 12 px 4 px |
| Gruppen-Trenner | `<hr>` oder border-top 1px `rgba(255,255,255,0.08)`, margin 8 px 12 px |
| Eingeklappt | Gruppen-Label und Trenner werden ausgeblendet (`display: none`) |

**Collapse-Verhalten:** wird vom vereinheitlichten Trigger-Button gesteuert (VSHELL-S02), nicht von dieser Story. Hier nur die resultierenden Breiten/Übergänge:

| Element | Stil |
|---|---|
| Sidebar-Breite expandiert | 240 px |
| Sidebar-Breite eingeklappt | 60 px |
| Übergang | `transition: width 200ms ease` (PrimeNG-Standard, ggf. via CSS-Var anpassbar) |
| Zustand persistent | `[(open)]`-State app-seitig an `localStorage` (Key `sidebar-collapsed`) koppeln, damit Zustand Reload übersteht |

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
- [ ] **AC-2** — THE SYSTEM SHALL die `sidebar-title`-Komponente im Sidebar-Header rendern, die „Basar **Voranmelde**" anzeigt, wobei „Voranmelde" in `#0e8a5f` gefärbt ist (Details → [`components/sidebar-title.md`](../../../components/sidebar-title.md)).
- [ ] **AC-3** — WHILE die aktive Rolle „Admin" ist, SHALL das System die Admin-Navigationsgruppen (Mein Bereich, Verwaltung, Stammdaten, System) als `p-sidebar-group`-Blöcke mit `p-sidebar-group-label` und `<hr>`-Trennern dazwischen rendern.
- [ ] **AC-4** — WHILE die aktive Rolle „Verkäufer" ist (einschließlich Admin im Verkäufer-Modus), SHALL das System nur die Verkäufer-Navigationsgruppen (Mein Bereich, Konto) rendern.
- [ ] **AC-5** — WHEN der Nutzer einen Navigationseintrag anklickt, THEN SHALL Angular Router zur zugehörigen Route navigieren und `pSidebarMenuButton[isActive]` auf `true` stehen (nativ, keine eigene Highlight-Logik).
- [ ] **AC-6** — WHEN die Artikel-Anzahl > 0 ist, THEN SHALL ein `p-sidebar-menu-badge` am Eintrag „Meine Artikel" erscheinen; bei 0 ist kein Badge sichtbar.
- [ ] **AC-7** — THE SYSTEM SHALL im `p-sidebar-footer`-Slot den Avatar mit dem ersten Buchstaben des Nutzernamens und Hintergrund `#3ecf8e` rendern (`p-avatar`).
- [ ] **AC-8** — WHILE die aktive Rolle „Admin" ist, SHALL das System den Role-Toggle (Admin/Verkäufer) im Footer anzeigen.
- [ ] **AC-9** — WHILE die aktive Rolle „Verkäufer" (echter Verkäufer, kein Admin im Verkäufer-Modus) ist, SHALL das System keinen Role-Toggle anzeigen.
- [ ] **AC-10** — WHEN `[collapsible]="'icon'"` aktiv wird (via Trigger aus VSHELL-S02), THEN SHALL die Sidebar auf 60 px einklappen, dabei SHALL die Breite animiert werden (PrimeNG-Standard-Transition).
- [ ] **AC-11** — WHILE die Sidebar eingeklappt ist, SHALL das System ausschließlich Icons anzeigen; Gruppen-Label, Gruppen-Trenner, Eintrags-Labels, Footer-Text, Logout und Role-Toggle werden ausgeblendet und sind nicht zugänglich (bewusste Einschränkung — Aufklappen erforderlich).
- [ ] **AC-12** — WHILE die Sidebar eingeklappt ist und der Nutzer über einen Navigationseintrag hovert, SHALL ein `pTooltip` mit dem Eintrags-Label rechts neben dem Icon erscheinen.
- [ ] **AC-13** — WHILE die Sidebar eingeklappt ist und die Artikel-Anzahl > 0 ist, SHALL ein Dot-Badge (ohne Zahlenwert) am Icon „Meine Artikel" erscheinen.
- [ ] **AC-14** — THE SYSTEM SHALL den Collapse-Zustand (`p-sidebar`-`open`-State) in `localStorage` unter dem Key `sidebar-collapsed` persistieren und beim nächsten Laden der App wiederherstellen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | Angular-Projekt und PrimeNG müssen installiert sein |

## Tags & Piles

**Tags:** #sidebar #navigation #layout #role-toggle #primeng #badge #avatar #collapse #navigation-groups

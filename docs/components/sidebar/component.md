---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: sidebar (PrimeNG 22 Compound)

Basis ist die PrimeNG-22-`Sidebar`-Compound-Familie (`primeng/sidebar`, stabil seit `22.0.0`) — kein selbstgebauter Ersatz, aber auch keine reine 1:1-Instanziierung: die Slots werden mit eigenen Bausteinen gefüllt ([sidebar-title.md](../../requirements/advance-registration/components/sidebar-title.md) im Header, [sidebar-footer.md](../sidebar-footer/component.md) im Footer). Ersetzt die ursprünglich geplante, komplett selbstgebaute Sidebar.

**Verwendung:** beide Apps. Der Compound, der Slot-Aufbau und das Active-Highlight sind identisch; app-spezifisch sind nur Farben, Gruppen und Einträge.

| Aspekt | Voranmelde-App | Haupt-App |
|---|---|---|
| Breite expandiert | 240 px | 228 px |
| Hintergrund | Teal `#1b3a4b` | Navy `var(--sidebar-bg)` |
| Gruppen | Mein Bereich · Verwaltung · Stammdaten · System | Tagesgeschäft · Stammdaten · System |
| Rollenabhängigkeit | Verkäufer sieht nur „Mein Bereich" und „Konto" | Kassenpersonal sieht alles außer „Einstellungen" |
| Role-Toggle im Footer | **ja** — der Admin erfasst selbst Artikel und braucht die Verkäufer-Ansicht | **nein** — der Admin hat alle Rechte des Kassenpersonals, ein Toggle würde ihm nur künstlich Rechte wegnehmen |
| Eingeklappter Zustand | `[collapsible]="'icon'"`, 60 px | dito |
| Badge am Eintrag | Anzahl eigener Artikel | Anzahl offener Artikel (`releasedAt` leer) |
| Labels | über ngx-translate (DE/EN) | feste deutsche Konstanten — die App ist einsprachig |

**Die Komponente ist eine Dumb Component:** Sie erhält ihre Einträge — Label, Icon, Route, Badge-Zahl — als Input und kennt weder Übersetzung noch Datenbeschaffung. Genau dadurch trägt sie beide Apps: Die Voranmelde-App füttert übersetzte Strings hinein, die Haupt-App deutsche Konstanten, und die i18n-Entscheidung bleibt in der App.

Die konkreten Einträge je App stehen in den jeweiligen Shell-Stories (VSHELL-S01 bzw. BSHELL-S01), nicht hier — sie ändern sich mit der Navigation, nicht mit der Komponente.

## Kontext (voller Shell-Ausschnitt)

```
┌──────────────────────────┬───────────────────────────────┐
│  🛒 Basar Voranmelde     │  [☰] ← Trigger (VSHELL-S02)   │
│  ────────────────────── │───────────────────────────────│
│  MEIN BEREICH            │                               │
│  ○ Home                  │      <router-outlet>          │
│  ○ Meine Artikel    [5]  │                               │
│  ──────────────          │                               │
│  VERWALTUNG              │                               │
│  ○ Verkäufer             │                               │
│  ○ Alle Artikel          │                               │
│  ──────────────          │                               │
│  STAMMDATEN               │                              │
│  ○ Marken                │                               │
│  ○ Kategorien            │                               │
│  ○ Verkäufer-Typen       │                               │
│  ──────────────          │                               │
│  SYSTEM                  │                               │
│  ○ Profil                │                               │
│  ○ Einstellungen         │                               │
│  ○ Export                │                               │
├──────────────────────────┤                               │
│  [A]  Admin User          │                              │
│       Administrator      │                               │
│  [ Admin | Verkäufer ]   │                               │
│  🚪 Abmelden             │                               │
└──────────────────────────┴───────────────────────────────┘
```

## Struktur (verbindlich)

```
p-sidebar-layout
  p-sidebar-backdrop                      (nur Mobile, wenn offen)
  p-sidebar id="app-nav"
            [collapsible]="isMobile() ? 'offcanvas' : 'icon'"
            [overlay]="isMobile()"
            [(open)]="open"
    p-sidebar-aside
      p-sidebar-panel
        p-sidebar-header
          sidebar-title                    (siehe components/sidebar-title.md)
        p-sidebar-content
          p-sidebar-group                  (1× pro Nav-Gruppe, z. B. "Mein Bereich")
            p-sidebar-group-label          Gruppen-Name
            p-sidebar-group-content
              p-sidebar-menu
                p-sidebar-menu-item        (1× pro Eintrag)
                  button[pSidebarMenuButton][routerLink][isActive]
                    i.pi.pi-*              Icon (klassische PrimeIcon-Klasse)
                    span                   Label
                  p-sidebar-menu-badge     (nur "Meine Artikel", nur wenn count > 0)
          <hr>                             (manuell zwischen den Gruppen-Blöcken)
        p-sidebar-footer
          [Avatar/Rollenname/Role-Toggle/Logout — Inhalt wie bisher, jetzt in diesem Slot]
  p-sidebar-main                           (siehe VSHELL-S02 für Content-Header/Trigger)
```

## Rollenabhängigkeit (Gruppen-Filterung)

Die Liste der `p-sidebar-group`-Blöcke wird clientseitig nach aktiver Rolle gefiltert:

| Rolle | Sichtbare Gruppen |
|---|---|
| Admin | Mein Bereich, Verwaltung, Stammdaten, System |
| Verkäufer (auch Admin im Verkäufer-Modus) | Mein Bereich, Konto |

„Mein Bereich" ist für Admin immer sichtbar (siehe VSHELL-S01 Kontext — Admin ist strukturell auch Verkäufer).

## Bewusst nicht verwendet

- **`pSidebarRail`** — Zweck in der PrimeNG-Doku nicht als Fließtext dokumentiert (nur eine CSS-Klassen-Zeile gefunden). Unser Trigger-Button deckt das Ein-/Ausklappen bereits ab (YAGNI).
- **`@primeicons/angular`-Icon-Komponenten** (`<svg data-p-icon="...">`) — die offiziellen PrimeNG-22-Demos nutzen dieses neue Tree-Shakable-System, wir bleiben bei klassischen `pi pi-*`-CSS-Klassen für Konsistenz mit dem Rest des Projekts.

## Akzeptanzkriterien

Siehe VSHELL-S01 (Sidebar-Inhalt/Rollen/Badge/Active-State) und VSHELL-S02 (Collapse/Offcanvas/Trigger) — diese Datei ist die strukturelle Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #sidebar #app-shell #primeng-22 #compound-component #navigation

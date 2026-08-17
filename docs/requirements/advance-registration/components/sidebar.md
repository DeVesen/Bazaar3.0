---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: sidebar (PrimeNG 22 Compound)

Kein eigener Wrapper — Instanziierung der PrimeNG-22-`Sidebar`-Compound-Familie (`primeng/sidebar`, stabil seit `22.0.0`). Ersetzt die ursprünglich geplante, komplett selbstgebaute Sidebar.

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

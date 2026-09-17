---
round: Round-6
status: geplant
---

# Plan: Round 6 — Sidebar & Navigation

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

Aus [Round-1/plan.md](../Round-1/plan.md) vorhanden: `src/bazaar-app/frontend/` mit
Standalone Components/OnPush/Signals, PrimeNG 22 + `@lucide/angular` +
`provideLucideConfig` bereits in `app.config.ts` registriert (ohne Theme-Preset),
Verzeichnisse `features/`, `core/`, `shared/` mit Path-Aliases `@core/*`, `@shared/*`,
`@features/*`, ESLint-Boundaries (`core`/`shared` importieren nie aus `features`).

Rounds 2–5 (Backend, Docker, Tests) liefern nichts, das Round-6 (reines Frontend)
braucht.

## Implementationsplan

### 1. Verzeichnis & Grundgerüst

```
src/app/core/shell/sidebar/
├── sidebar.ts
├── sidebar.html
└── sidebar.scss
```

Analog zur Referenz-Struktur
[`core/shell/sidebar/`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar) —
kein separates `sidebar-title.ts` in Round-6, da der Logo-Block hier direkt Bestandteil
der Sidebar ist (kein Voranmelde-App-spezifisches Icon/Logo-Wechsel-Bedürfnis).

### 2. PrimeNG-Sidebar-Compound importieren

`SidebarModule` aus `primeng/sidebar`, `AvatarModule` aus `primeng/avatar`,
`ButtonModule` aus `primeng/button`, `BadgeModule` aus `primeng/badge` (für AC-6),
`RouterLink`/`RouterLinkActive`.

### 3. `sidebar.ts` — Komponente

```typescript
import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { LucideLogOut } from '@lucide/angular';

export type Role = 'admin' | 'cashier';

interface NavItem {
  label: string;
  route: string;
  badgeCount?: () => number;
}

interface NavGroup {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AvatarModule, ButtonModule, BadgeModule, SidebarModule, LucideLogOut],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly role = input.required<Role>();
  readonly username = input.required<string>();
  readonly roleLabel = input.required<string>();
  readonly openArticlesCount = input(0);
  readonly logoutClicked = output<void>();

  private readonly navGroups: NavGroup[] = [
    { label: 'Tagesgeschäft', items: [
      { label: 'Artikelannahme', route: '/intake' },
      { label: 'Verkauf', route: '/checkout' },
      { label: 'Abrechnung', route: '/settlement' },
    ]},
    { label: 'Stammdaten', items: [
      { label: 'Verkäufer', route: '/sellers' },
      { label: 'Artikel', route: '/articles' },
      { label: 'Marken', route: '/brands' },
      { label: 'Kategorien', route: '/categories' },
      { label: 'Verkäufer-Typen', route: '/seller-types' },
    ]},
    { label: 'System', items: [
      { label: 'Statistik', route: '/statistics' },
      { label: 'Einstellungen', route: '/settings', adminOnly: true } as unknown as NavItem,
    ]},
  ];

  readonly visibleGroups = computed(() =>
    this.navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.role() === 'admin' || !this.isSettingsItem(item)),
    })),
  );

  readonly initials = computed(() => this.username().charAt(0).toUpperCase());

  private isSettingsItem(item: NavItem): boolean {
    return item.route === '/settings';
  }
}
```

**Hinweis zur Rollenfilterung:** Anders als in der Referenz-App (ganze Gruppen werden
je Rolle ein-/ausgeblendet) verlangt BSHELL-S01 AC-3c nur das **einzelne** Ausblenden
von „Einstellungen" innerhalb der Gruppe „System" — Admin und Kassenpersonal sehen
dieselben drei Gruppen, nur der eine Eintrag unterscheidet sich. Deshalb Filterung auf
Item-Ebene, nicht auf Gruppen-Ebene (kein 1:1-Kopieren der Referenz-Struktur an dieser
Stelle nötig, da BSHELL-S01 hier einfacher ist als VSHELL-S01).

`output<void>()` für Logout statt eines injizierten `AuthService.logout()` — die
aufrufende Shell-Komponente (Round 7/9) reagiert auf das Event; erst Round-9 verdrahtet
das tatsächlich mit `AuthService`.

### 4. `sidebar.html` — Template

Struktur analog
[`sidebar.html`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.html)
(PrimeNG-Compound-Slots `p-sidebar-aside` → `p-sidebar-panel` → `p-sidebar-header` /
`-content` / `-footer`), aber:

- Logo-Block statt `<app-sidebar-title />` direkt im `p-sidebar-header`: „Bazaar
  **Suite**" mit „Suite" in `<span class="accent">` (AC-2).
- `<hr>` zwischen den drei Gruppen (AC-3), Section-Label per
  `p-sidebar-group-label` in Großbuchstaben (`group.label.toUpperCase()`, AC-3).
- Je Nav-Item: `<svg data-p-icon="…">`-Ersatz durch das passende Lucide-Icon
  (Icon-Zuordnung siehe Schritt 6), `routerLink`, `routerLinkActive="active"` (AC-4,
  AC-5).
- Badge nur am Eintrag „Artikelannahme": `<p-badge [value]="openArticlesCount()"
  *ngIf="openArticlesCount() > 0" />` (AC-6) — kein `*ngIf`, da Standalone/Control-Flow
  bevorzugt: `@if (openArticlesCount() > 0) { <p-badge [value]="openArticlesCount()" /> }`.
- Footer: `p-avatar [label]="initials()"`, `<span>{{ username() }}</span>`,
  `<span>{{ roleLabel() }}</span>`, Logout-Button mit `(click)="logoutClicked.emit()"`
  und `<svg lucideLogOut></svg>` (AC-3d) — **kein** `p-selectbutton`/Role-Toggle (BSHELL
  hat keinen, anders als VSHELL).

```html
<p-sidebar-aside>
  <p-sidebar-panel>
    <p-sidebar-header>
      <div class="logo-block">Bazaar <span class="accent">Suite</span></div>
    </p-sidebar-header>
    <p-sidebar-content>
      @for (group of visibleGroups(); track group.label) {
        <p-sidebar-group>
          <p-sidebar-group-label>{{ group.label.toUpperCase() }}</p-sidebar-group-label>
          <p-sidebar-group-content>
            <p-sidebar-menu>
              @for (item of group.items; track item.route) {
                <p-sidebar-menu-item>
                  <button pSidebarMenuButton [routerLink]="item.route" routerLinkActive="active" #rla="routerLinkActive" [isActive]="rla.isActive">
                    <span>{{ item.label }}</span>
                    @if (item.route === '/intake' && openArticlesCount() > 0) {
                      <p-badge [value]="openArticlesCount()" />
                    }
                  </button>
                </p-sidebar-menu-item>
              }
            </p-sidebar-menu>
          </p-sidebar-group-content>
        </p-sidebar-group>
        <hr />
      }
    </p-sidebar-content>
    <p-sidebar-footer>
      <p-avatar [label]="initials()" shape="circle" />
      <span class="sidebar-username">{{ username() }}</span>
      <span class="sidebar-role">{{ roleLabel() }}</span>
      <button pButton link (click)="logoutClicked.emit()">
        <svg lucideLogOut></svg>
        <span>Abmelden</span>
      </button>
    </p-sidebar-footer>
  </p-sidebar-panel>
</p-sidebar-aside>
```

**Wichtig:** `p-sidebar-spacer` gehört laut
[`docs/components/sidebar/component.md`](../../../../components/sidebar/component.md)
(Warnhinweis zum PrimeNG-CSS-Selektor) **direkt** unter `p-sidebar` im umgebenden
Shell-Template, **nicht** in diese `app-sidebar`-Komponente — Round-6 liefert nur den
Inhalt von `p-sidebar-aside`; `p-sidebar` selbst mit `p-sidebar-spacer` entsteht erst in
Round 7 (Shell/Layout).

### 5. `sidebar.scss` — Maße

Aus BSHELL-S01 „Maße"-Tabelle: Breite 228 px, Logo-Block-Padding `20px 18px 16px`,
Section-Label `10px/700/uppercase/1.2px letter-spacing`, Trennlinie `1px solid
var(--color-divider)` mit `margin: 0 14px`, Nav-Item-Padding `9px 18px`, Nav-Item-Font
`13.5px`, Nav-Icon `16px`/Breite `18px`. Farben (`var(--color-surface)`,
`var(--color-accent)`) als CSS-Custom-Properties referenzieren, **ohne** Werte zu
definieren (AC-1, AC-2 — Tokens kommen erst in Round 8; bis dahin greift ein
Browser-Default/Fallback, das für Round-6 nicht weiter spezifiziert werden muss).
BSHELL-S01s wörtliche Trennlinien-Angabe `rgba(255,255,255,0.07)` setzt eine dunkle
Fläche voraus — mit der Nachtrags-Entscheidung (helle Sidebar) durch das ohnehin
vorhandene `--color-divider`-Token aus dem Industry-Styleguide ersetzt, statt einen
neuen, nicht token-basierten Hex-/RGBA-Wert einzuführen.

### 6. Icon-Zuordnung (AC-7, angepasst auf Lucide)

Je Nav-Item ein passendes Lucide-Icon importieren (`@lucide/angular`), analog zum
Referenz-Import `LucideLogOut`. Icon-Namen aus der Komponenten-Doku
(`docs/components/sidebar/component.md`, `docs/components/**`) gegen die tatsächlich in
`@lucide/angular` existierenden Namen prüfen — deckt sich mit dem in
[Round-1/plan.md](../Round-1/plan.md) Schritt 10 angelegten Icon-Namen-Abgleich; hier
nur die konkreten Sidebar-Icons ergänzen (z. B. `LucideInbox` für Artikelannahme,
`LucideShoppingCart` für Verkauf, `LucideReceipt` für Abrechnung, `LucideUsers` für
Verkäufer, `LucideTag` für Artikel, `LucideBookmark` für Marken, `LucideFolder` für
Kategorien, `LucideUserCog` für Verkäufer-Typen, `LucideBarChart3` für Statistik,
`LucideSettings` für Einstellungen — konkrete Wahl beim Implementieren gegen die
Lucide-Katalog-Suche verifizieren, nicht blind übernehmen).

### 7. Testbarkeit (Beispieltest analog Round-5)

`sidebar.spec.ts` mit `TestBed`, `provideRouter([])` (für `RouterLink`), setzt
`role`/`username`/`roleLabel` per `fixture.componentRef.setInput(...)`:

- Test: `role = 'cashier'` → „Einstellungen" nicht im DOM (AC-3c).
- Test: `role = 'admin'` → „Einstellungen" im DOM.
- Test: `openArticlesCount = 0` → kein `p-badge` sichtbar; `openArticlesCount = 3` →
  `p-badge` mit `3` sichtbar (AC-6).
- Test: `logoutClicked` emittiert bei Klick auf „Abmelden".

### 8. Verifikation

- `ng serve`, Sidebar isoliert in einer temporären Test-Route rendern (echte Einbindung
  in die Shell folgt erst Round 7) — visueller Abgleich gegen die ASCII-Skizze aus
  BSHELL-S01.
- `npm test` — alle Sidebar-Spec-Fälle grün.
- `ng lint` — keine Boundary-Verstöße (`core/shell/sidebar` importiert nichts aus
  `features/`).

## Reihenfolge

1 → 2 → 3 → 4 → 5 sequenziell (Struktur vor Komponente vor Template vor Styling), 6 kann
parallel zu 4–5 erarbeitet werden, 7 nach 3–4, 8 abschließend.

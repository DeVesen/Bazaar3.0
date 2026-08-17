---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: sidebar-footer (Inhalt im `p-sidebar-footer`-Slot)

Kein eigener Wrapper mehr — Inhalt lebt direkt im `p-sidebar-footer`-Slot des Sidebar-Compounds (siehe [sidebar.md](sidebar.md)). Immer sichtbar, kein Popup-Pattern (bewusste Abweichung von den offiziellen PrimeNG-Demos, die Logout/Settings hinter einem Klick-Popup verstecken — hier soll gerade der Admin-Role-Toggle ohne Extra-Klick erreichbar bleiben).

## Kontext (voller Footer-Ausschnitt)

```
├──────────────────────────┤  ← p-sidebar-footer
│  [A]  Admin User          │
│       Administrator      │
│  [ Admin | Verkäufer ]   │
│  🚪 Abmelden             │
└──────────────────────────┘
```

## Aufbau

| Element | Umsetzung |
|---|---|
| Avatar-Kreis | `p-avatar [label]="initial"`, `style="background-color: #3ecf8e; color: white"`, 36 px |
| Username | `<span>`, 13 px, `font-weight: 600`, weiß |
| Role-Label | `<span>`, 11 px, section-label-Farbe |
| Role-Toggle | `p-selectbutton` (`options: ['Admin', 'Verkäufer']`) — **nur wenn Rolle Admin ist** |
| Logout | eigenständiger [Button](../standard/button.md) `link`-Variante mit Icon (`pi pi-sign-out`) + Text „Abmelden" |

## Sichtbarkeit

| Element | Bedingung |
|---|---|
| Avatar, Username, Role-Label | immer sichtbar (auch eingeklappt: nur Avatar) |
| Role-Toggle | nur Rolle Admin — Verkäufer sieht ihn nicht |
| Logout | immer sichtbar |
| Eingeklappt (60 px) | nur Avatar sichtbar, Rest ausgeblendet und nicht erreichbar (Sidebar muss aufgeklappt werden) |

Shared-Component-Doc → [`docs/components/sidebar-footer/component.md`](../../../../components/sidebar-footer/component.md) — dort mit `p-avatar` konsistent aktualisiert (vormaliger Widerspruch „kein PrimeNG-Avatar-Äquivalent" behoben).

## Akzeptanzkriterien

Siehe VSHELL-S01 AC-7/8/9 — diese Datei ist die Struktur-Referenz für den Footer-Inhalt, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #sidebar-footer #app-shell #avatar #role-toggle #logout #primeng

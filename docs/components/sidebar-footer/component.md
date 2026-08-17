---
id: C-009
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Sidebar-Footer

**Bibliothek:** `p-avatar` (Avatar) + `p-selectbutton` (Role-Toggle) + `<button pButton link>` (Logout) — kein eigener Wrapper mehr
**Verwendung:** Beide Apps — Inhalt lebt im `p-sidebar-footer`-Slot des Sidebar-Compounds. Der Role-Toggle ist optional und wird nur von der Voranmelde-App eingeschaltet.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Elemente & PrimeNG-Mapping
- 3. Sichtbarkeit & Verhalten — Bedingungen
- 4. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Footer-Bereich der Sidebar mit Benutzeridentität, Rollen-Toggle und Logout.

**Verwendungszweck:** Wird im `p-sidebar-footer`-Slot der App-weiten Sidebar angezeigt, immer sichtbar (kein Popup-Pattern — bewusste Abweichung von den offiziellen PrimeNG-Demos, da der Admin-Role-Toggle ohne Extra-Klick erreichbar bleiben soll).

Avatar, Benutzername, Rollenname und Logout sind in **beiden Apps identisch**; der Unterschied ist ein einziges Element, der Role-Toggle. Darum eine Komponente mit optionalem Toggle statt zweier Footer, die Avatar-, Namens- und Logout-Layout doppeln.

---

## Überblick

Der Sidebar-Footer zeigt die Identität des angemeldeten Nutzers (Avatar, Username, Rolle) und enthält die Logout-Aktion. In der Voranmelde-App ermöglicht er Admins zusätzlich den Wechsel zwischen den Rollen Admin und Verkäufer.

**Beide Apps** — mit einem Unterschied:

| App | Role-Toggle |
|---|---|
| Voranmelde-App | **ja** — der Admin erfasst selbst Artikel und braucht die Verkäufer-Ansicht |
| Haupt-App | **nein** — der Admin hat alle Rechte des Kassenpersonals; ein Toggle würde ihm nur künstlich Rechte wegnehmen |

---

## 1. ASCII-Darstellung

```
├──────────────────────────┤  ← p-sidebar-footer
│  [A]  Admin User          │
│       Administrator      │
│  [ Admin | Verkäufer ]   │
│  🚪 Abmelden             │
└──────────────────────────┘
```

---

## 2. Aufbau

| Element | Umsetzung |
|---|---|
| Avatar-Kreis | `p-avatar [label]="initial"`, `style="background-color: #3ecf8e; color: white"`, 36 px |
| Username | `<span>`, 13 px, `font-weight: 600`, weiß |
| Role-Label | `<span>`, 11 px, section-label-Farbe |
| Role-Toggle | `p-selectbutton` (`options: ['Admin', 'Verkäufer']`) — **nur wenn Rolle Admin ist** |
| Logout | eigenständiger `<button pButton link>` mit Icon (`pi pi-sign-out`) + Text „Abmelden" |

---

## 3. Sichtbarkeit & Verhalten

| Element | Bedingung |
|---|---|
| Avatar, Username, Role-Label | Immer sichtbar (auch eingeklappt: nur Avatar) |
| Role-Toggle | Nur Voranmelde-App und dort nur Rolle Admin — Verkäufer sieht ihn nicht, die Haupt-App zeigt ihn nie |
| Logout | Immer sichtbar |
| Eingeklappt (60 px) | nur Avatar sichtbar, Rest ausgeblendet und nicht erreichbar (Sidebar muss aufgeklappt werden) |

Der Role-Toggle erlaubt Admins, zwischen der Admin-Ansicht und der Verkäufer-Ansicht zu wechseln. Der aktive Modus wird durch die Akzentfarbe und weiße Schrift hervorgehoben.

---

## 4. PrimeNG-Basis

```
p-avatar          ← Avatar-Kreis mit Initial-Buchstaben
p-selectbutton    ← Role-Toggle (Admin/Verkäufer)
button pButton link ← Logout-Aktion
```

---

## Akzeptanzkriterien

Verbindliche Kriterien stehen in den Shell-Stories der Apps, nicht hier: [VSHELL-S01](../../requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S01-sidebar-navigation.md) AC-7/8/9 für die Voranmelde-App, [BSHELL-S01](../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S01-sidebar-navigation.md) AC-3d für die Haupt-App.

Diese Datei ist die **Struktur-Referenz** für den Footer-Inhalt — es gibt keine zweite Beschreibung davon.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #sidebar-footer #avatar #role-toggle #logout #voranmelde-app

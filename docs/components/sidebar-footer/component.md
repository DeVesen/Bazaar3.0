---
id: C-009
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Sidebar-Footer

**Bibliothek:** `p-avatar` (Avatar) + `p-selectbutton` (Role-Toggle) + `<button pButton link>` (Logout) — kein eigener Wrapper mehr
**Verwendung:** Nur Voranmelde-App — Inhalt lebt im `p-sidebar-footer`-Slot des Sidebar-Compounds

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

---

## Überblick

Der Sidebar-Footer zeigt die Identität des angemeldeten Nutzers (Avatar, Username, Rolle), ermöglicht Admins den Wechsel zwischen den Rollen Admin und Verkäufer, und enthält die Logout-Aktion.

**Nur Voranmelde-App.** Dieser Footer ist nicht Bestandteil der Haupt-App.

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
| Role-Toggle | Nur Rolle Admin — Verkäufer sieht ihn nicht |
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

Siehe [Epic_App_Shell](../../requirements/advance-registration/epics/Epic_App_Shell/epic.md) VSHELL-S01 AC-7/8/9 — dort die Struktur-Referenz ([`components/sidebar-footer.md`](../../requirements/advance-registration/components/custom/sidebar-footer.md)), keine eigenen zusätzlichen AC hier.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #sidebar-footer #avatar #role-toggle #logout #voranmelde-app

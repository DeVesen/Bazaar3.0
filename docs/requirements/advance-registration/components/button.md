---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Button

Ein PrimeNG-Element (`p-button`/`pButton`), Varianten ausschließlich über Properties — keine separaten Komponenten.

## Bild

```
[ Speichern ]        ← Primary
[ Abbrechen ]         ← Secondary Outlined
Registrieren →        ← Text/Link
[ 🗑 Löschen ]        ← Danger
[ 🔍 Suchen ]         ← Icon + Text
```

## Aufbau & Varianten

| Variante | Umsetzung | Verwendung |
|---|---|---|
| Primary | `p-button severity="primary"` | Speichern, Anmelden, Registrieren, Exportieren |
| Secondary Outlined | `p-button secondary outlined` | Abbrechen |
| Danger | `p-button severity="danger"` | Löschen |
| Text/Link | `p-button [text]="true"` bzw. `pButton link` | Registrierung-Link, Logout |
| Icon + Text | `p-button icon="pi pi-search"` + Textlabel | Suchen-Button (Filter-Panel) |
| Small Outlined | `p-button secondary outlined size="small"` | Einladungs-Link generieren, Block löschen |

## Verwendung

Praktisch jede Komponente mit Formular/Dialog/Aktion — siehe die jeweiligen `Aufbau`-Tabellen (login-form, registrierung-form, artikel-dialog, kategorie-popup, marke-popup, typ-popup, filter-panel, sidebar-footer, export-panel, verkaeufer-dialog, profil-page).

## Tags & Piles

**Tags:** #button #pbutton #primitive #shared-across-epics

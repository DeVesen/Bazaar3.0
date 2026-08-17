---
status: draft
reviewed-date: 2026-08-17
---

# Components — Voranmelde-App

App-lokale Komponenten-Dokumente, gruppiert nach Bauart. Suite-weite Komponenten
(beide Apps) liegen dagegen unter [`docs/components/`](../../../components/overview.md)
und werden von hier nur verlinkt, nie dupliziert.

| Gruppe | Definition |
|---|---|
| [Standard](#standard) | Entspricht 1:1 einem PrimeNG-Einsatz — Varianten über Properties, kein eigener Wrapper |
| [Custom](#custom) | Kombination mehrerer Standard-Bausteine zu einem eigenen Baustein |
| [Forms](#forms) | Formulare, Dialoge, Modals, Panels mit Aktion |

---

## Standard

| Komponente | PrimeNG | Kurz |
|---|---|---|
| [input.md](standard/input.md) | `pInputText`, `p-iconfield`, `pInputPassword`, `p-inputnumber` | Eingabefeld in vier Varianten: Text, Icon, Password, Number |
| [select.md](standard/select.md) | `p-select`, `p-autoComplete` | Wert aus Liste wählen — Varianten Dropdown und Type-Ahead |
| [boolean-input.md](standard/boolean-input.md) | `p-checkbox`, `p-toggleswitch` | Ja/Nein-Wert — Varianten Checkbox und Switch |
| [button.md](standard/button.md) | `p-button` | Alle Varianten über Properties, keine separaten Komponenten |
| [datepicker.md](standard/datepicker.md) | `p-datepicker` | Datum + Uhrzeit kombiniert |
| [confirmdialog.md](standard/confirmdialog.md) | `p-confirmdialog` | Bestätigung vor irreversiblen Aktionen |
| [toast.md](standard/toast.md) | `p-toast` | Kurze Erfolgs-/Fehlermeldung mit Auto-Dismiss |

## Custom

| Komponente | Kurz |
|---|---|
| [sidebar.md](custom/sidebar.md) | Shell-Sidebar auf Basis der `primeng/sidebar`-Compound-Familie, mit eigenen Slot-Inhalten (Title, Footer) |
| [password-strength-meter.md](custom/password-strength-meter.md) | Stärke-Anzeige aus `p-progressbar` + `p-tag` — PrimeNG liefert keine fertige |
| [filter-panel.md](custom/filter-panel.md) | Such-/Filterzeile über der Tabelle (`card`-Filter-Variante), nicht das Spalten-Filter-Menü |
| [block-liste.md](custom/block-liste.md) | Read-only-Liste der Nummernblöcke im Verkäufer-Dialog |
| [sidebar-title.md](custom/sidebar-title.md) | Logo-Icon + Markenname im `p-sidebar-header`-Slot |
| [sidebar-footer.md](custom/sidebar-footer.md) | Avatar, Rolle, Role-Toggle, Logout im `p-sidebar-footer`-Slot |
| [login-layout.md](custom/login-layout.md) | 2-Spalten-Grid für Login- und Registrierungsseite |
| [login-info-panel.md](custom/login-info-panel.md) | Linke Login-Spalte: Countdown, Default-Konditionen, Markdown-Infotext |
| [home-dashboard.md](custom/home-dashboard.md) | Kachel-Grid der Home-Seite, rollenabhängig 4 oder 5 Kacheln |
| [verkaeufer-nummer.md](custom/verkaeufer-nummer.md) | Eigene Verkäufernummer im Klartext + QR-Code (Varianten `card` und `inline`) |
| [countdown-timeline-page.md](custom/countdown-timeline-page.md) | Öffentliche Timeline-Seite ohne Shell |

## Forms

[form.md](forms/form.md) hält die Querschnitts-Regeln, die für **alle** Einträge dieser
Gruppe gelten (Feldfehler, Submit-Sperre, Enter-Submit, Feedback-Wahl, Confirmdialog,
Readonly, Autofokus). Die visuelle Hülle steht in den Suite-Docs
[`card`](../../../components/card/component.md) und
[`modal`](../../../components/modal/component.md).

| Komponente | Typ | Kurz |
|---|---|---|
| [form.md](forms/form.md) | Querschnitt | Regeln R-1 bis R-7 für alle Formulare |
| [login-form.md](forms/login-form.md) | Seiten-Formular | E-Mail + Passwort, Passwort-vergessen-Popover |
| [registrierung-form.md](forms/registrierung-form.md) | Seiten-Formular | E-Mail, Passwort + Bestätigung, Stärke-Meter |
| [einstellungen-form.md](forms/einstellungen-form.md) | Seiten-Formular | Basar-Termine, Nummernblock-Parameter, Infotext |
| [profil-page.md](forms/profil-page.md) | Seiten-Formular | Drei Tabs: Steckbrief, Zugangsdaten, Löschen |
| [export-panel.md](forms/export-panel.md) | Panel mit Aktion | Export-Optionen + Ergebnis-Info-Area |
| [stammdaten-popup.md](forms/stammdaten-popup.md) | Modal `sm` | Anlegen/Bearbeiten für Marke und Kategorie |
| [typ-popup.md](forms/typ-popup.md) | Modal `sm` | Anlegen/Bearbeiten Verkäufer-Typ (Name, Provision, Gebühr) |
| [artikel-dialog.md](forms/artikel-dialog.md) | Modal Standard | Artikel bearbeiten inkl. Löschen |
| [artikel-readonly-modal.md](forms/artikel-readonly-modal.md) | Modal Standard | Artikel ansehen (Alle Artikel), alle Felder readonly |
| [verkaeufer-dialog.md](forms/verkaeufer-dialog.md) | Modal `lg` | Verkäufer anlegen/bearbeiten inkl. Nummernblöcke |

---

## Komponenten-Rollen: Integration vs. Leaf

Querschnittsregel für **alle** Komponenten der App — steht hier einmal, statt in
jedem der 14 Epics wiederholt zu werden.

| Rolle | Ort | Darf | Darf nicht |
|---|---|---|---|
| **Integration** | `features/<feature>/pages/<x>.page.ts` | Store/Service injizieren, Kind-Komponenten verdrahten, Layout setzen, Ergebnisse von `output()` verarbeiten | eigene Render-/Fachlogik enthalten |
| **Leaf** | `features/<feature>/components/**`, `shared/**` | `input()` lesen, `output()` feuern, rendern | Service oder Store injizieren, HTTP aufrufen, navigieren |

Keine Komponente ist beides. Konkrete Folgen für die Einträge oben:

- **Dialoge und Modals** (`artikel-dialog`, `verkaeufer-dialog`, `stammdaten-popup`,
  `typ-popup`, `artikel-readonly-modal`) sind **Leaf**: sie bekommen ihre Daten per
  `input()` und geben das Ergebnis per `output()` an die Page zurück. Sie injizieren
  **keinen** Store und rufen selbst keine API.
- **Panels und Listen** (`filter-panel`, `block-liste`, `home-dashboard`,
  `verkaeufer-nummer`, `login-info-panel`, `export-panel`) sind ebenfalls Leaf — auch `export-panel`, dessen
  Klick nur ein `output()` auslöst; den Download startet die Page.
- **Ausnahme Shell:** `sidebar` und `sidebar-footer` dürfen `AuthService`/`RoleService`
  injizieren. Sie sind Teil der App-Shell, nicht eines Features, und haben keine
  übergeordnete Page, die den Zustand durchreichen könnte.

## Einordnungsregeln

- Ein Element, das exakt einer PrimeNG-Komponente entspricht, gehört nach **Standard** —
  auch dann, wenn es mehrere Varianten kennt (die Variante ist eine Property-Belegung).
- Sobald mehrere Standard-Bausteine zu einem benannten, wiederverwendbaren Ganzen
  kombiniert werden, gehört es nach **Custom**.
- Alles mit Absende-/Speichern-Semantik gehört nach **Forms**, unabhängig davon, ob es
  Seite, Panel oder Modal ist.
- Zeigt sich eine Komponente als in **beiden** Apps identisch, gehört sie nicht hierher,
  sondern nach [`docs/components/`](../../../components/overview.md).

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #components #overview #primeng #struktur

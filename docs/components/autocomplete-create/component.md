# Component: AutoComplete-Create

**Bibliothek:** Erweiterung von `p-autocomplete` — eigener Wrapper mit Anlegen-Flow
**Verwendung:** Beide Apps — überall dort, wo aus einer Liste gewählt werden kann und neue Einträge direkt beim Eingeben angelegt werden können.

---

## Überblick

`AutoComplete-Create` ist ein erweitertes Eingabefeld mit zwei Modi:

- **▾-Modus** — Bestehenden Eintrag auswählen (Dropdown bei Fokus oder Klick)
- **+-Modus** — Neuen Eintrag anlegen (Button wechselt zu grünem **+**, öffnet Anlegen-Modal)

Der Wechsel zwischen den Modi erfolgt **automatisch** anhand des eingetippten Werts: Entspricht er keinem bestehenden Eintrag exakt, wechselt der Button zu **+**.

Typische Verwendung: Kategorie-Feld und Marke-Feld bei der Artikel-Eingabe.

---

## 1. ASCII-Darstellung

```
▾-Modus — bestehender Eintrag auswählbar:
┌────────────────────────────────────┬─────┐
│ Kategorie eingeben ...             │ [▾] │
└────────────────────────────────────┴─────┘
  ┌──────────────────────────────────────┐
  │  Jacken                              │
  │  Hosen                               │
  │  Pullover                            │
  │  Schuhe                              │
  └──────────────────────────────────────┘

+-Modus — eingetippter Wert existiert nicht:
┌────────────────────────────────────┬─────┐
│ Skateboard                         │ [+] │  ← Button grün
└────────────────────────────────────┴─────┘

Anlegen-Modal nach Klick auf [+] oder Enter:
┌─────────────────────────────────────────┐
│  Neue Kategorie anlegen             [✕] │
├─────────────────────────────────────────┤
│                                         │
│  Name                                   │
│  ┌───────────────────────────────────┐  │
│  │ Skateboard                        │  │  ← vorausgefüllt
│  └───────────────────────────────────┘  │
│                                         │
│                  [Abbrechen]  [Anlegen] │
└─────────────────────────────────────────┘

Tastaturnavigation:
  ↓ / ↑   → Navigation in der Dropdown-Liste
  Enter   → Auswahl bestätigen / Modal öffnen (wenn +-Modus aktiv)
  Escape  → Dropdown / Modal schließen
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `options` | `string[]` | `@Input` | Liste der auswählbaren Einträge |
| `value` | `string \| null` | `@Input` | Aktuell gesetzter Wert (Two-way-Binding möglich) |
| `placeholder` | `string` | `@Input` | Platzhaltertext im leeren Feld |
| `entityLabel` | `string` | `@Input` | Bezeichnung für das Modal (z. B. `'Kategorie'` → „Neue Kategorie anlegen") |
| `disabled` | `boolean` | `@Input` | Deaktiviert das gesamte Feld |
| `valueChange` | `string` | `@Output` | Emittiert bei Auswahl eines bestehenden Eintrags |
| `entryCreated` | `string` | `@Output` | Emittiert wenn ein neuer Eintrag im Modal bestätigt wurde (der Name des neuen Eintrags) |

Das Parent ist verantwortlich dafür, den neuen Eintrag in der Datenbank anzulegen und die `options`-Liste zu aktualisieren. Die Komponente selbst kennt keine API.

---

## 3. Modus-Logik

### ▾-Modus (Standard)

| Bedingung | Verhalten |
|---|---|
| Feld leer oder Text entspricht einem Eintrag exakt | Button zeigt `▾` (`pi-chevron-down`) |
| Fokus oder Klick auf `▾` | Dropdown öffnet mit allen oder gefilterten Einträgen |
| Klick auf Eintrag | `valueChange` emittiert, Feld befüllt, Dropdown schließt |

### +-Modus (Anlegen)

| Bedingung | Verhalten |
|---|---|
| Eingetippter Wert entspricht **keinem** Eintrag exakt | Button wechselt zu `+` (grün, `pi-plus`) |
| Klick auf `+` oder `Enter` wenn +-Modus aktiv | Anlegen-Modal öffnet; eingetippter Wert vorausgefüllt |
| Bestätigung im Modal | `entryCreated` emittiert; Modal schließt; Feld zeigt neuen Wert |
| Abbrechen im Modal | Modal schließt; Feld unverändert |

---

## 4. Anlegen-Modal

- Größe: `sm`
- Titel: `'Neue ' + entityLabel + ' anlegen'` (z. B. „Neue Kategorie anlegen")
- Einziges Feld: `pInputText` vorausgefüllt mit eingetipptem Wert
- Buttons: `[Abbrechen]` (secondary) + `[Anlegen]` (primary)
- `[Anlegen]` deaktiviert wenn Feld leer

---

## 5. Verwendung in Features

| Feature | App | Felder |
|---|---|---|
| Artikelannahme | Bazaar | Kategorie, Marke |
| Meine Artikel | Voranmelde | Kategorie, Marke |

---

## 6. PrimeNG-Basis

```
p-autocomplete
  [suggestions]="filteredOptions"
  (completeMethod)="onFilter($event)"
  [dropdown]="true"           ← ▾-Button integriert

p-button                      ← wird per Template über den Dropdown-Button gelegt
  [icon]="'pi-plus'"          ← im +-Modus
  severity="success"

p-dialog                      ← Anlegen-Modal
  [header]="'Neue ' + entityLabel + ' anlegen'"
  [modal]="true"

pInputText                    ← Eingabefeld im Modal
```

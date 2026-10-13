---
id: C-026
status: draft
updated: 2026-10-13
---

# Component: File-Dropzone

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input- / Output-Schnittstelle — Events
- 3. PrimeNG-Basis — Warum ein Wrapper
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** eigener Wrapper (Ablagefläche mit verstecktem `<input type="file">`, Icon `pi pi-upload`)  
**Verwendung:** Überall dort, wo genau eine Datei per Drag & Drop oder Dateidialog gewählt wird und der Aufrufer Typ, Anzahl und Größe selbst prüft — erste Verwendung: Artikel-Import-Modal an der Verkäufer-Kachel.  
**Code:** `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/` (Selector `app-file-dropzone`)

---

## Überblick

Die File-Dropzone ist eine **Leaf-Komponente**: Sie nimmt Dateien per Drag & Drop oder per Klick
(Dateidialog, auch per Enter/Leertaste) entgegen und meldet sie unverändert über `filesChosen`.
Sie prüft weder Dateityp noch Anzahl noch Größe — der Aufrufer entscheidet und zeigt eigene Hinweise.
Nach jeder Auswahl setzt sie das Datei-Feld zurück, damit dieselbe Datei erneut wählbar ist.

---

## 1. ASCII-Darstellung

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
          ⇪  (pi pi-upload)
   <ng-content>: Beschriftung des Aufrufers
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Gestrichelter Rahmen (`--p-content-border-color`); beim Ziehen einer Datei über die Fläche
Rahmen in `--p-primary-color`; deaktiviert mit 60 % Deckkraft und Cursor `not-allowed`.

---

## 2. Input- / Output-Schnittstelle

| Input | Typ | Default | Wirkung |
|---|---|---|---|
| `accept` | `string` | `''` | Wird als `accept`-Attribut an den Dateidialog gegeben (Vorfilter, keine Prüfung) |
| `disabled` | `boolean` | `false` | Sperrt Klick, Tastatur und Drop; keine Events |

| Output | Typ | Beschreibung |
|---|---|---|
| `filesChosen` | `File[]` | Gewählte oder abgelegte Dateien, mindestens eine |

---

## 3. PrimeNG-Basis

Geprüft gegen PrimeNG 22.1.1 (`primeng/fesm2022/primeng-fileupload.mjs`):
- Drag & Drop gibt es nur in `mode="advanced"` (`(drop)` am Inhaltsbereich); `mode="basic"` hat keine Ablagefläche.
- Ohne `multiple` verwirft `onDrop` eine Ablage von zwei oder mehr Dateien still
  (`allowDrop = multiple() || files.length === 1`); `onSelect` feuert dann nicht, der Hinweis
  „Bitte genau eine Datei wählen" ist nicht auslösbar.
- Mit `multiple` und ohne `accept` meldet `onSelect` zwar alle Dateien (`files`), sammelt sie aber in einer
  eigenen Liste (`currentFiles`, kein Zurücksetzen bei `multiple`), rendert dazu Dateiliste,
  Auswählen-/Hochladen-/Abbrechen-Buttons und eigene Meldungen (`msgs`) und gibt dem Dateidialog
  `multiple` mit. Die Regel „genau eine Datei, eine neue gültige ersetzt die alte" müsste der Aufrufer
  nach jeder Auswahl per `clear()` über eine View-Referenz und mit überschriebenen Templates gegen
  diesen inneren Zustand durchsetzen.
Es fehlt also eine zustandslose Ablagefläche, die jede Auswahl nur meldet. Darum gilt die Grundregel
„Wrapper für Fehlendes": Die Dropzone liefert nur die Auswahl, alle Meldungen zeigt der Aufrufer mit
PrimeNG-Komponenten (`p-message`). Der JSON-Import der Einstellungen nutzt weiterhin
`p-fileupload mode="basic"` (dort reicht ein Dateidialog ohne Ablage).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN eine oder mehrere Dateien auf der Fläche abgelegt werden, THEN SHALL das System `filesChosen` mit genau diesen Dateien emittieren.
2. **AC-2** — WHEN im Dateidialog eine Datei gewählt wird, THEN SHALL das System `filesChosen` mit dieser Datei emittieren.
3. **AC-3** — WHEN der Dateidialog ohne Auswahl geschlossen wird, THEN SHALL das System kein Event emittieren.
4. **AC-4** — WHILE `disabled` gesetzt ist, SHALL das System bei Drop, Klick und Tastatur kein Event emittieren.
5. **AC-5** — WHILE eine Datei über die Fläche gezogen wird, SHALL das System die Fläche als aktiv markieren.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #file-dropzone #upload #drag-and-drop #wrapper #primeng

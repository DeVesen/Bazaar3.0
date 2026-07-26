# Komponenten — Übersicht

Hier sind alle UI-Komponenten der Bazaar Suite beschrieben: Aussehen, Verhalten und Funktionen,
unabhängig vom Feature-Kontext. Jede Komponente hat ein eigenes Verzeichnis.

**Struktur pro Komponente:**

```
docs/components/<name>/
├── component.md      ← Hauptbeschreibung
└── reference/        ← optional: Referenz-Anhänge (Tabellen, Grafiken, Beispiele)
```

Feature-spezifische Ausprägungen (z. B. welche Spalten eine Tabelle zeigt)
bleiben im jeweiligen Feature-Dokument.

---

## Grundregel: Dumb Component

Jede Komponente ist gedanklich eine **Dumb Component** — sie enthält keine eigene Logik zur Datenbeschaffung und trifft keine fachlichen Entscheidungen.

- Alle Eingabedaten kommen über `@Input()`-Parameter herein
- Alle Ausgaben verlassen die Komponente ausschließlich über `@Output()`-Events
- Kein direkter API-Aufruf, kein HTTP-Request, keine Business-Logik innerhalb der Komponente
- Das **Parent** (Seite / Feature-Komponente) entscheidet: lokal in Memory verarbeiten oder an das Backend weiterleiten

---

## Grundregel: PrimeNG

Die Bazaar Suite verwendet ausschließlich **PrimeNG** als UI-Bibliothek.

- Kein natives HTML für UI-Elemente (keine `<button>`, `<select>`, `<input>` ohne PrimeNG-Direktive)
- Keine anderen UI-Bibliotheken (kein Angular Material, kein Bootstrap, kein Tailwind UI)
- Kein Mischmasch verschiedener Quellen
- **Gibt es keine passende PrimeNG-Komponente**, wird ein eigener Wrapper erstellt —
  der intern PrimeNG-Komponenten verwendet und das fehlende Verhalten ergänzt.

---

## Komponenten-Index

| Komponente | Beschreibung | Verzeichnis |
|---|---|---|
| **Table** | Listenansicht für Datensätze mit Sortierung, Paginierung, Aktionsspalte und Toolbar | [table/](table/component.md) |

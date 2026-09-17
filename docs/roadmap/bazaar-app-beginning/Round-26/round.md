# Round 26 — Einstellungen: JSON-Import

## Liefert

Den Import der Voranmelde-App-Exportdatei — den zentralen Weg, wie Verkäufer und
Artikel überhaupt in großer Zahl in die Haupt-App gelangen.

## Umfang

- Bereich JSON-Import (Komponente `import-panel`): Datei-Picker → sofortige Vorschau →
  Bestätigung (inkl. Typ-Zuordnungen und Stammdaten-Checkboxen) → Fortschrittsanzeige →
  Toast.
- Zweistufiger Ablauf: `POST /api/import/preview` schreibt nichts, erst
  `POST /api/import` (mit den bestätigten Zuordnungen) ist eine atomare Transaktion.
  Die Datei wird dafür bewusst zweimal hochgeladen — kein Server-Zwischenspeicher.
- Upsert-Logik mit Sonderfall: bereits verkaufte/abgerechnete Artikel werden beim
  erneuten Import übersprungen statt überschrieben.
- Unbekannte Verkäufer-Typ-Namen blockieren den Import bis zur manuellen Zuordnung
  durch den Admin (kein Auto-Create, da Provision/Gebühr nicht erfindbar sind) —
  abweichend von Marken/Kategorien, die beim Import automatisch mit `original=true`
  angelegt werden.
- Verbindliches Import-Format laut Schema, kein eigenes Feldnamen-Mapping.

## Nicht enthalten

- Benutzerverwaltung — eigenes Häppchen.

## Referenzen

- [Epic_Einstellungen](../../requirements/bazaar-app/epics/Epic_Einstellungen/epic.md)
- [entities/import-format.md](../../requirements/bazaar-app/entities/import-format.md)
- [spec.md §9.1](../../requirements/bazaar-app/spec.md) (Marken & Kategorien — Übernahme)

## Voraussetzung

Setzt voraus, dass Verkäufer, Verkäufer-Typen, Marken, Kategorien und Artikel bereits
als Stammdaten-Verwaltungen existieren (der Import schreibt in exakt diese Tabellen).

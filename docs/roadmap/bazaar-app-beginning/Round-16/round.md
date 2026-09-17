# Round 16 — Artikelannahme: Verkäufer-Suche & Scan-Infrastruktur

## Liefert

Den ersten Teil des Artikelannahme-Wizards (Verkäufer finden oder neu anlegen) sowie die
geteilten Eingabe-/Scan-Komponenten, die auch spätere Häppchen (Verkauf, Freigabe,
Abrechnung) verwenden werden.

## Umfang

- Seite `/intake`, Schritt 1: Verkäufer-Suche (Komponente `seller-search`, hier mit
  `showCreateButton=true`) — Auswahl eines bestehenden Verkäufers oder Anlage eines
  neuen über die Panels 01–03 aus der Verkäufer-Verwaltung.
- Sofortiges Anlegen des Verkäufers in der Datenbank nach Abschluss von Schritt 1 (kein
  Zwischenspeichern im Frontend) — nutzt `POST /api/sellers` aus der
  Verkäufer-Verwaltung.
- Bereits abgerechnete Verkäufer werden in der Suche blockiert (Auswahl verhindert, nicht
  erst beim Buchen).
- Geteilte Komponente `input-group` (Artikelnummer/Preis-Eingabe, Modi Tastatur/Kamera/
  Nummernblock).
- Geteilte Komponente `barcode-scanner` mit Inline-Kamera-Modus und Countdown-Anzeige
  (Anzeigedauer über `scannerPauseMs`, Default 3 000 ms — Wert selbst kommt später aus
  den Einstellungen, hier zunächst als Konstante/Default verwendet).
- Geteilte Komponente `autocomplete-create` (Marke/Kategorie): Dropdown öffnet bei Klick,
  unbekannter Wert löst Popup „‹XYZ› als neue Marke/Kategorie speichern?“ aus, bestätigt
  → Eintrag mit `original=false` angelegt und ausgewählt.
- Scan-Feedback: Ton (Web Audio API) und Vibration (`Navigator.vibrate()`).
- Endpoints: `GET /api/sellers/search`, `GET /api/articles/next-number`.

## Nicht enthalten

- Schritt 2 des Wizards (Artikeleingabe, Sitzungsliste, Buchen) — folgt direkt danach.
- Der eigentliche `POST /api/intake`-Endpoint.

## Referenzen

- [Epic_Artikelannahme](../../requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md) (Story ANNAHME-S01, ANNAHME-S02)
- [spec.md §9.3](../../requirements/bazaar-app/spec.md) (AutoComplete-Verhalten)
- [spec.md §11](../../requirements/bazaar-app/spec.md) (Scanner-Typ, Scan-Feedback)

## Voraussetzung

Setzt voraus, dass die Verkäufer-Stammdaten-Verwaltung (Anlage-Panels, `POST
/api/sellers`) bereits existiert.

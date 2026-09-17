# Round 18 — Verkäufer: Artikel-Freigabe

## Liefert

Den Freigabe-Prozess innerhalb der Verkäufer-Verwaltung: bereits angenommene, aber noch
nicht freigegebene Artikel eines Verkäufers per Sammelscan freigeben.

## Umfang

- Artikel-Freigeben-Popup in der Verkäufer-Karte/-Detailansicht: Scan-Dialog mit
  `targetField="releasedAt"`, listet ausschließlich Artikel mit `releasedAt = null`
  (am Wizard-Tisch neu erfasste Artikel erscheinen hier nie, da `releasedAt` beim Buchen
  in Round 17 sofort mitgesetzt wird).
- Sammelscan mit abschließendem Payment-Panel (Wiederverwendung der Komponente aus Round
  17) für die Annahmegebühr.
- Backend: `POST /api/release` als atomare Transaktion — setzt `releasedAt` für alle
  gescannten Artikel in einem Request (nicht pro Scan) und erhöht
  `Verkäufer.intakeFeePaid`.
- Automatischer Druck des Abgabe-Belegs nach erfolgreicher Freigabe (gleiches Dokument
  wie beim Wizard-Buchen, zweiter Auslöser).

## Nicht enthalten

- Das Anlegen neuer Artikel — das läuft ausschließlich über die Artikelannahme.
- Der Abgabe-Beleg-Inhalt selbst — eigenes Häppchen.

## Referenzen

- [Epic_Verkaeufer](../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) (Abschnitt Artikel-Freigeben-Popup)
- [Epic_Artikelannahme](../../requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md) (geteilte Komponenten)

## Voraussetzung

Setzt voraus, dass Verkäufer-Stammdaten sowie die Scan-/Payment-Komponenten aus der
Artikelannahme bereits existieren.

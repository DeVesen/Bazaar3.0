# Round 23 — Druckfunktionen: Abgabe-Beleg

## Liefert

Das Abgabe-Beleg-Dokument, das bei Artikelannahme und Artikel-Freigabe automatisch
gedruckt wird.

## Umfang

- Druckansicht `print-abgabe-beleg` (keine eigene Seite/Route — reine Aktion): QR-Code
  (Shared-Komponente `qr-code`, `@zxing/library`, rein clientseitig, Offline-Pflicht),
  Verkäuferdaten, Artikel **nur des aktuellen Vorgangs**, Gebühreninfo.
- Ein gemeinsames Template für beide Auslösestellen — sieht bei Wizard-Buchen (Round 17)
  und bei Freigabe-Scan (Round 18) identisch aus.
- Nutzt die Print-Basisregel aus der App Shell (`@media print`, blendet Sidebar/
  Titelleiste aus) und ergänzt nur den fachlichen Inhalt.
- Druck erst nach erfolgreicher Backend-Antwort des jeweils auslösenden Endpoints
  (`POST /api/intake` bzw. `POST /api/release`).

## Nicht enthalten

- Die Verkäufer-Übersicht als zweites Druckdokument — eigenes Häppchen.
- Eigene Endpoints — es werden ausschließlich bereits vorhandene Daten gedruckt.

## Referenzen

- [Epic_Druckfunktionen](../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md)
- [components/qr-code/component.md](../../components/qr-code/component.md)

## Voraussetzung

Setzt voraus, dass Artikelannahme (Buchen) und Verkäufer-Artikel-Freigabe bereits
existieren.

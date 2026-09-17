# Round 17 — Artikelannahme: Artikeleingabe & Buchen

## Liefert

Den zweiten Teil des Artikelannahme-Wizards: Artikel eingeben, in einer Sitzungsliste
sammeln und mit einem atomaren Buchungsvorgang abschließen — inklusive Bezahlpopup und
Freigabe.

## Umfang

- Schritt 2: Zwei-Spalten-Grid (Artikeleingabe über `input-group`/`autocomplete-create`
  aus Round 16) + Sitzungsliste (Frontend-only, `7fr 3fr`-Layout) mit Löschen-Button pro
  Eintrag, solange nicht gebucht.
- Geteilte Komponente `payment-panel` (Speichern-Popup) — wird auch von Verkauf und
  Verkäufer-Freigabe wiederverwendet.
- Backend: `POST /api/intake` als ein atomarer Transaktions-Endpoint — legt alle
  Artikel der Sitzung an, setzt `acceptedAt`/`releasedAt` gleichzeitig (die Artikel sind
  mit dem Buchen sofort freigegeben) und erhöht `Verkäufer.intakeFeePaid`.
- Endpoint `GET /api/articles/by-number/{number}` zur Duplikatprüfung während der
  Eingabe; serverseitige Artikelnummer-Eindeutigkeit bleibt letztgültig (Race Condition
  zwischen Prüfung und Transaktion abgefangen).
- Automatischer Druck des Abgabe-Belegs nach erfolgreichem Buchen (Auslöser nur —
  Druckinhalt selbst entsteht im Druckfunktionen-Häppchen).

## Nicht enthalten

- Der Abgabe-Beleg-Inhalt selbst (Layout, QR-Code-Inhalt) — eigenes Häppchen.
- Das gesonderte Freigeben-Popup in der Verkäufer-Verwaltung (Sammelscan bereits
  freigegebener Bestandsartikel) — eigenes Häppchen, folgt danach.

## Referenzen

- [Epic_Artikelannahme](../../requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md)
- [entities/artikel.md](../../requirements/bazaar-app/entities/artikel.md)
- [spec.md §9.4](../../requirements/bazaar-app/spec.md) (Artikel-Timestamps)
- [spec.md §9.5](../../requirements/bazaar-app/spec.md) (IDs)

## Voraussetzung

Setzt voraus, dass Verkäufer-Suche/-Anlage und die Scan-/Eingabe-Infrastruktur bereits
existieren.

# Round 19 — Verkauf

## Liefert

Den vollständigen Durchstich des Kassenvorgangs: Artikel scannen, in den Warenkorb
legen, bezahlen.

## Umfang

- Seite `/checkout`, Grid `1fr 1fr`: links Artikelnummer-Eingabe (`input-group`, Modi
  Tastatur/Kamera/Nummernblock) + InfoArea + Preis-Button; rechts Warenkorb
  (Frontend-only, keine eigene Kassenvorgang-Entität).
- Kamera-Scan beendet sich nach einem Treffer selbst (anders als der Dauerscan der
  Artikelannahme); der erkannte Artikel geht erst nach Klick auf den Preis-Button in den
  Warenkorb.
- Sechs unterschiedliche Fehlertexte je nach Artikelstatus (bereits verkauft, nicht
  freigegeben, …) statt eines generischen Fehlers.
- Bezahlpopup über die geteilte Komponente `payment-panel`
  (`totalLabel="Gesamtbetrag"`, `confirmLabel="Bezahlt"`).
- Storno-Button „Letzten Vorgang stornieren“ — rein sitzungsgebunden, kein
  Persistenz-Flag, für beide Rollen verfügbar.
- Backend: `GET /api/articles/by-number/{number}` (Statuserkennung),
  `POST /api/sales` (atomar, prüft Vorbedingungen erneut → `409` bei Konflikt, setzt
  `soldAt`), `POST /api/sales/undo` (Storno).
- Kein eigenes Kassenvorgang-Entity — Umsatz ist eine abgeleitete Summe aus `soldAt`
  (bewusste Design-Entscheidung, keine Bon-Historie, kein Durchschnittsbon im MVP).

## Nicht enthalten

- Nachträgliche, Admin-only Korrektur eines Verkaufs außerhalb der laufenden Sitzung —
  das läuft über das Artikelstatus-Popup der Artikel-Übersicht.

## Referenzen

- [Epic_Verkauf](../../requirements/bazaar-app/epics/Epic_Verkauf/epic.md) (Story VERKAUF-S01)
- [entities/artikel.md](../../requirements/bazaar-app/entities/artikel.md)

## Voraussetzung

Setzt voraus, dass Scan-/Eingabe-Infrastruktur (`input-group`, `payment-panel`) aus der
Artikelannahme bereits existiert und Artikel über Annahme/Freigabe entstehen können.

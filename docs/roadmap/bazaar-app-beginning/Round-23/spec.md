---
round: Round-23
status: geklärt
---

# Spec: Round 23 — Druckfunktionen: Abgabe-Beleg

## Fein-Spezifikation

### Ziel

Reales Druck-Dokument für die beiden Stub-Aufrufe aus [Round-17](../Round-17/spec.md)
(`printService.printIntakeReceipt`) und [Round-18](../Round-18/spec.md) (derselbe
Service, zweiter Aufrufer). Keine eigene Seite/Route — reine Aktion.

### Frontend

**`print-abgabe-beleg`** (`shared/components/print-abgabe-beleg/` — von zwei
verschiedenen Features aus Round-17/18 aufgerufen, daher `shared/`): eigene
Druckansicht, exakt nach
[print-abgabe-beleg.md](../../../components/print-abgabe-beleg.md).
- Kopf: statischer Titel „Basar — Abgabe-Beleg" (kein konfigurierbarer
  Veranstaltungsname — in keiner Anforderung als Systemparameter geführt, reiner
  Text), Datum/Uhrzeit des Vorgangs.
- QR-Code: [`qr-code`](../../../components/qr-code/component.md) (echte
  Cross-App-Shared-Komponente, `@zxing/library`, clientseitig, kein Netzwerkzugriff),
  `value` = Verkäufer-`id`, darunter Klartext.
- Verkäuferdaten: Name, Anschrift, Ort, Telefon.
- Artikelliste **nur des aktuellen Vorgangs** (Nummer, Bezeichnung, Marke, Preis) —
  die vom Aufrufer übergebenen `articleIds`, nicht der Gesamtbestand des Verkäufers.
- Fuß: Anzahl Artikel, `feePerItem × Anzahl`, gezahlter Betrag (`feeAmount` aus dem
  Aufruf), Vermerk „bezahlt".
- Print-CSS: nutzt ausschließlich die App-Shell-Basisregel (`@media print`, blendet
  Sidebar/Titelleiste aus, BSHELL-S02 AC-6) — kein eigenes zweites Stylesheet.

**`printService.printIntakeReceipt(...)` — reale Implementierung** (ersetzt den
Round-17/18-Stub, Aufrufstelle unverändert): lädt bei Bedarf fehlende Anzeigedaten
(Verkäuferdaten, Artikeldetails zu den übergebenen `articleIds`) über bereits
bestehende Endpoints (`GET /api/sellers/{id}/articles` bzw. die im Aufruf bereits
mitgegebenen Daten, falls das Parent sie schon hält), rendert `print-abgabe-beleg` in
einem druckbaren Container und ruft `window.print()`.

### Backend

Keine neuen Endpoints — reine Anzeige bereits vorhandener Daten (Round-14/15/17/18).

### Akzeptanzkriterien

Epic_Druckfunktionen AC-1, AC-2, AC-3, AC-4 (nur Abgabe-Beleg-Teil), AC-5 (QR-Code
clientseitig), AC-7 (eigene Druckansicht + App-Shell-Basisregel), AC-8. `print-abgabe-
beleg.md` AC-1 bis AC-6 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Component-Test `print-abgabe-beleg` (Vitest) — Inhalt nur des aktuellen Vorgangs,
  Fuß-Berechnung, QR-Code-Rendering (`value`-Weitergabe).
- Frontend: `printService.printIntakeReceipt` beide Aufrufstellen (Round-17-Wizard,
  Round-18-Freigabe) liefern identisches Dokument.

### Bewusst nicht in diesem Round

Verkäufer-Übersicht als zweites Druckdokument — → [Round-24](../Round-24/round.md).
Eigene Endpoints — es wird ausschließlich bereits vorhandenes gedruckt.

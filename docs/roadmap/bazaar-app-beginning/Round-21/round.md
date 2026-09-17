# Round 21 — Abrechnung: Abrechnen & Auszahlung

## Liefert

Den Abschluss des Abrechnungs-Wizards: die eigentliche finanzielle Abrechnung mit
Auszahlungsberechnung.

## Umfang

- Abrechnen-Popup (Komponente `settlement-panel`): drei Posten (Umsatz, Provision,
  Auszahlung), kaufmännische Rundung, Hinweis auf nicht abgegebene Artikel (werden beim
  Abschluss entfernt — bewusst kein Soft-Delete/History für diese Artikel).
- „Abrechnen“-Button nur aktiv, wenn alle freigegebenen Artikel des Verkäufers entweder
  verkauft oder zurückgegeben sind.
- Backend: `POST /api/sellers/{id}/settlement` als atomare Transaktion — setzt
  `settledAt`, `payoutAmount`, entfernt nicht abgegebene Artikel.
- Genau eine Rundungsregel (Provision kaufmännisch runden, Auszahlung = Differenz),
  identisch im UI-Popup, im späteren Druck-Beleg und im Backend.
- Automatischer Druck-Auslöser nach erfolgreichem Abschluss sowie manueller
  „Drucken“-Button für die Verkäufer-Übersicht (Inhalt entsteht im
  Druckfunktionen-Häppchen).

## Nicht enthalten

- Der Inhalt der Verkäufer-Übersicht als Druckdokument — eigenes Häppchen.
- Stornieren einer Abrechnung — liegt im Reset-Endpoint der Verkäufer-Verwaltung.

## Referenzen

- [Epic_Abrechnung](../../requirements/bazaar-app/epics/Epic_Abrechnung/epic.md)
- [entities/verkaeufer.md](../../requirements/bazaar-app/entities/verkaeufer.md) (`salesCommission`, `payoutAmount`, `settledAt`)

## Voraussetzung

Setzt voraus, dass Verkäufer-Auswahl, Ansicht und Rückgabe (Round 20) bereits
existieren.

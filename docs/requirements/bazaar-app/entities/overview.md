---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Datenmodell — Haupt-App

**Verbindliche Quelle des Datenmodells dieser App.** Jede Entität hat eine eigene Datei
mit vollständiger Feldtabelle; dieses Verzeichnis ist damit ohne Dokumente außerhalb von
`docs/requirements/bazaar-app/` lesbar.

| Entität | Datei | Kurz |
|---|---|---|
| Artikel | [artikel.md](artikel.md) | Basar-Artikel inkl. Status-Zeitstempel |
| Verkäufer | [verkaeufer.md](verkaeufer.md) | Verkäufer mit eigenen Konditionen und Abrechnungsstand |
| Verkäufer-Typ | [verkaeufer-typ.md](verkaeufer-typ.md) | Vorlage für Provision und Gebühr |
| Marke | [marke.md](marke.md) | Stammdatum, denormalisiert im Artikel |
| Kategorie | [kategorie.md](kategorie.md) | Stammdatum, denormalisiert im Artikel |
| Benutzer | [benutzer.md](benutzer.md) | Konto zum Anmelden, Rolle Admin oder Kassenpersonal |
| Einstellungen | [einstellungen.md](einstellungen.md) | Systemparameter, eine Zeile |
| Import-Format | [import-format.md](import-format.md) | JSON-Schema der Datei aus der Voranmelde-App |

**Sprachregel:** Feldnamen englisch, Doku-Prosa deutsch — siehe
[`spec.md`](../spec.md) Abschnitt 7.0.1.

**IDs:** Alle Entitäten tragen eine 8-stellige alphanumerische ID (case-sensitive),
backend-generiert (`spec.md` Abschnitt 9.5). Beim Import aus der Voranmelde-App werden
deren IDs 1:1 übernommen, damit ein erneuter Import denselben Datensatz trifft.

**Einstellungen** sind serverseitig persistiert, nicht gerätelokal — Begründung in
[einstellungen.md](einstellungen.md). Ein Parameter, der nur im `localStorage` eines
Rechners liegt, gilt nicht systemweit.

## Verhältnis zur Voranmelde-App

Beide Apps teilen die Kernentitäten, aber nicht deren Feldumfang: Die Voranmelde-App
kennt keine Verkaufs-Zeitstempel und keinen Konditions-Override, die Haupt-App keine
Login-, Invite- und Nummernblock-Daten. Der Übergabepunkt ist ausschließlich das
[Import-Format](import-format.md). Die Feldtabellen der anderen App stehen in
`docs/requirements/advance-registration/entities/` — beide Verzeichnisse sind
unabhängig voneinander gültig.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entities #datenmodell #overview

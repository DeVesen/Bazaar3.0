# Glossar der Suite (Soll-Begriffe)

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Schlagworte: Begriff, Fachbegriff, Definition, löst ab, Code-Name

Verbindliche Begriffe für die Suite-Planung. Heutige Doppelbegriffe sind als „löst ab“ vermerkt. **Bei Unklarheit gilt der Begriff der Haupt-App (E25).** Technische Schlagwörter stehen in [glossar-technik](glossar-technik.md), die Stichwortsuche in [index](index.md).
Mit der Umsetzung wandern die Einträge in [`docs/glossary/`](../../glossary/) (Code-Ist).
Code-Namen sind englisch; die Spalte „Code“ ist ein Vorschlag.

---

## Akteure

| Begriff | Code | Bedeutung | Löst ab |
|---|---|---|---|
| Verkäufer | `Seller` | Person oder Firma, die Artikel abgibt. Privatverkäufer und Händler sind Ausprägungen über den Verkäufer-Typ. | – |
| Händler | `SellerType` (Ausprägung) | Verkäufer mit Händler-Typ (eigene Konditionen, oft viele Artikel) | – |
| Laufkunde | `Seller` ohne Login | Verkäufer, den das Team erst am Basar-Tag anlegt | – |
| Kassenpersonal | Rolle `cashier` | Helfer für Artikelannahme, Verkauf, Rückgabe und Abrechnung (Begriff der Haupt-App) | – |
| Basar-Team | – (Oberbegriff) | Kassenpersonal und Admin am Basar-Tag, also „die Organisationsseite“, die ab der Annahme verantwortlich ist | – |
| Admin | Rolle `admin` | Organisator, darf alles | Admin (BAR) und Admin (Haupt-App) |
| Interessent | – (anonym) | Besucher der öffentlichen Liste | – |

## Organisation

| Begriff | Code | Bedeutung |
|---|---|---|
| Basar | `Bazaar` | Eine Veranstaltung mit Terminen, Nummernbereichen und Einstellungen. Neu, gibt es heute nicht. |
| Voranmeldeschluss | `RegistrationDeadline` | Ab diesem Termin legen Verkäufer keine neuen Artikel mehr an (E5) |
| Abgabezeitraum | `DropOff` | Zeitfenster der Annahme |
| Verkaufszeitraum | `Sale` | Zeitfenster der Kasse und des öffentlichen Katalogs |
| Rückgabezeitraum | `Return` | Zeitfenster der Rückgabe |

## Artikel

| Begriff | Code | Bedeutung | Löst ab |
|---|---|---|---|
| Artikel | `Article` | **Ein** Datensatz von der Erfassung bis zur Abrechnung | Artikel (BAR) und Artikel (Haupt-App) als Kopien |
| Voranmelde-Nummer | `PreRegistrationNumber` | Nummer aus dem Nummernblock des Verkäufers, beim Erfassen vergeben | „Artikelnummer“ (BAR) |
| Basar-Tag-Nummer | `BazaarNumber` | Nummer, unter der Kasse, Rückgabe und Abrechnung den Artikel kennen; bei der Annahme vergeben | „Artikelnummer“ (Haupt-App) |
| Nummernblock | `NumberBlock` | Zusammenhängender Bereich von Voranmelde-Nummern je Verkäufer und Basar | – |
| Artikelannahme (kurz: Annahme) | `Intake` | Physische Übergabe am Tisch; der Artikel wechselt in die Verantwortung des Basar-Teams | Abgabe, Freigabe-Scan |
| Rückgabe | `Return` | Physische Rückgabe an den Verkäufer; die Verantwortung wechselt zurück | – |
| Artikel-Zustand | `ArticleState` | Siehe [Lebenszyklus](querschnitt/artikel-lebenszyklus.md) | „Status“ (Haupt-App), „kein Status“ (BAR) |
| Änderungssperre | – | Der Verkäufer darf nicht ändern, solange das Team verantwortlich ist | – |

## Geld

| Begriff | Code | Bedeutung | Löst ab |
|---|---|---|---|
| Annahmegebühr | `IntakeFee` | Gebühr je angenommenem Artikel, bei der Annahme kassiert | „Abgabegebühr“ (BAR) |
| Provision | `Commission` | Prozentsatz vom Verkaufspreis, den der Verein einbehält | – |
| Konditionen | `Conditions` | Annahmegebühr und Provision eines Verkäufers, aus dem Verkäufer-Typ, ab der ersten Annahme eingefroren (E9) | live (BAR) / Kopie (Haupt-App) |
| Auszahlung | `Payout` | Verkaufssumme minus Provision | – |
| Abrechnung | `Settlement` | Abschluss je Verkäufer und Basar | – |

## Stammdaten

| Begriff | Code | Bedeutung | Löst ab |
|---|---|---|---|
| Marke, Kategorie | `Brand`, `Category` | Auswahllisten, per AutoComplete auch von Nutzern anlegbar | – |
| Original / Neu | `original` | `true` = vom Admin angelegt bzw. bestätigt („✓ Original“), `false` = nachträglich über AutoComplete angelegt („Neu“). Das ist die Bedeutung der Haupt-App (§9.2). | abweichende Bedeutung in der Voranmelde-App |
| Verkäufer-Typ | `SellerType` | Vorlage für Konditionen (z. B. Privat, Händler) | – |

## Technik (für Stakeholder erklärt)

| Begriff | Bedeutung |
|---|---|
| Container | Eigenständig laufendes Programm auf dem Server; mehrere Container teilen sich die Last |
| Portal-API / Basar-API / Katalog | Die drei Container der Suite (siehe [Zielbild](architektur/zielbild.md)) |
| Inselmodus | Optionaler Notbetrieb: dieselbe Suite läuft am Basar-Ort lokal und spielt die Daten danach zurück |
| CDN / Cache | Zwischenspeicher, der viele Besucher bedient, ohne die eigenen Server zu belasten |
| Modularer Monolith | Ein Programm, intern sauber in Fachbereiche getrennt |

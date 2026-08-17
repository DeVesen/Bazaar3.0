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

---

## Zeitstempel und Zeitzone

**Gespeichert wird ausschließlich UTC** — Spaltentyp `timestamp with time zone`
(`timestamptz`), Werte als `DateTime` mit `Kind = Utc` (`DateTime.UtcNow`).

Das ist keine bloße Konvention, sondern eine harte Grenze des Stacks: Npgsql wirft eine
Ausnahme, wenn in eine `timestamptz`-Spalte ein `DateTime` mit `Kind = Local` oder
`Unspecified` geschrieben wird. Ohne diese Festlegung entdeckt es der erste Entwickler beim
ersten Speichern.

**Anzeige und Ausdruck in lokaler Zeit** (Europe/Berlin), umgerechnet **ausschließlich im
Frontend**. Auf Belegen steht lokale Zeit **ohne** Zonenangabe — „17.08.2026 08:12" —, weil
sie nur Menschen im selben Raum lesen.

Man wäre versucht, gleich lokal zu speichern: Der Basar läuft an einem Tag in einer Zone. Der
Grund dagegen ist nicht die Sommerzeit (ein Kassenvorgang um 02:30 in der Umstellungsnacht
ist unrealistisch), sondern dass UTC die Voreinstellung des Stacks ist — jede Abweichung
kostet Konfiguration und Sonderfälle an jeder Grenze.

Betrifft: `createdAt`, `updatedAt`, `acceptedAt`, `releasedAt`, `soldAt`, `returnedAt`
([artikel.md](artikel.md)) und `settledAt` ([verkaeufer.md](verkaeufer.md)).

---

## Dezimal-Präzision

| Verwendung | Typ | Felder |
|---|---|---|
| Geldbeträge | `decimal(10,2)` | `price`, `feePerItem`, `itemFee`, `intakeFeePaid`, `payoutAmount` |
| Prozentsätze | `decimal(5,2)` | `salesCommission`, `commissionRate` |

EF Core mappt `decimal` ohne Angabe auf PostgreSQL `numeric` **ohne** Präzision. Das
funktioniert, erlaubt aber beliebig viele Dezimalstellen — dann steht 12,499999 in der
Datenbank, während die Anzeige 12,50 zeigt und die Abrechnung mit einem dritten Wert rechnet.

Zehn Stellen bei Beträgen reichen für 99 999 999,99 € — mehr als jeder Kinderbasar umsetzt,
und die Grenze fällt auf, falls jemand Cent mit Euro verwechselt. Fünf Stellen bei Prozenten
decken 999,99 ab; der erlaubte Bereich ist 0–100, aber die Spalte muss nicht knapper sein als
die Prüfung.

Die Rundungsregel selbst steht in [Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) — diese
Spaltendefinition ist das, was sie durchsetzt.

---

## Feldlängen

Verbindlich für **beide Apps der Suite**: Der JSON-Import überträgt dieselben Felder
([import-format.md](import-format.md)) — unterschiedliche Grenzen würden bedeuten, dass ein in
der Voranmelde-App gültiger Wert beim Import scheitert.

| Feld | Länge | Begründung |
|---|---|---|
| `name` (Marke, Kategorie, Verkäufer-Typ) | 60 | „Damen Oberteile Größe 128" passt, ein Satz nicht |
| `name` (Artikel-Bezeichnung) | 100 | steht auf dem Beleg in einer Zeile |
| `firstName`, `lastName` | 60 je | |
| `address` | 120 | Straße und Hausnummer |
| `city` | 60 | |
| `postalCode` | 10 | international, nicht nur fünfstellig deutsch |
| `phone` | 30 | mit Ländervorwahl und Trennzeichen |
| `email` | 254 | Grenze aus RFC 5321 |
| `username` | 30 | wird am Tablet getippt |
| `size`, `color` | 20 je | „128", „rot-blau gestreift" |
| `description` | 500 | mehr liest am Annahmetisch niemand |

**Serverseitig geprüft** (`400` mit Feldfehler), im Formular zusätzlich als `maxlength`
gesetzt. Die Prüfung ist die Regel, das Attribut die Bequemlichkeit — ein Formular lässt sich
umgehen, der Handler nicht.

Ohne diese Grenzen wählt EF Core `text` ohne Limit, das Formular setzt kein `maxlength`, und
die Fehlermeldung bei zu langer Eingabe entsteht nie — bis jemand einen Roman ins
Beschreibungsfeld kopiert und die Tabelle unlesbar wird.

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

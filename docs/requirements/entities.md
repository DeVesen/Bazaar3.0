---
id: DOC-002
status: draft
updated: 2026-07-31
---

# Datenmodell — Bazaar Suite

## Index
- Artikel — Felder
- Verkäufer — Felder
- Marke — Felder
- Kategorie — Felder
- Verkäufer-Type — Felder
- Nummernblock — Felder
- Einstellungen — Felder
- Export-Format — JSON-Schema
- Artikel-Status — Statusmodell
- Tags & Piles — Ablage

**Version:** 0.2  
**Datum:** 2026-06-14  
**Status:** Entwurf

Legende: ✅ beide Apps | 🏠 nur Haupt-App | ☁️ nur Voranmelde-App

---

## Artikel

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | Alphanumerisch, Groß-/Kleinbuchstaben + Zahlen, unique |
| `nummer` | int | ✅ | ✅ | Artikelnummer aus dem zugewiesenen Nummernblock; für Barcode/QR |
| `verkaeuferId` | string (8 Zeichen) | ✅ | ✅ | FK auf Verkäufer. Explizites Feld statt Ableitung über `nummer` → Nummernblock — Ownership-Prüfung, Verkäufer-Filter und Export-Gruppierung brauchen es direkt, und die Ableitung bräche bei Neuvergabe eines Blocks |
| `bezeichnung` | string | ✅ | ✅ | |
| `marke` | string | ✅ | ✅ | AutoComplete; Freitext möglich → Popup „als neue Marke speichern?" |
| `kategorie` | string | ✅ | ✅ | AutoComplete; Freitext möglich → Popup „als neue Kategorie speichern?" |
| `preis` | double | ✅ | ✅ | |
| `beschreibung` | string | ❌ | ✅ | Optional |
| `groesse` | string | ❌ | ✅ | Optional |
| `farbe` | string | ❌ | ✅ | Optional |
| `alternativPreis` | double | ❌ | 🏠 | Optional; z. B. Mindestpreis |
| `erstelltAm` | DateTime | ✅ | ✅ | Wird beim Anlegen automatisch gesetzt (für Aktivitäts-Heatmap u. a.) |
| `updatedAm` | DateTime | ✅ | ✅ | Wird bei jeder Änderung automatisch gesetzt (für Aktivitäts-Heatmap u. a.) |
| `angenommenAm` | DateTime? | — | 🏠 | Wird bei Artikelannahme gesetzt (= Buchen im Wizard Schritt 2) |
| `freigegebenAm` | DateTime? | — | 🏠 | Wird beim Buchen der Artikelannahme automatisch gesetzt (= „Im Verkauf") |
| `verkauftAm` | DateTime? | — | 🏠 | Wird beim Kassenvorgang gesetzt |
| `rückgegebenAm` | DateTime? | — | 🏠 | Wird bei Rückgabe gesetzt |

---

## Verkäufer

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | Alphanumerisch, unique |
| `vorname` | string | ✅ | ✅ | |
| `nachname` | string | ✅ | ✅ | |
| `anschrift` | string | ❌ | ✅ | Optional |
| `plz` | string | ✅ | ✅ | |
| `ort` | string | ✅ | ✅ | |
| `telefon` | string | ✅ | ✅ | |
| `email` | string | ✅ | ✅ | In der Voranmelde-App auch Login |
| `verkaueferTypeId` | string (8 Zeichen) | ✅ | ✅ | FK auf die `id` des Verkäufer-Types, **nicht** auf die Bezeichnung — die Zuordnung bleibt damit beim Umbenennen eines Typs stabil. (Anders als `marke`/`kategorie` im Artikel: dort ist die Denormalisierung durch das AutoComplete-Create begründet, hier gibt es keinen solchen Grund.) |
| `istAdmin` | bool | ✅ | ☁️ | Default `false`. Quelle des `role`-Claims im JWT (`true` → `admin`, sonst `seller`); gepflegt über die Checkbox „Admin-Rechte" in Epic_Verkaeufer Panel 05 |
| `umsatzVerkaufsprovision` | double | ✅ | 🏠 | Wird aus Verkäufer-Type übernommen / überschreibbar |
| `gebuehrProStueck` | double | ✅ | 🏠 | Wird aus Verkäufer-Type übernommen / überschreibbar |
| `abgerechnetAm` | DateTime? | — | 🏠 | Wird bei Abrechnung gesetzt |
| `inviteToken` | string? | — | ☁️ | Einmaliges Token für den Einladungs-Link (Admin legt Verkäufer ohne Passwort an) |
| `inviteTokenExpiresAt` | DateTime? | — | ☁️ | Ablaufzeitpunkt des Invite-Tokens (7 Tage nach Generierung) |

---

## Marke

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | |
| `bezeichnung` | string | ✅ | ✅ | Unique case-insensitive |
| `original` | boolean | ✅ | ☁️ | `true` bei Admin-Anlage, `false` bei Verkäufer-AutoComplete-Create (Voranmelde-App-Herkunftskennzeichen) |

---

## Kategorie

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | |
| `bezeichnung` | string | ✅ | ✅ | Unique case-insensitive |
| `original` | boolean | ✅ | ☁️ | `true` bei Admin-Anlage, `false` bei Verkäufer-AutoComplete-Create (Voranmelde-App-Herkunftskennzeichen) |

---

## Verkäufer-Type

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | |
| `bezeichnung` | string | ✅ | ✅ | z. B. "Privat", "Gewerblich", "Verein" |
| `verkaufsprovisionAnteil` | double | ✅ | ✅ | Prozentualer Anteil, den der Basar einbehält |
| `abgabegebuehr` | double | ✅ | ✅ | Gebühr pro abgegebenem Artikel |

---

## Nummernblock ☁️ (nur Voranmelde-App)

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | |
| `verkaeuferId` | string | ✅ | Zugehöriger Verkäufer |
| `vonNummer` | int | ✅ | Erste Nummer des Blocks |
| `bisNummer` | int | ✅ | Letzte Nummer des Blocks |
| `zugewiesenAm` | DateTime | ✅ | |

---

## Einstellungen ☁️ (nur Voranmelde-App, Singleton)

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (fix) | ✅ | Fester Wert, Singleton-Row |
| `voranmeldeschluss` | DateTime | ✅ | Ende Selbstregistrierungsphase |
| `abgabeVon` | DateTime | ✅ | Start Abgabe-Zeitraum |
| `abgabeBis` | DateTime | ✅ | Ende Abgabe-Zeitraum |
| `basarVon` | DateTime | ✅ | Start Basar |
| `basarBis` | DateTime | ✅ | Ende Basar |
| `defaultTypeId` | string (8 Zeichen) | ✅ | FK auf Verkäufer-Type |
| `infoText` | string | ❌ | Markdown-Freitext |
| `startNumber` | int | ✅ | Erste Artikelnummer überhaupt |
| `blockSize` | int | ✅ | Anzahl Nummern pro Nummernblock |
| `defaultBlockCount` | int | ✅ | Standard-Anzahl Blöcke für neue Verkäufer |

---

## Export-Format (JSON, Voranmelde → Haupt-App)

```json
{
  "exportedAt": "2026-06-14T08:00:00Z",
  "sellers": [
    {
      "id": "Ab3dEf7G",
      "vorname": "Max",
      "nachname": "Mustermann",
      "anschrift": "Hauptstr. 1",
      "plz": "12345",
      "ort": "Musterstadt",
      "telefon": "0123456789",
      "email": "max@example.com",
      "verkaueferType": "Privat",
      "articles": [
        {
          "id": "Xy9zWq2P",
          "nummer": 101,
          "bezeichnung": "Winterjacke",
          "marke": "Nike",
          "kategorie": "Jacken",
          "preis": 25.00,
          "groesse": "M",
          "farbe": "Blau",
          "beschreibung": "kaum getragen"
        }
      ]
    }
  ],
  "brands": ["Nike", "Adidas"],
  "categories": ["Jacken", "Hosen"]
}
```

**Anmerkungen zum Schema:**

- **`verkaueferType` ist hier die Bezeichnung, nicht die Id** — bewusst abweichend vom internen Feld `verkaueferTypeId`. Eine Id aus der Voranmelde-App wäre in der Haupt-App bedeutungslos; diese pflegt eigene Verkäufer-Typen und löst Provision/Gebühr über den **Namen** auf. Der Name ist damit der app-übergreifende Matching-Schlüssel.
- **`brands`/`categories` sind Arrays von Bezeichnungen**, keine Objekte: `id` ist app-lokal und drüben wertlos, `original` ist ☁️-exklusiv. Die Haupt-App legt fehlende Namen an. Passt zur Denormalisierung im Artikel, der ohnehin nur den Namen trägt.
- Die Arrays sind **immer vorhanden** — leer, wenn die zugehörige Checkbox im Export-Dialog nicht gesetzt war. So bleibt das Schema stabil.
- `anschrift` und `beschreibung` sind optional (können fehlen bzw. `null` sein), werden aber übertragen — beide Felder existieren in der Haupt-App, sie beim Transfer zu verlieren hieße, sie am Basar-Tag neu zu erfassen.

---

## Artikel-Status (nur Haupt-App)

Der Status eines Artikels ergibt sich aus den DateTime-Feldern:

| Status | Bedingung |
|---|---|
| **Registriert** | `freigegebenAm` = null |
| **Im Verkauf** | `freigegebenAm` gesetzt, `verkauftAm` = null, `rueckgegebenAm` = null |
| **Verkauft** | `verkauftAm` gesetzt |
| **Zurückgegeben** | `rueckgegebenAm` gesetzt |

**Hinweis:** `angenommenAm` und `freigegebenAm` werden beim Buchen der Artikelannahme gleichzeitig auf `now` gesetzt. Im Lastenheft (7.4) wird `freigegebenAm` als der statusgebende Zeitstempel verwendet.

---

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #entities #datenmodell #artikel #verkäufer #export-format

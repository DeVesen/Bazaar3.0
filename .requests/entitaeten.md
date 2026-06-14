# Datenmodell — Bazaar Suite

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
| `bezeichnung` | string | ✅ | ✅ | |
| `marke` | string | ✅ | ✅ | AutoComplete; Freitext möglich → Popup „als neue Marke speichern?" |
| `kategorie` | string | ✅ | ✅ | AutoComplete; Freitext möglich → Popup „als neue Kategorie speichern?" |
| `preis` | double | ✅ | ✅ | |
| `beschreibung` | string | ❌ | ✅ | Optional |
| `groesse` | string | ❌ | ✅ | Optional |
| `farbe` | string | ❌ | ✅ | Optional |
| `alternativPreis` | double | ❌ | 🏠 | Optional; z. B. Mindestpreis |
| `angenommenAm` | DateTime? | — | 🏠 | Wird bei Artikelannahme gesetzt |
| `verkauftAm` | DateTime? | — | 🏠 | Wird beim Verkauf gesetzt |
| `rueckgegebenAm` | DateTime? | — | 🏠 | Wird bei Rückgabe gesetzt |

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
| `verkaueferType` | string | ✅ | ✅ | Referenz auf Verkäufer-Type |
| `umsatzVerkaufsprovision` | double | ✅ | 🏠 | Wird aus Verkäufer-Type übernommen / überschreibbar |
| `gebuehrProStueck` | double | ✅ | 🏠 | Wird aus Verkäufer-Type übernommen / überschreibbar |
| `abgerechnetAm` | DateTime? | — | 🏠 | Wird bei Abrechnung gesetzt |

---

## Marke

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | |
| `bezeichnung` | string | ✅ | ✅ | |

---

## Kategorie

| Feld | Typ | Pflicht | Apps | Bemerkung |
|---|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | ✅ | |
| `bezeichnung` | string | ✅ | ✅ | |

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

## Export-Format (JSON, Voranmelde → Haupt-App)

```json
{
  "exportedAt": "2026-06-14T08:00:00Z",
  "sellers": [
    {
      "id": "Ab3dEf7G",
      "vorname": "Max",
      "nachname": "Mustermann",
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
          "farbe": "Blau"
        }
      ]
    }
  ],
  "brands": [],
  "categories": []
}
```

---

## Artikel-Status (nur Haupt-App)

Der Status eines Artikels ergibt sich aus den DateTime-Feldern:

| Status | Bedingung |
|---|---|
| **Registriert** | `angenommenAm` = null |
| **Im Verkauf** | `angenommenAm` gesetzt, `verkauftAm` = null, `rueckgegebenAm` = null |
| **Verkauft** | `verkauftAm` gesetzt |
| **Zurückgegeben** | `rueckgegebenAm` gesetzt |

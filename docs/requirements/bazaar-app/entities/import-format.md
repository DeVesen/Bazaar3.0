---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Import-Format (JSON, Voranmelde-App → Haupt-App)

Schema der Datei, die der Admin am Basar-Morgen in dieser App einliest. Verbindliche
Quelle für die **Leseseite**; Ablauf und Upsert-Logik →
[Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 2.

Die Voranmelde-App erzeugt exakt dieses Schema. Feldnamen sind **englisch**, es gibt
beim Import **kein** Feldnamen-Mapping.

## Schema

```json
{
  "exportedAt": "2026-06-14T08:00:00Z",
  "sellers": [
    {
      "id": "Ab3dEf7G",
      "firstName": "Max",
      "lastName": "Mustermann",
      "address": "Hauptstr. 1",
      "postalCode": "12345",
      "city": "Musterstadt",
      "phone": "0123456789",
      "email": "max@example.com",
      "sellerType": "Privat",
      "articles": [
        {
          "id": "Xy9zWq2P",
          "number": 101,
          "name": "Winterjacke",
          "brand": "Nike",
          "category": "Jacken",
          "price": 25.00,
          "size": "M",
          "color": "Blau",
          "description": "kaum getragen"
        }
      ]
    }
  ],
  "brands": ["Nike", "Adidas"],
  "categories": ["Jacken", "Hosen"]
}
```

## Regeln

| Thema | Regel |
|---|---|
| `sellerType` | **Name**, nicht die Id. Eine Id aus der Voranmelde-App wäre hier bedeutungslos; diese App löst den Namen gegen ihre eigenen [Verkäufer-Typen](verkaeufer-typ.md) auf und belegt daraus `salesCommission` und `feePerItem` des Verkäufers |
| Unbekannter `sellerType` | Wird **nicht** automatisch angelegt: Der Admin ordnet jeden unbekannten Namen in der Import-Vorschau einem existierenden Typ zu ([Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) Abschnitt 4). Anders als Marken und Kategorien trägt ein Typ Provision und Gebühr — die kann der Import nicht erfinden, und ein Typ mit 0 % wäre ein stiller Geldverlust |
| `brands` / `categories` | Arrays von **Namen**, keine Objekte — `id` ist app-lokal, das `original`-Flag existiert dort mit anderer Bedeutung. Fehlende Namen legt diese App an |
| Leere Arrays | Immer vorhanden, ggf. leer (Checkboxen im Export-Dialog nicht gesetzt). Das Schema bleibt dadurch über alle Dateien stabil |
| Optionale Felder | `address` und `description` können fehlen oder `null` sein, werden aber übertragen — beide Felder existieren hier und am Basar-Tag neu zu erfassen wäre unnötig |
| `id` | Verkäufer- und Artikel-IDs werden **1:1 übernommen**. Sie sind der Schlüssel der Upsert-Erkennung |
| Nicht enthalten | Nummernblöcke, Login-/Invite-Daten, Refresh-Tokens, Admin-Flag, das `original`-Flag der Stammdaten sowie Konditionszahlen pro Verkäufer |
| Artikel-Status | Nicht enthalten. Importierte Artikel starten ohne Status-Zeitstempel, gelten also als „Registriert" ([artikel.md](artikel.md)) und werden am Basar-Morgen über den Freigabe-Scan freigegeben ([Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 6) |
| `soldManually` | Nicht enthalten und beim Import immer `false` — das Feld kennzeichnet ausschließlich Verkäufe, die in dieser App ohne Kassenvorgang entstanden sind |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #import #json #datenschnittstelle #datenmodell

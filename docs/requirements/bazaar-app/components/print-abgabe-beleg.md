---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: print-abgabe-beleg

**Bibliothek:** eigene Druckansicht + [`qr-code`](../../../components/qr-code/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) Abschnitt 1

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Blattaufbau
- 2. Inhalt — Was drauf steht
- 3. Auslöser — Beide Abgabewege
- 4. Druck-Technisches — Print-CSS
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Beleg über abgegebene Artikel und die dafür bezahlte Annahmegebühr.

---

## Überblick

Das Blatt ist eine **Quittung über Bargeld**, nicht bloß eine Artikelliste. Der Verkäufer zahlt bei der Abgabe die Annahmegebühr in bar und behält dieses Blatt als einzigen Nachweis darüber.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────────────────┐
│  Basar 2026 — Abgabe-Beleg          ▪▪▪▪▪▪▪         │
│                                     ▪ QR  ▪         │
│  Anna Meier                         ▪▪▪▪▪▪▪         │
│  Musterstraße 5                     a3f9c2d1        │
│  76133 Karlsruhe · 0721 123456                      │
│                                                      │
│  Abgegeben am 17.08.2026, 08:12                      │
│  ─────────────────────────────────────────────────── │
│  Nr.    Bezeichnung          Marke      Preis        │
│  1043   Winterjacke          Nike      12,00 €       │
│  1044   Gummistiefel         Aigle      8,00 €       │
│  ─────────────────────────────────────────────────── │
│  2 Artikel                                           │
│  Annahmegebühr 2 × 0,50 €               1,00 €       │
│  bezahlt                                             │
└─────────────────────────────────────────────────────┘
```

---

## 2. Inhalt

| Bereich | Inhalt |
|---|---|
| Kopf | Basar-Bezeichnung, Datum und Uhrzeit des Vorgangs |
| QR-Code | Verkäufer-`id` als Rohstring → [`qr-code`](../../../components/qr-code/component.md) |
| Verkäuferdaten | Name, Anschrift, Ort, Telefon; darunter die Verkäufernummer im Klartext |
| Artikelliste | **die Artikel dieses Vorgangs** — Nummer, Bezeichnung, Marke, Preis |
| Fuß | Anzahl Artikel, Gebührensatz × Anzahl, gezahlter Betrag, Vermerk „bezahlt" |

**Nur die Artikel dieses Vorgangs, nicht der Gesamtbestand.** Bei einem Verkäufer, der zweimal kommt, wären „alle abgegebenen Artikel" zwei fast identische Blätter, von denen keines zum kassierten Betrag passt.

**Der Betrag gehört drauf.** Ohne ihn ist es keine Quittung, sondern eine Liste — und die Annahmegebühr ist das einzige Geld, das an dieser Stelle den Besitzer wechselt.

Der QR-Code enthält die **Verkäufernummer**, nicht die Artikelnummern: Er dient dazu, den Verkäufer bei Rückgabe und Abrechnung schnell wiederzufinden.

---

## 3. Auslöser

| Weg | Wann |
|---|---|
| [Artikelannahme](../epics/Epic_Artikelannahme/epic.md) | automatisch nach dem Buchen in Wizard-Schritt 2 |
| [Freigabe-Scan](../epics/Epic_Verkaeufer/epic.md) Abschnitt 6 | automatisch nach dem Payment-Panel am Ende der Scan-Sitzung |

**Dasselbe Dokument auf beiden Wegen.** Beide führen zum selben Vorgang — Artikel werden abgegeben und die Gebühr bezahlt — und dürfen nicht zu zwei verschiedenen Belegsituationen führen. Ohne den zweiten Auslöser bekäme der vorangemeldete Verkäufer nichts, während der Laufkunde eine Quittung erhält.

Der Druck startet **erst nach erfolgreicher Antwort** des jeweiligen Vorgangs-Endpoints. Ein Beleg über eine Buchung, die fehlgeschlagen ist, wäre schlimmer als kein Beleg.

---

## 4. Druck-Technisches

Die Basisregel „Sidebar und Layout-Chrome ausblenden" liefert die [App Shell](../epics/Epic_App_Shell/epic.md) für jede Seite (BSHELL-S02 AC-6). Diese Ansicht ergänzt nur ihren eigenen Inhalt und Aufbau — **kein** eigenes Print-Stylesheet, das die Basisregel wiederholt.

Der QR-Code wird **clientseitig** erzeugt (`@zxing/library`, SVG) — kein externer Service, die App läuft offline im LAN.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL ausschließlich die Artikel des auslösenden Vorgangs listen.
2. **AC-2** — THE SYSTEM SHALL Anzahl Artikel, Gebührensatz, gezahlten Gebührenbetrag und den Vermerk „bezahlt" ausgeben.
3. **AC-3** — THE SYSTEM SHALL die Verkäufernummer als QR-Code und im Klartext ausgeben.
4. **AC-4** — THE SYSTEM SHALL den Druck erst nach erfolgreicher Buchung starten.
5. **AC-5** — THE SYSTEM SHALL den QR-Code clientseitig ohne externen Service erzeugen.
6. **AC-6** — THE SYSTEM SHALL für beide Abgabewege dasselbe Dokument verwenden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #druck #beleg #qr-code #gebuehr #haupt-app

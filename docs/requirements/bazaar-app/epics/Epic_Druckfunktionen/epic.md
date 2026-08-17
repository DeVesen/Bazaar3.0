---
id: F-BA-011
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Druckfunktionen

## Index
- Überblick — Druckdokumente
- 1. Abgabe-Beleg — Annahme und Freigabe
- 2. Verkäufer-Übersicht — Abrechnungs-Beleg
- 3. Ablauf beim Abrechnen — Reihenfolge
- 4. Druck-Technisches — Print-CSS, QR-Code
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Auslöser:** Automatisch nach der Artikelannahme und nach dem Freigabe-Scan · Manuell über „Drucken" in der Abrechnung

**Ziel:** Kassenpersonal druckt Abgabe-Belege und Abrechnungsübersichten.

**User Story:** Als Kassenpersonal möchte ich bei Abgabe und Abrechnung einen Ausdruck erstellen, damit der Verkäufer eine physische Bestätigung über Artikel und Geldbewegung erhält.

---

## Überblick

Zwei Druckdokumente. Beide sind **Belege über Geld**, nicht nur Artikellisten — an beiden Stellen wechselt Bargeld den Besitzer.

Beim Drucken wird nur der relevante Content gerendert, keine Sidebar und kein Layout-Chrome (Abschnitt 4).

---

## 1. Abgabe-Beleg

**Auslöser:** Automatisch nach dem Buchen — auf **beiden** Abgabewegen:

| Weg | Auslöser |
|---|---|
| [Artikelannahme](../Epic_Artikelannahme/epic.md) | Klick auf „Buchen" in Wizard Schritt 2 |
| [Freigabe-Scan](../Epic_Verkaeufer/epic.md) Abschnitt 6 | Nach dem Payment-Panel am Ende der Scan-Sitzung |

Beide Wege führen zum selben Vorgang — Artikel werden abgegeben und die Gebühr bezahlt — und dürfen darum nicht zu zwei verschiedenen Belegsituationen führen. Ohne den zweiten Auslöser bekäme der vorangemeldete Verkäufer nichts, während der Laufkunde eine Quittung erhält.

**Inhalt:**
- QR-Code mit der Verkäufer-ID → Shared-Component [`qr-code`](../../../../components/qr-code/component.md)
- Profilinformationen des Verkäufers (Name, Anschrift, Kontakt)
- **Die Artikel dieses Vorgangs** — nicht der Gesamtbestand des Verkäufers
- **Anzahl Artikel, Gebührensatz (`feePerItem`) und gezahlter Gebührenbetrag**

**Umfang bewusst auf den Vorgang begrenzt:** Der Beleg dokumentiert, was gerade übergeben wurde. Bei einem Verkäufer, der zweimal kommt, wären „alle abgegebenen Artikel" zwei fast identische Blätter, von denen keines zum kassierten Betrag passt.

**Der Betrag gehört drauf:** Ohne ihn ist es keine Quittung, sondern eine Liste — und die Annahmegebühr ist das einzige Geld, das an dieser Stelle den Besitzer wechselt (Regel → [Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) Abschnitt 4).

**Zweck:** Wird dem Verkäufer mitgegeben als Bestätigung der Abgabe und der gezahlten Gebühr.

---

## 2. Verkäufer-Übersicht (Abrechnung)

**Auslöser:** Klick auf „🖨️ Drucken" in der [Abrechnung](../Epic_Abrechnung/epic.md). Der Button ist immer aktiv, auch nach dem Abrechnen.

**Artikelgruppen:**

| Gruppe | Bedingung |
|---|---|
| **Verkauft** | `soldAt` gesetzt |
| **Zurückgegeben** | `returnedAt` gesetzt |
| **Noch im Verkauf** | `releasedAt` gesetzt, `soldAt` und `returnedAt` leer |

Eine Gruppe „Sonstige" für beschädigte oder zurückgezogene Artikel gibt es **nicht** — diese Zustände existieren im Datenmodell nicht ([`entities/artikel.md`](../../entities/artikel.md) kennt vier Zustände). Ein beschädigter Artikel wird zurückgegeben wie jeder unverkaufte; die Beschädigung ist ein Gespräch am Tisch, kein Datenfeld. Ein Zustand ohne Auswirkung auf Geld oder Ablauf trägt sich nicht selbst.

**Abrechnungsposten** — dieselben gerundeten Werte wie im Abrechnen-Popup:
- Umsatz
- Provision (mit Satz)
- Auszahlung
- Hinweiszeile: bereits am Annahmetisch bezahlte Gebühr (`intakeFeePaid`), damit die Frage „und die Gebühr?" nicht am Tisch entsteht

Es ist der einzige Nachweis, den der Verkäufer über die Geldbewegung behält.

### Ein Dokument, zwei Reifegrade

Der Beleg wird zu zwei Zeitpunkten gebraucht, mit unterschiedlichem Zweck. Statt zweier Dokumente liefert der Drucken-Button, was zum jeweiligen Zeitpunkt stimmt:

| Zeitpunkt | Darstellung |
|---|---|
| Solange Artikel im Verkauf sind | Schwerpunkt **Noch im Verkauf** als Einsammelliste; alle Beträge deutlich als **„vorläufig"** gekennzeichnet |
| Nach dem Rückgabe-Scan bzw. nach dem Abrechnen | Vollständige Gruppen, **endgültige** Abrechnungsposten inklusive Auszahlungsbetrag |

Kein zweites Dokument und kein zweiter Button: Es sind dieselben Daten in unterschiedlicher Reife, und zwei Ausdrucke mit ähnlichem Aussehen bei unterschiedlicher Verbindlichkeit sind am Tisch die Vorlage für Verwechslungen. Die Kennzeichnung „vorläufig" ist der entscheidende Teil — ein Blatt mit einem Auszahlungsbetrag, der sich noch ändern kann, darf nicht wie die Endabrechnung aussehen.

**Zweck:** Vor dem Rückgabe-Scan die Einsammelliste, danach der Auszahlungsbeleg.

---

## 3. Ablauf beim Abrechnen

Verbindliche Reihenfolge:

```
Drucken  →  einsammeln  →  Rückgabe-Scan  →  Abrechnen  →  Drucken (endgültig)
```

Der Grund für diese Reihenfolge steckt in den Button-Regeln der [Abrechnung](../Epic_Abrechnung/epic.md): „Abrechnen" ist gesperrt, solange Artikel im Verkauf sind. Gedruckt vor dem Scan ist die Gruppe „Noch im Verkauf" die Einsammelliste; nach dem Scan ist sie leer und der Beleg trägt die endgültigen Beträge. Ohne diesen Satz bleibt offen, warum man zweimal drucken kann und welcher Zeitpunkt gemeint ist.

---

## 4. Druck-Technisches

**Dieses Epic hat keine eigene Seite und keine Route.** Beide Ausdrucke entstehen als Aktion innerhalb eines Arbeitsschritts. Ein Menüpunkt „Drucken", hinter dem erst ausgewählt werden müsste, was zu drucken ist, wäre ein Umweg.

**Abgrenzung zur App Shell:** Die Basisregel „Sidebar und Layout-Chrome beim Drucken ausblenden" liefert [Epic_App_Shell](../Epic_App_Shell/epic.md) (BSHELL-S02 AC-6) für **jede** Seite. Dieses Epic ergänzt nur die beiden fachlichen Druckansichten mit ihrem eigenen Inhalt und Aufbau — kein gemeinsames Print-Stylesheet, das beides bedienen will.

- QR-Code wird client-seitig generiert (kein externer Service — Offline-Anforderung!) über die Shared-Component [`qr-code`](../../../../components/qr-code/component.md) (`@zxing/library`, SVG); dieselbe Komponente nutzt die Voranmelde-App für die Verkäufernummer-Anzeige

## Akzeptanzkriterien

1. **AC-1** — WHEN „Buchen" in der Artikelannahme geklickt wird, THEN SHALL das System nach erfolgreicher Buchung den Druckdialog automatisch starten, ohne weiteren Nutzereingriff.
2. **AC-2** — WHEN eine Freigabe-Scan-Sitzung über das Payment-Panel abgeschlossen wird, THEN SHALL das System denselben Abgabe-Beleg automatisch drucken.
3. **AC-3** — THE SYSTEM SHALL auf dem Abgabe-Beleg QR-Code, Verkäuferdaten, die Artikel **dieses Vorgangs** sowie Anzahl, Gebührensatz und gezahlten Gebührenbetrag rendern.
4. **AC-4** — WHEN „🖨️ Drucken" in der Abrechnung geklickt wird, THEN SHALL das System die Artikel in den Gruppen Verkauft, Zurückgegeben und Noch im Verkauf sowie die Abrechnungsposten Umsatz, Provision und Auszahlung rendern.
5. **AC-5** — IF beim Drucken der Abrechnung noch Artikel im Verkauf sind, THEN SHALL das System alle Beträge sichtbar als „vorläufig" kennzeichnen.
6. **AC-6** — THE SYSTEM SHALL den Drucken-Button in der Abrechnung auch nach dem Abrechnen erreichbar halten, damit der Verkäufer den endgültigen Beleg erhält.
7. **AC-7** — THE SYSTEM SHALL für beide Ausdrucke eine eigene Druckansicht mit eigenem Aufbau rendern und dabei die Print-Basisregel der App Shell nutzen, statt Sidebar und Chrome erneut selbst auszublenden.
8. **AC-8** — THE SYSTEM SHALL den QR-Code ausschließlich clientseitig ohne externen Service generieren.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #druck #print-css #qr-code #artikelannahme #abrechnung #beleg

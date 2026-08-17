---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: print-verkaeufer-uebersicht

**Bibliothek:** eigene Druckansicht + [`qr-code`](../../../components/qr-code/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) Abschnitt 2

## Index
- Überblick — Zwei Zeitpunkte, ein Dokument
- 1. ASCII-Darstellung — Blattaufbau
- 2. Artikelgruppen — Was gruppiert wird
- 3. Abrechnungsposten — Beträge
- 4. Reifegrad — vorläufig gegen endgültig
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Einsammelliste vor dem Rückgabe-Scan, Auszahlungsbeleg danach — dasselbe Dokument in zwei Reifegraden.

---

## Überblick

Das Blatt wird an zwei Zeitpunkten gebraucht:

- **vor** dem Rückgabe-Scan als **Einsammelliste** — der Verkäufer geht damit durch die Tische und holt seine unverkauften Artikel
- **nach** dem Abrechnen als **Auszahlungsbeleg** — der einzige Nachweis, den er über die Geldbewegung behält

Beides ist derselbe Inhalt in unterschiedlicher Reife. Zwei getrennte Dokumente mit ähnlichem Aussehen aber unterschiedlicher Verbindlichkeit wären am Tisch die Vorlage für Verwechslungen — deshalb ein Dokument, das seinen Zustand kennt.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────────────────┐
│  Basar 2026 — Verkäufer-Übersicht   ▪▪▪▪▪▪▪         │
│                                     ▪ QR  ▪         │
│  Anna Meier                         ▪▪▪▪▪▪▪         │
│  76133 Karlsruhe                    a3f9c2d1        │
│                                                      │
│  NOCH IM VERKAUF (9)          ← Einsammelliste       │
│  1051  Regenjacke        6,00 €                      │
│  1063  Bausteine         4,50 €                      │
│  …                                                   │
│                                                      │
│  VERKAUFT (31)                                       │
│  1043  Winterjacke      12,00 €                      │
│  …                                                   │
│                                                      │
│  ZURÜCKGEGEBEN (0)                                   │
│  —                                                   │
│  ─────────────────────────────────────────────────── │
│  Umsatz                                380,50 €      │
│  Provision (12,5 %)                  − 47,56 €       │
│  Auszahlung                           332,94 €       │
│                                                      │
│  ℹ Annahmegebühr 20,00 € bereits bezahlt.            │
│  ⚠ VORLÄUFIG — es sind noch Artikel im Verkauf.     │
└─────────────────────────────────────────────────────┘
```

---

## 2. Artikelgruppen

| Gruppe | Bedingung |
|---|---|
| **Noch im Verkauf** | `releasedAt` gesetzt, `soldAt` und `returnedAt` leer |
| **Verkauft** | `soldAt` gesetzt |
| **Zurückgegeben** | `returnedAt` gesetzt |

Je Gruppe die Anzahl in der Überschrift, dann Nummer, Bezeichnung und Preis. Leere Gruppen erscheinen mit „—" statt ganz zu fehlen — sonst wirkt ein Blatt ohne „Zurückgegeben" wie ein anderes Dokument.

**Reihenfolge nach Zweck:** „Noch im Verkauf" steht **oben**, weil das Blatt vor dem Rückgabe-Scan zum Einsammeln dient. Nach dem Abrechnen ist diese Gruppe leer und die Aufmerksamkeit liegt ohnehin auf den Beträgen.

Eine Gruppe „Sonstige" für beschädigte oder zurückgezogene Artikel gibt es **nicht** — diese Zustände existieren im Datenmodell nicht. Ein beschädigter Artikel wird zurückgegeben wie jeder unverkaufte; die Beschädigung ist ein Gespräch am Tisch, kein Datenfeld.

---

## 3. Abrechnungsposten

Dieselben drei Posten wie im [`settlement-panel`](settlement-panel.md), mit denselben gerundeten Werten: Umsatz, Provision mit Satz, Auszahlung. Dazu die Hinweiszeile zur bereits bezahlten Annahmegebühr, damit die Frage „und die Gebühr?" nicht am Tisch entsteht.

Die Gebühr ist **kein Abzugsposten** — sie wurde am Annahmetisch bezahlt.

---

## 4. Reifegrad

| Zeitpunkt | Darstellung |
|---|---|
| Artikel noch im Verkauf | Gruppe „Noch im Verkauf" gefüllt; **alle Beträge deutlich als „VORLÄUFIG" gekennzeichnet** |
| Nach Rückgabe-Scan bzw. nach dem Abrechnen | vollständige Gruppen, **endgültige** Beträge, kein Vorläufig-Vermerk |

Die Kennzeichnung ist der entscheidende Teil: Ein Blatt mit einem Auszahlungsbetrag, der sich noch ändern kann, darf nicht wie die Endabrechnung aussehen. Sie steht als deutlich sichtbare Zeile am Fuß, nicht als kleiner Fußnotenhinweis.

Der Drucken-Button bleibt **auch nach dem Abrechnen** erreichbar, damit der Verkäufer seinen endgültigen Beleg bekommt.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die Artikel in den drei Gruppen Noch im Verkauf, Verkauft und Zurückgegeben mit je einer Anzahl ausgeben; leere Gruppen SHALL mit „—" erscheinen.
2. **AC-2** — THE SYSTEM SHALL die Gruppe „Noch im Verkauf" zuerst ausgeben.
3. **AC-3** — THE SYSTEM SHALL Umsatz, Provision mit Satz und Auszahlung mit denselben gerundeten Werten wie das Abrechnen-Popup ausgeben.
4. **AC-4** — THE SYSTEM SHALL die bereits bezahlte Annahmegebühr als Hinweis ausgeben und nicht als Abzugsposten.
5. **AC-5** — IF noch Artikel im Verkauf sind, THEN SHALL das System alle Beträge deutlich als „vorläufig" kennzeichnen.
6. **AC-6** — THE SYSTEM SHALL die Verkäufernummer als QR-Code und im Klartext ausgeben.
7. **AC-7** — THE SYSTEM SHALL keine Gruppe für beschädigte oder zurückgezogene Artikel ausgeben.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #druck #abrechnung #einsammelliste #beleg #haupt-app

---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: intake-wizard

**Bibliothek:** eigener Wrapper über [`card`](../../../components/card/component.md), [`input-group`](../../../components/input-group/component.md), [`autocomplete-create`](../../../components/autocomplete-create/component.md), [`payment-panel`](../../../components/payment-panel/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md)

## Index
- Überblick — Konzept
- 1. Schritt-Navigation — Tabs
- 2. Schritt 1 — Verkäuferanlage
- 3. Schritt 2 — Artikeleingabe und Sitzungsliste
- 4. Abschluss — Buchen
- 5. Abbrechen — Aufräumen
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Zweistufiger Ablauf am Annahmetisch: Verkäufer anlegen oder auswählen, dann Artikel erfassen und in einem Vorgang buchen.

---

## Überblick

Der Wizard ist die **am häufigsten benutzte Oberfläche der App** — am Basar-Morgen läuft hier jede Abgabe durch, unter Zeitdruck, mit einer Schlange davor. Jede Entscheidung darin ist auf Tempo optimiert: Vorbelegungen statt Auswahl, Enter statt Maus, Fokus automatisch am richtigen Feld.

---

## 1. Schritt-Navigation

```
┌──────────────────────────┬───────────────────────────────┐
│  Schritt 1 — Verkäufer   │  Schritt 2 — Artikelannahme   │
└──────────────────────────┴───────────────────────────────┘
```

Tabs: flex row, `border-bottom: 2 px var(--border)`, mb 20 px. Tab-Item padding 10 px 20 px, 600, 13 px, muted; aktiver Tab in Primärfarbe mit `border-bottom`.

Wird ein **bestehender** Verkäufer gewählt, startet der Wizard direkt in Schritt 2 — Schritt 1 wird übersprungen, nicht leer angezeigt.

---

## 2. Schritt 1 — Verkäuferanlage

Formular mit den Verkäufer-Panels 01–03. Vorname und Nachname sind aus der Sucheingabe vorbelegt: Text **vor** dem ersten Leerzeichen als Vorname, Text **danach** als Nachname.

**Panel 03 — Konditionen:** Der Verkäufer-Typ ist mit dem **am häufigsten zugewiesenen** Typ vorbelegt und frei wählbar. Die abgeleiteten Konditionen erscheinen **schreibgeschützt** — überschreiben darf sie nur der Admin, und zwar über die Verkäufer-Seite. Es ist die einzige Eingabe der App, die unmittelbar Geld verschiebt.

**„Weiter"** legt den Verkäufer **sofort** in der Datenbank an und wechselt zu Schritt 2. Das ist nötig, weil Schritt 2 eine Verkäufer-ID braucht, um Artikel zuzuordnen; ein Zwischenspeichern im Frontend wäre eine zweite Wahrheit.

---

## 3. Schritt 2 — Artikeleingabe und Sitzungsliste

**Layout:** `7fr 3fr`, gap 14 px — links Eingabe, rechts Übersicht.

```
┌────────────────────────────────────┬──────────────────────┐
│ Artikelnummer  [1043   ] [↩][📷][⊞]│ SITZUNG (2)          │
│ Bezeichnung    [Winterjacke      ] │ 1043 Winterjacke  🗑 │
│ Kategorie [Jacken ▾+] Marke [Nike▾+]│ 1044 Gummistiefel 🗑 │
│ Preis          [12,00     ] [€]    │                      │
│ Größe [128    ] Farbe [rot      ]  │ Gebühr:      1,00 €  │
│ Beschreibung   [               ]   │ ┌──────────────────┐ │
│                                    │ │    Speichern     │ │
│           [ Übernehmen ]           │ └──────────────────┘ │
└────────────────────────────────────┴──────────────────────┘
```

| Zeile | Links | Rechts | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer ([`input-group`](../../../components/input-group/component.md), `modes = ['keyboard', 'camera', 'numpad']` — Modus-Mechanik siehe dort, Abschnitt 3) | — | ✅ |
| 2 | Bezeichnung (volle Breite) | — | ✅ |
| 3 | Kategorie ([`autocomplete-create`](../../../components/autocomplete-create/component.md)) | Marke (dito) | ✅ |
| 4 | Preis ([`input-group`](../../../components/input-group/component.md), €-Addon rechts, `modes = ['keyboard', 'numpad']`, Numpad mit `showDecimal="true"`) | — | ✅ |
| 5 | Größe | Farbe | ❌ |
| 6 | Beschreibung (Textarea, volle Breite) | — | ❌ |

**„Übernehmen"** ist deaktiviert, solange ein Pflichtfeld leer ist. Nach dem Klick: Artikel wandert in die Sitzungsliste, Felder leeren sich, **Fokus zurück auf Artikelnummer**.

**Nummernverhalten:**

| Fall | Verhalten |
|---|---|
| Verkäufer ohne Voranmeldung, Feld leer | Vorschlag der nächsten freien Nummer, überschreibbar |
| Nummer bereits vergeben | Fehlermeldung „Artikelnummer bereits vergeben", „Übernehmen" bleibt gesperrt |
| Vorangemeldeter Artikel, Nummer + Enter | Artikel wird geladen und die Felder vorausgefüllt, alle bleiben bearbeitbar |

**Sitzungsliste rechts:** Nummer und Bezeichnung je Eintrag, Klick öffnet ein Popup zum Ändern von Bezeichnung, Kategorie, Marke und Preis, Löschen-Button pro Eintrag. **Nichts davon ist gespeichert** — die Liste lebt im Frontend, bis gebucht wird.

**Leerzustand:** Am Anfang jedes Annahmevorgangs ist die Liste leer — also mehrere Dutzend Mal am Tag. Sie zeigt dann „Noch kein Artikel übernommen.", die Gebührenzeile steht auf `0,00 €`, und **„Speichern" ist deaktiviert**.

Der deaktivierte Button ist der wichtige Teil: Ein aktives „Speichern" bei leerer Liste würde eine Buchung ohne Artikel erzeugen, 0,00 € Gebühr kassieren und einen leeren Beleg drucken.

Kein Handlungsangebot im Leerzustand — das Eingabeformular ist die Handlung und steht direkt daneben.

**Gebühr** = Anzahl Artikel × `feePerItem` des Verkäufers, live aktualisiert.

---

## 4. Abschluss — Buchen

**„Speichern"** öffnet das [`payment-panel`](../../../components/payment-panel/component.md) mit `totalLabel="Gesamtgebühr"` und `confirmLabel="Buchen"`: Gesamtgebühr, „Betrag erhalten", live berechnetes Rückgeld.

„Buchen" löst **einen** Request aus (`POST /api/intake`), der in einer Transaktion alle Artikel anlegt, `acceptedAt` und `releasedAt` setzt und die Gebühr auf `intakeFeePaid` addiert. Erst **nach** erfolgreicher Antwort startet der Abgabe-Beleg.

**Bei Fehlschlag bleibt die Sitzungsliste unverändert stehen**, damit erneut gebucht werden kann. Bei Nummernkollision nennt die Antwort die betroffenen Nummern — das Popup markiert die entsprechenden Einträge und übernimmt den neuen Nummernvorschlag, alle übrigen Eingaben bleiben erhalten.

---

## 5. Abbrechen

Ein sichtbarer Abbrechen-Weg im Wizard entfernt den in dieser Sitzung **gerade angelegten** Verkäufer wieder, solange er keine Artikel hat. Das gilt **auch für Kassenpersonal** — es ist die einzige Ausnahme von „Löschen ist Admin-Sache", denn die eigene Fehleingabe muss zurücknehmbar sein.

Ohne diesen Weg bliebe nach jedem Abbruch ein leerer Verkäufer in der Liste und verfälschte `sellerCount` und Statistik.

## Akzeptanzkriterien

1. **AC-1** — WHEN ein bestehender Verkäufer gewählt wird, THEN SHALL der Wizard direkt in Schritt 2 starten.
2. **AC-2** — THE SYSTEM SHALL Vorname und Nachname aus der Sucheingabe vorbelegen, getrennt am ersten Leerzeichen.
3. **AC-3** — THE SYSTEM SHALL den Verkäufer-Typ mit dem am häufigsten zugewiesenen Typ vorbelegen und die abgeleiteten Konditionen schreibgeschützt anzeigen.
4. **AC-4** — WHILE ein Pflichtfeld leer ist, SHALL „Übernehmen" deaktiviert bleiben.
5. **AC-5** — WHEN ein Artikel übernommen wird, THEN SHALL das System die Felder leeren und den Fokus auf das Artikelnummer-Feld setzen.
6. **AC-6** — THE SYSTEM SHALL die Sitzungsliste ausschließlich im Frontend halten, bis gebucht wird.
7. **AC-7** — WHEN gebucht wird, THEN SHALL das System einen einzigen Request senden und den Druck erst nach erfolgreicher Antwort starten.
8. **AC-8** — IF das Buchen an einer Nummernkollision scheitert, THEN SHALL das System die betroffenen Einträge markieren, den neuen Nummernvorschlag übernehmen und alle übrigen Eingaben erhalten.
9. **AC-9** — WHEN der Wizard nach Schritt 1 abgebrochen wird und der angelegte Verkäufer keine Artikel hat, THEN SHALL das System diesen Verkäufer entfernen — auch mit der Rolle Kassenpersonal.
10. **AC-10** — WHILE die Sitzungsliste leer ist, SHALL das System „Noch kein Artikel übernommen." anzeigen, die Gebühr mit `0,00 €` ausweisen und „Speichern" deaktiviert halten.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #artikelannahme #wizard #annahmetisch #haupt-app

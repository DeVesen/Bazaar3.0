---
id: SPEC-2026-08-18-eingabemodi
status: approved
created: 2026-08-18
scope: Bazaar Haupt-App
---

# Design: Drei Eingabemodi und Numpad-Erweiterung

## Ausgangslage

Zwei Lücken in den bestehenden Specs:

1. **Spacing:** payment-panel C-007 §4 gibt dem Numpad `margin-top: 8px`, die Rückgeld-Box
   `margin: 12px 0`. Der Abstand unter dem Numpad entsteht damit nur zufällig aus der
   Nachbar-Margin; numpad C-008 selbst schreibt gar keinen Außenabstand fest. Für jede neue
   Verwendungsstelle wäre der Abstand erneut offen.
2. **Eingabemodi:** Für Artikelnummer-Felder ist nur ein Umschalt-Ziel spezifiziert (Kamera,
   InputGroup C-012 AC-3). Ein dritter Modus „Nummernblock" fehlt, ebenso die Regel, welche
   Umschalt-Buttons in welchem Modus sichtbar sind.

Nebenbefund: numpad C-008 widerspricht sich. Die ASCII-Skizze zeigt zwölf Tasten
(`7 8 9 / 4 5 6 / 1 2 3 / C 0 ⌫`) ohne Komma; Key-Mapping-Tabelle und AC-4 spezifizieren
eine Komma-Taste. Dieses Design löst den Widerspruch auf.

## Geltungsbereich

Alle Scan- und Nummernfelder der **Haupt-App** (Bazaar-App). Die Voranmelde-App ist nicht
betroffen — sie hat weder Kamera- noch Numpad-Eingabe.

## Entscheidungen

### 1. Numpad (C-008): Grid 4×4 mit Aktionsspalte

```
┌──────┬──────┬──────┬──────┐
│  7   │  8   │  9   │      │
├──────┼──────┼──────┤  ⌫   │
│  4   │  5   │  6   │      │
├──────┼──────┼──────┼──────┤
│  1   │  2   │  3   │      │
├──────┼──────┼──────┤  ⏎   │
│  C   │  ,   │  0   │      │
└──────┴──────┴──────┴──────┘
```

- Spalten 1–3 bleiben unverändert Ziffern; Spalte 4 ist neu und trägt die Aktionstasten.
- `⌫` spannt Zeile 1–2, `⏎` spannt Zeile 3–4.
- Ist `⏎` ausgeblendet, spannt `⌫` alle vier Zeilen.
- Ist das Komma ausgeblendet, bleibt sein Slot leer. Die `0` behält ihre Position; das
  Grid springt bei keinem Moduswechsel.
- Grid: `grid-template-columns: repeat(4, 1fr)`, gap 8 px, alle Tasten min. 48 × 48 px.

**Neue Inputs**

| Input | Typ | Default | Wirkung |
|---|---|---|---|
| `showDecimal` | `boolean` | `false` | Komma-Taste in der unteren Zeile |
| `showEnter` | `boolean` | `false` | `⏎` in der Aktionsspalte |
| `enterDisabled` | `boolean` | `false` | `⏎` deaktiviert |

**Neuer Output**

| Output | Typ | Beschreibung |
|---|---|---|
| `submitted` | `EventEmitter<void>` | Emittiert bei Klick auf `⏎` |

`⏎` emittiert **kein** `keyPressed` mit `key: 'Enter'`, sondern ein eigenes Event — analog
zu `cleared`. Grund: Was „Enter" bedeutet, entscheidet das Parent (Artikel-Lookup an einem
Nummernfeld, „Bezahlt" im Payment-Panel). Der Numpad bleibt zustandsloser Event-Relay und
kennt die Zielaktion nicht.

**Spacing:** Das Grid erhält `margin: 16px 0`. Damit gilt derselbe Abstand nach oben zum
Eingabefeld und nach unten zum Folgeelement an jeder Verwendungsstelle, ohne dass ein Parent
ihn erneut festlegt. payment-panel §4 wird angeglichen.

### 2. InputGroup (C-012): Drei Eingabemodi

```
[ 🔍 ][ Feld            ][ ✕/Spinner ][ ↩ ][ Modus-A ][ Modus-B ]
```

Feste Modus-Reihenfolge **Tastatur → Kamera → Numpad**. Sichtbar sind stets die beiden
*nicht* aktiven Modi in dieser Reihenfolge:

| Aktiver Modus | Modus-A | Modus-B |
|---|---|---|
| Tastatur | 📷 Kamera | ⊞ Numpad |
| Kamera | ⌨ Tastatur | ⊞ Numpad |
| Numpad | ⌨ Tastatur | 📷 Kamera |

Die feste Reihenfolge hält die Button-Positionen vorhersehbar: Der linke Modus-Button ist
immer der in der Kette frühere.

**Verhalten je Modus**

- **Tastatur** — normales Eingabefeld mit `pAutoFocus`. Ein USB-Barcode-Scanner arbeitet per
  Tastatur-Emulation und tippt in genau dieses Feld; er ist deshalb *kein* eigener Modus.
- **Numpad** — Feld `readonly`, damit keine native Tastatur erscheint. Der Numpad steht
  unter dem Feld. `⏎` löst dieselbe Aktion aus wie der `↩`-Button.
- **Kamera** — Live-Kamerabild **an der Position des Eingabefeldes**, kein Modal und kein
  Backdrop (Muster ANNAHME-S01 AC-1). Die Modus-Buttons bleiben dadurch erreichbar.

**Neuer Input**

| Input | Typ | Beschreibung |
|---|---|---|
| `modes` | `InputMode[]` | Verfügbare Modi dieses Feldes |

Felder mit nur zwei verfügbaren Modi zeigen genau *einen* Modus-Button. Das deckt das
heutige Payment-Panel (Tastatur + Numpad) unverändert ab.

**Ersetzte Regel:** C-012 AC-3 („`↩` wenn gefüllt, `📷` wenn leer") entfällt. Neu ist `↩`
immer sichtbar und `disabled`, solange das Feld leer ist. `📷` ist kein Action-Button mehr,
sondern ein Modus.

**Startmodus:** Jede Seite und jedes Popup startet im Tastatur-Modus. Die Modus-Wahl gilt
bis zum Verlassen der Seite bzw. des Popups und wird nicht persistiert. Ein Tablet mit
angestecktem USB-Scanner ist damit ohne Umschalten sofort einsatzbereit — der
gerätebasierte Default aus C-008 §4 (`pointer: coarse` → Numpad) entfällt für diese Felder.

### 3. Kamera-Modus im Verkauf: Rückkehr nach Treffer

Im Verkauf verlässt der Kamera-Modus sich nach dem ersten Treffer selbst und schaltet in
den zuvor aktiven Modus zurück. Der erkannte Wert steht im Feld, der Artikel-Lookup läuft,
der Preis-Button erscheint — der bestehende Ablauf aus Epic_Verkauf §2 bleibt unverändert.
Ein Artikel gelangt weiterhin nur per Klick auf den Preis-Button in den Warenkorb.

Das unterscheidet den Verkauf vom Dauerscan-Verhalten in ANNAHME-S01 (Countdown, Kamera
startet automatisch neu). Dort werden Zeitstempel gesetzt, hier wird Geld kassiert; der
Bestätigungsschritt bleibt.

### 4. Payment-Panel (C-007)

`showDecimal = true`, `showEnter = true`, `enterDisabled` an `receivedAmount < totalAmount`
gekoppelt — identisch zur Bedingung des Bestätigen-Buttons. `⏎` löst denselben Vorgang aus
wie der Footer-Button, sodass der Kassiervorgang einhändig am Numpad bleibt.

## Kamera-Lebensdauer

Da der Kamera-Modus kein Modal mehr ist, fehlt der bisherige Freigabe-Trigger
(VERKAUF-S01 AC-9: „beim Schließen des Modals"). Ersatz: Das System setzt `active = false`
und gibt alle MediaStream-Tracks frei, sobald

- in einen anderen Eingabemodus gewechselt wird,
- ein Treffer den Kamera-Modus beendet,
- das umgebende Popup geschlossen oder die Route verlassen wird.

## Betroffene Dokumente

### Zu ändern

| Dokument | Änderung |
|---|---|
| `docs/components/input-group/component.md` | Abschnitt „Eingabe-Modi", Modus-Tabelle, `modes`-Input, Startmodus; AC-3 ersetzt; neue ACs für Umschaltregel und Numpad-`readonly` |
| `docs/components/numpad/component.md` | Grid 4×4, ASCII neu, drei neue Inputs, Output `submitted`, `margin: 16px 0`, Komma-Widerspruch aufgelöst, §4 verweist für den Toggle auf C-012 |
| `docs/components/payment-panel/component.md` | Numpad-Flags, `⏎`-Verhalten, Spacing angeglichen, Zwei-Modi-Fall über `modes` formuliert |
| `docs/components/scan-dialog/component.md` | Eigener Zwei-Modi-Umschalter (`[📷]` / „← Eingabe") entfällt zugunsten der InputGroup-Modi; Numpad kommt hinzu |
| `docs/requirements/bazaar-app/epics/Epic_Verkauf/epic.md` §2 | Drei Eingabemodi; Kamera inline statt Popup; Rückkehr nach Treffer; `reviewed`-Status zurückgesetzt |
| `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md` | Artikelnummer-Feld in Wizard Schritt 2: dritter Modus, Verweis auf C-012 |
| `docs/requirements/bazaar-app/components/intake-wizard.md` | dito |
| `.../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md` | Querverweise auf den Popup-Modus entfernt; „← Eingabe"-Button (AC-5) wird regulärer Modus-Button |
| `.../Epic_Verkauf/stories/VERKAUF-S01-popup-camera-mode.md` | Umschreiben statt löschen — siehe unten |

### VERKAUF-S01 wird umgeschrieben

Neuer Titel: **„Drei Eingabemodi im Kassenvorgang"**. Der Popup-Modus entfällt vollständig.
Die Story trägt künftig die Verkauf-spezifischen Akzeptanzkriterien: welche Modi das
Artikelnummer-Feld anbietet, Rückkehr in den vorherigen Modus nach einem Treffer,
Zusammenspiel mit dem Preis-Button, Kamera-Freigabe beim Verlassen der Route. Die
Modus-Mechanik selbst steht in C-012 und wird nur referenziert, nicht wiederholt.
Der Dateiname wechselt zu `VERKAUF-S01-eingabemodi.md`; alle Querverweise werden nachgezogen.

### Je Feld zu entscheiden

Für diese Felder ist beim Umsetzen festzulegen, welche Modi sie anbieten:

| Feld | Vorschlag |
|---|---|
| `docs/components/seller-search/component.md` | Sucht nach Name *und* Nummer: Tastatur + Numpad, keine Kamera. Nur Tastatur, falls die Nummernsuche entfällt |
| Epic_Verkaeufer §5 — Freigeben-Popup | alle drei (über Scan-Dialog) |
| Epic_Abrechnung — Rückgabe-Popup | alle drei (über Scan-Dialog) |
| InputGroup-Preis-Variante (€) | Tastatur + Numpad, keine Kamera. Achtung: C-012 §4 schreibt für diese Variante heute „kein Clear-Button, kein Action-Button" — der Modus-Button ist eine bewusste Ausnahme davon und muss dort ergänzt werden |

### Review-Status

`Epic_Verkauf` trägt heute `status: reviewed` mit `reviewed-date: 2026-08-17`. Da dieses
Design ein abgenommenes Epic fachlich verändert, wird der Status auf `draft` zurückgesetzt
und `reviewed-date` entfernt; das Epic durchläuft den Review erneut.

## Nicht in diesem Design

- Voranmelde-App — kein Kamera- oder Numpad-Eingang
- Countdown-, Ton- und Vibrations-Feedback des Inline-Scanners (bleibt ANNAHME-S01)
- Artikel-Erkennung und Warenkorb-Logik (bleibt Epic_Verkauf §2/§3)
- Eine zentrale Spacing-Skala oder Design-Token-Datei — der Abstand wird am Numpad
  festgeschrieben, nicht global

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #eingabemodi #numpad #kamera #inputgroup #spacing #kassenvorgang

---
id: F-BA-003
status: draft
updated: 2026-07-31
---

# Epic: Abrechnung

## Index
- Überblick — Prozess-Ablauf
- 1. Verkäufer-Selektion — Auswahl
- 2. Abrechnungs-Ansicht — Hauptansicht
- 3. Zurückgeben-Popup — Rückgabe
- 4. Abrechnen-Popup — Abrechnung
- 5. Druckfunktion — Ausdruck
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Abrechnung

**Ziel:** Kassenpersonal rechnet einen Verkäufer ab und bereitet die Auszahlung vor.

**User Story:** Als Kassenpersonal möchte ich einen Verkäufer auswählen, seine Artikel abrechnen und einen Ausdruck erstellen, damit die Auszahlung korrekt und dokumentiert erfolgt.

---

## Überblick

Die Abrechnung-Seite verwaltet Rückgabe nicht verkaufter Artikel und die finanzielle Abrechnung mit dem Verkäufer. Beim Navigieren auf die Seite wird **immer** zuerst die Verkäufer-Auswahl angezeigt.

---

## 1. Verkäufer-Selektion

→ Komponente: [Seller-Search](../../../../components/seller-search/component.md) — `showCreateButton="false"`

Identische Suchfeld-Ansicht wie Artikelannahme — InputGroup in Card, max-width 500 px.
Hinweistext: „ENTER bei 1 Treffer oder direkt klicken" (12.5 px, muted, mt 8 px).

Die Seite funktioniert als **Wizard**: Selektion ausblenden → Abrechnungs-Ansicht einblenden.
In der Abrechnungs-Ansicht gibt es ein **„← Zurück"**-Element zur Selektion.

**Unterschied zu Artikelannahme:** Es muss **exakt ein** Verkäufer selektiert werden — kein „Anlegen"-Button.

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer in der Liste |
| Text | Filtert nach Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER oder Klick | Wechsel zur Abrechnungs-Ansicht |
| Mehr als 1 Treffer + ENTER | Keine Aktion |

---

## 2. Abrechnungs-Ansicht

### Kopfzeile

`display: flex; align-items: center; gap: 14px; background: white; border: 1px solid --border; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px`

- Links (flex-column): Name (700, 16 px) + Adresse (13 px, muted)
- Rechts (`margin-left: auto; display: flex; gap: 8px`): Buttons in Reihenfolge:
  1. „← Zurück" (`secondary outlined`)
  2. „🖨️ Drucken" (`secondary outlined`)
  3. „↩ Zurückgeben" (`primary`)
  4. „✓ Abrechnen" (`success`)

### Button-Regeln

| Button | Aktiv wenn |
|---|---|
| **Drucken** | Immer aktiv |
| **Zurückgeben** | Mindestens 1 Artikel hat Status „freigegeben" (noch im Verkauf) |
| **Abrechnen** | Mindestens 1 Artikel wurde freigegeben **UND** alle freigegebenen Artikel sind entweder Verkauft oder Zurückgegeben (kein Artikel mehr offen im Verkauf) |

### KPI-Kacheln (3 Stück, `c3`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c3`

| Kachel | Farbe |
|---|---|
| Offene Artikel (noch im Verkauf) | warning |
| Verkaufte Artikel | success |
| Umsatz | — |

### Artikelliste

Alle Artikel dieses Verkäufers (wie Artikel-Übersicht, gefiltert auf diesen Verkäufer).

---

## 3. Zurückgeben-Popup

→ Komponente: [Scan-Dialog](../../../../components/scan-dialog/component.md) — `targetField="rückgegebenAm"`

Identisch zum Artikel-Freigeben-Popup (→ [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md)) — gleicher Aufbau, gleiche Kamera/Eingabe-Modi, gleiche Scan-Feedback-Logik.

**Einziger Unterschied:** Statt `freigegebenAm` wird `rückgegebenAm = jetzt` gesetzt.

---

## 4. Abrechnen-Popup

Größe `sm`. Auflistung der Abrechnungsposten:

```
Umsatz (Summe verkaufter Artikel)                        XX,XX €
Provision (Umsatz × Verkäufer.provision %)             − XX,XX €
────────────────────────────────────────────────────────────────
Auszahlung an Verkäufer                                  XX,XX €
```

> Maßgeblich ist `Verkäufer.provision` — das eigene Feld der Verkäufer-Entität, nicht der aktuell zugewiesene Type-Wert.

**Zeilen-Stil:** flex space-between, padding 7 px 0, 15 px, border-bottom 1 px `#f2f4f6`.
**Total-Zeile:** border-top 2 px, kein border-bottom, mt 8 px, pt 10 px; Betrag in success-Farbe, 18 px, 700.
Provisions-Zeile: Betrag in danger-Farbe.

Klick **„Buchen"** → `abgerechnetAm = jetzt` wird am Verkäufer gesetzt.

---

## 5. Druckfunktion (Abrechnung)

Beim Klick auf **„Drucken"** wird die Verkäufer-Übersicht gedruckt.
Details → [Epic_Druckfunktionen](../Epic_Druckfunktionen/epic.md)

## Akzeptanzkriterien

1. **AC-1** — WHEN die Abrechnung-Seite geöffnet wird, THEN SHALL das System die Verkäufer-Auswahl anzeigen und keinen Verkäufer vorselektieren.
2. **AC-2** — WHEN ein Verkäufer ausgewählt wird, THEN SHALL das System seine Kennzahlen (Warenwert, Provision, Gebühr, Auszahlung) und seine Artikelliste laden und anzeigen.
3. **AC-3** — WHILE ein Verkäufer noch Artikel mit Status `freigegeben` hat, SHALL das System den „Abrechnen"-Button deaktiviert halten.
4. **AC-4** — WHEN „Abrechnen" geklickt wird, THEN SHALL das System alle Artikel des Verkäufers mit Status `verkauft` auf Status `abgerechnet` und `abgerechnetAm = jetzt` setzen.
5. **AC-5** — WHEN „Zurückgeben" geklickt wird, THEN SHALL das System alle Artikel des Verkäufers mit Status `freigegeben` auf Status `retour` setzen.
6. **AC-6** — WHEN „🖨️ Drucken" geklickt wird, THEN SHALL das System den Druckdialog mit gruppierten Artikeln (Im Verkauf, Verkauft, Sonstige) öffnen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #abrechnung #verkäufer #auszahlung #provision #drucken

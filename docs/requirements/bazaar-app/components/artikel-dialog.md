---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: artikel-dialog

**Bibliothek:** [`modal`](../../../components/modal/component.md) + [`input`](../../../components/input/component.md) + [`input-group`](../../../components/input-group/component.md) + [`autocomplete-create`](../../../components/autocomplete-create/component.md) + [`confirmdialog`](../../../components/confirmdialog/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 2

## Index
- Überblick — Abgrenzung zur Voranmelde-App
- 1. ASCII-Darstellung — Layoutskizze
- 2. Felder — Was änderbar ist
- 3. Sperren — Gestaffelt nach Zustand
- 4. Löschen — Bedingung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Bearbeiten eines bestehenden Artikels — mit gestaffelten Sperren je nach Verkaufs- und Abrechnungsstand.

---

## Überblick

**Eigene Datei, nicht die Variante der Voranmelde-App.** Dort ist ein Artikel ein Datensatz, den der Verkäufer frei pflegt. Hier ist er ein Vorgang mit Geldwirkung: Sobald er verkauft ist, ist der Preis der Umsatz, und nach der Abrechnung ist alles gesperrt.

| Aspekt | Voranmelde-App | Haupt-App |
|---|---|---|
| Anlegen | im Dialog | **nicht hier** — Artikel entstehen über Annahme oder Import |
| Artikelnummer | Vorschlag, beim Speichern endgültig vergeben | **read-only**, klebt physisch am Etikett |
| Preis | jederzeit änderbar | **gesperrt ab Verkauf** |
| Sperre nach Abrechnung | existiert nicht | **alle Felder** |
| Löschen | eigener Artikel jederzeit | **Admin-only**, nur vor dem Verkauf |

---

## 1. ASCII-Darstellung

```
┌────────────────────────────────────────────────┐
│  Artikel bearbeiten                       [✕]  │
├────────────────────────────────────────────────┤
│  Artikelnummer  1043            (read-only)     │
│                                                  │
│  [Bezeichnung *                        100%]     │
│  [Kategorie * ▾+  50%] [Marke * ▾+      50%]    │
│  [Preis *         50%] [€][⊞]                    │
│  [Größe           50%] [Farbe           50%]    │
│  [Beschreibung                         100%]     │
├────────────────────────────────────────────────┤
│  [Löschen]              [Abbrechen] [Speichern] │
└────────────────────────────────────────────────┘
```

Modal Standard-Größe. Feldanordnung identisch zur Artikeleingabe im [`intake-wizard`](intake-wizard.md) — dieselbe Reihenfolge, damit niemand umdenken muss.

**Kein „+ Neu"** auf der Artikel-Seite: Artikel entstehen ausschließlich über die Artikelannahme oder den Import.

---

## 2. Felder

| Feld | Pflicht | Bemerkung |
|---|---|---|
| Artikelnummer | — | **read-only**, oben; die Nummer klebt am Etikett |
| Bezeichnung | ✅ | |
| Kategorie, Marke | ✅ | [`autocomplete-create`](../../../components/autocomplete-create/component.md) — neue Werte anlegbar |
| Preis | ✅ | [`input-group`](../../../components/input-group/component.md), €-Addon rechts, `modes = ['keyboard', 'numpad']`, Numpad mit `showDecimal="true"` — analog zur Preis-Zeile im [`intake-wizard`](intake-wizard.md) |
| Größe, Farbe, Beschreibung | ❌ | |

Der Verkäufer ist **nicht** änderbar und erscheint nicht als Feld — ein Artikel wechselt nicht den Besitzer.

---

## 3. Sperren

Je näher ein Feld am Geld liegt, desto strenger:

| Zustand | Änderbar | Anzeige im Dialog |
|---|---|---|
| Im Verkauf | alles | — |
| `soldAt` gesetzt | alles **außer Preis** | Preisfeld deaktiviert, Hinweis „Verkauf zuerst stornieren" |
| Verkäufer abgerechnet | **nichts** | alle Felder deaktiviert, Hinweisbanner „Abrechnung zuerst stornieren" mit Verweis auf die Verkäufer-Seite |

Der Preis ist ab dem Verkauf gesperrt, weil er **der Umsatz ist** — ihn nachträglich zu ändern hieße, die Abrechnung von dem zu entkoppeln, was der Kunde bezahlt hat.

Bezeichnung, Beschreibung, Größe und Farbe bleiben auch nach dem Verkauf änderbar: Sie beschreiben den Vorgang, sie verändern seinen Betrag nicht. Marke und Kategorie ebenfalls — sie beeinflussen nur Filter und Statistik-Gruppierung.

Alle Sperren werden **serverseitig** durchgesetzt (`409`); die deaktivierten Felder sind die Bequemlichkeit, nicht die Regel.

---

## 4. Löschen

Löschen-Button links im Footer (`danger`), **nur für Admins**, und **nur solange `soldAt` leer ist** — sonst `409` mit dem Hinweis, den Verkauf zuerst zu stornieren.

Ein verkaufter Artikel ist ein Geldvorgang, kein Datensatz. Für Fehleingaben vor dem Verkauf bleibt Löschen frei.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die Artikelnummer schreibgeschützt anzeigen und keinen Verkäufer-Wechsel anbieten.
2. **AC-2** — IF `soldAt` gesetzt ist, THEN SHALL das Preisfeld deaktiviert sein und einen Hinweis auf das Stornieren zeigen.
3. **AC-3** — IF der Verkäufer abgerechnet ist, THEN SHALL das System alle Felder deaktivieren und ein Hinweisbanner mit Verweis auf die Verkäufer-Seite anzeigen.
4. **AC-4** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL der Löschen-Button nicht gerendert werden.
5. **AC-5** — IF `soldAt` gesetzt ist, THEN SHALL das System das Löschen ablehnen.
6. **AC-6** — THE SYSTEM SHALL beim Speichern eines Pflichtfelds ohne Wert eine Feldmeldung anzeigen und nicht speichern.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #artikel #dialog #sperren #haupt-app

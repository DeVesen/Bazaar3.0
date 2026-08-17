---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: verkaeufer-dialog

**Bibliothek:** [`modal`](../../../components/modal/component.md) + [`input`](../../../components/input/component.md) + [`select`](../../../components/select/component.md) + [`inputnumber`](../../../components/inputnumber/component.md) + [`confirmdialog`](../../../components/confirmdialog/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 4, Story VERK-S01

## Index
- Überblick — Abgrenzung zur Voranmelde-App
- 1. ASCII-Darstellung — Panels
- 2. Panels — Felder
- 3. Konditionen — Rollen und Typwechsel
- 4. Löschen — Bedingung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Anlegen und Bearbeiten eines Verkäufers mit Personendaten, Kontakt und Konditionen.

---

## Überblick

**Eigene Datei, nicht die Variante der Voranmelde-App** — die HA-Fassung trägt drei Dinge, die es dort nicht gibt: überschreibbare Konditionsfelder, den Typwechsel mit Überschreiben und das Löschen. Eine Varianten-Tabelle wäre länger als zwei eigene Dateien.

| Aspekt | Voranmelde-App | Haupt-App |
|---|---|---|
| Konditionen | nur Anzeige, aus dem Typ aufgelöst | **eigene Felder**, vom Admin überschreibbar |
| Panel „Sonstiges" | Admin-Rechte-Toggle, Einladungs-Link | **keines** — Verkäufer sind hier keine Benutzer |
| Löschen | im Profil des Verkäufers | **hier**, Admin-only, nur ohne Artikel |
| Pflichtfelder | Adresse, PLZ, Ort, Telefon zusätzlich | nur Vorname, Nachname, E-Mail, Typ |

Die schmaleren Pflichtfelder haben einen Grund: Laufkundschaft wird am Annahmeplatz erfasst, während eine Schlange wartet. In der Voranmelde-App tippt der Verkäufer selbst und ohne Zeitdruck.

---

## 1. ASCII-Darstellung

```
┌────────────────────────────────────────────────┐
│  Verkäufer bearbeiten                     [✕]  │
├────────────────────────────────────────────────┤
│  PERSONENDATEN                                  │
│  [Vorname *      50%] [Nachname *      50%]     │
│  [Anschrift                          100%]      │
│  [PLZ            50%] [Ort             50%]     │
│                                                  │
│  KONTAKT                                        │
│  [Telefon        50%] [E-Mail *        50%]     │
│                                                  │
│  KONDITIONEN                                    │
│  [Verkäufer-Typ *                    100%]      │
│  [Gebühr je Stück 50%] [Provision %    50%]     │
├────────────────────────────────────────────────┤
│  [Löschen]              [Abbrechen] [Speichern] │
└────────────────────────────────────────────────┘
```

Modal Standard-Größe. Panel-Titel: 11 px, 700, uppercase. Identische Feldanordnung wie Schritt 1 des [`intake-wizard`](intake-wizard.md) — wer beides bedient, soll nicht umdenken.

---

## 2. Panels

| Panel | Felder | Pflicht |
|---|---|---|
| Personendaten | Vorname, Nachname, Anschrift, PLZ, Ort | Vorname, Nachname |
| Kontakt | Telefon, E-Mail | E-Mail |
| Konditionen | Verkäufer-Typ, Gebühr je Stück, Provision | Typ |

Die E-Mail ist Pflicht, aber **kein Login** — sie dient nur der Kontaktaufnahme, wenn nach dem Basar etwas offen ist.

---

## 3. Konditionen

| Aktion | Admin | Kassenpersonal |
|---|---|---|
| Typ wählen | ✅ | ✅ |
| Gebühr und Provision überschreiben | ✅ | ❌ — schreibgeschützt sichtbar |

Es ist die einzige Eingabe der App, die unmittelbar Geld verschiebt, und am Annahmetisch wird unter Zeitdruck im Gespräch mit dem Verkäufer getippt — genau die Situation, in der „ausnahmsweise nur 5 %" entsteht. Über den Typ bleibt jede Kondition nachvollziehbar, über ein freies Feld nicht.

**Typwechsel überschreibt beide Werte** mit denen des neuen Typs, auch manuell gesetzte. Vorher erscheint ein Bestätigungsdialog mit den **konkreten alten und neuen Werten**:

```
Typ von „Privat" auf „Händler" wechseln?
Gebühr    0,50 €  →  1,00 €
Provision  10,0 %  →  20,0 %
```

Ohne diese Ansage hätte der Wechsel entweder keine Wirkung (Override überlebt) oder eine unsichtbare — und im zweiten Fall fällt es erst bei der Auszahlung auf, wenn der Verkäufer davorsteht.

Beträge und Prozentwerte als [`inputnumber`](../../../components/inputnumber/component.md), Varianten Geld und Prozent.

---

## 4. Löschen

Der Löschen-Button sitzt links im Footer (`danger`), **nur für Admins**, mit Bestätigungsdialog.

**Nur möglich, solange der Verkäufer keine Artikel hat** — sonst `409` mit der Anzahl im Dialogtext. Ein Verkäufer mit verkauften Artikeln hängt an Kassenvorgängen; ihn zu entfernen würde Umsätze verwaisen lassen.

Bewusst hier und nicht auf der Karte: Vier Klickflächen pro Karte sind das Maximum, und ein Papierkorb auf jeder Kachel lädt zum Verklicken ein.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL als Pflichtfelder nur Vorname, Nachname, E-Mail und Verkäufer-Typ verlangen.
2. **AC-2** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System Gebühr und Provision schreibgeschützt anzeigen.
3. **AC-3** — WHEN der Typ gewechselt wird, THEN SHALL das System vorher einen Bestätigungsdialog mit den konkreten alten und neuen Werten anzeigen und nach Bestätigung beide Felder überschreiben.
4. **AC-4** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL der Löschen-Button nicht gerendert werden.
5. **AC-5** — IF der Verkäufer noch Artikel hat, THEN SHALL das System das Löschen ablehnen und die Anzahl der Artikel nennen.
6. **AC-6** — THE SYSTEM SHALL kein Panel für Admin-Rechte oder Einladungs-Links anzeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #verkaeufer #dialog #konditionen #haupt-app

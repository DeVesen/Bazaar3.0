---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: seller-detail-modal

**Bibliothek:** [`modal`](../../../components/modal/component.md) + [`qr-code`](../../../components/qr-code/component.md) + [`table`](../../../components/table/component.md) + [`badge`](../../../components/badge/component.md)
**Verwendung:** Nur Haupt-App — Klick auf eine [`seller-card`](seller-card.md) ([Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 5)

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Bereiche
- 3. Rein lesend — Begründung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Nachschau-Modal mit Verkäufernummer, QR-Code und der vollständigen Artikelliste eines Verkäufers.

---

## Überblick

Beantwortet die häufigste Frage am Annahmetisch: **„Welche Artikel hat dieser Verkäufer, und welche sind schon freigegeben?"**

Ohne dieses Modal müsste man auf die Artikel-Seite wechseln und dort nach dem Verkäufer filtern — zwei Navigationsschritte für eine Frage, die man am Tisch in Sekunden beantwortet haben will.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────────┐
│  Anna Meier   [Privat]  [Im Verkauf]        [✕]  │
├──────────────────────────────────────────────────┤
│  Verkäufernummer                ▪▪▪▪▪▪▪          │
│  a3f9c2d1                       ▪ QR  ▪          │
│                                 ▪▪▪▪▪▪▪          │
├──────────────────────────────────────────────────┤
│  Nr.   Bezeichnung        Preis     Status        │
│  1043  Winterjacke       12,00 €   Verkauft       │
│  1044  Gummistiefel       8,00 €   Im Verkauf     │
│  1051  Regenjacke         6,00 €   Registriert    │
│  …                                                │
├──────────────────────────────────────────────────┤
│                                    [Schließen]    │
└──────────────────────────────────────────────────┘
```

---

## 2. Aufbau

| Bereich | Inhalt |
|---|---|
| Kopf | Name, Typ-Badge, Status-Badge — dieselben Badges wie auf der Karte |
| Verkäufernummer | `id` im Klartext **und** als QR-Code |
| Artikelliste | Nummer, Bezeichnung, Preis, Status je Artikel; nicht paginiert |

Der QR-Code enthält die **Verkäufernummer**, nicht die Artikelnummern — er dient dazu, den Verkäufer bei Rückgabe und Abrechnung schnell wiederzufinden. Es ist derselbe Baustein, den auch der Abgabe-Beleg und die Voranmelde-App verwenden: eine Komponente, drei Verwendungen.

Die Liste ist **nicht paginiert**: Ein Verkäufer hat Dutzende Artikel, keine Tausende, und Blättern in einem Modal ist unnötige Bedienung.

**Leerzustand:** Bei einem gerade angelegten Verkäufer ist die Liste leer — sie zeigt dann „Noch keine Artikel erfasst.". Nummer und QR-Code bleiben sichtbar, denn sie sind der Hauptzweck des Modals.

Kein Handlungsangebot: Artikel entstehen in der Artikelannahme, nicht hier, und ein Link dorthin würde den gerade geöffneten Vorgang verlassen.

---

## 3. Rein lesend

Keine Aktionen: kein Edit, kein Status-Popup, kein Löschen. Wer korrigieren muss, tut das auf der [Artikel-Seite](../epics/Epic_Artikel/epic.md), wo die Sperrregeln beschrieben sind.

Zwei Oberflächen mit denselben Aktionen und unterschiedlichen Sperren wären genau die Art Doppelung, die auseinanderläuft — und in einem Modal, das man mit einem Klick auf die Karte erreicht, ist eine zerstörende Aktion zu leicht erreichbar.

## Akzeptanzkriterien

1. **AC-1** — WHEN auf eine Verkäufer-Karte außerhalb der Aktions-Buttons und des Status-Badges geklickt wird, THEN SHALL das System dieses Modal öffnen.
2. **AC-2** — THE SYSTEM SHALL die Verkäufernummer im Klartext und als QR-Code anzeigen.
3. **AC-3** — THE SYSTEM SHALL alle Artikel des Verkäufers mit Nummer, Bezeichnung, Preis und Status ohne Paginierung anzeigen.
4. **AC-4** — THE SYSTEM SHALL keine schreibende Aktion anbieten.
5. **AC-5** — WHILE der Verkäufer keine Artikel hat, SHALL das System „Noch keine Artikel erfasst." anzeigen und Nummer sowie QR-Code weiterhin darstellen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #verkaeufer #modal #qr-code #haupt-app

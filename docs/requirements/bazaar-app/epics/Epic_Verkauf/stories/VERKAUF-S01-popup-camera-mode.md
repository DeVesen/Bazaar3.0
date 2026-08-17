---
id: VERKAUF-S01
status: draft
depends-on: []
---

# Story: Popup-Kamera-Scanner im Kassenvorgang

## Ziel

Als Kassenpersonal kann ich im Kassenvorgang eine Artikelnummer per Kamera-Scan erfassen,
damit ich auch ohne USB-Barcode-Scanner Artikel in den Warenkorb legen kann.

## Kontext

Das Artikelnummer-Eingabefeld folgt der InputGroup-Konvention: Solange das Feld **leer**
ist, erscheint rechts ein Kamera-Button (📷) statt des Action-Buttons (↩). Ein Klick
öffnet ein Modal-Overlay mit Live-Kamerabild. Nach erfolgreichem Scan schließt das Modal
automatisch, der erkannte Wert landet im Eingabefeld und die Artikel-Erkennung startet
unmittelbar — genau wie bei Tastatureingabe mit Enter.

Derselbe Popup-Modus gilt für das Artikelnummer-Feld in **Wizard Schritt 2** der
[Artikelannahme](../../Epic_Artikelannahme/epic.md). Der zweite Scanner-Modus (inline,
bleibt offen und quittiert mit Countdown) ist in
[ANNAHME-S01](../../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md)
beschrieben.

## Scope

**In Scope:** Kamera-Button im InputGroup, Modal mit Kamerabild, Übernahme des ersten
erkannten Codes, automatisches Schließen, Fokus-Handling, Abbrechen, Freigabe der Kamera,
Fehlerfall ohne Kamerazugriff.

**Out of Scope:** Artikel-Erkennung, InfoArea-Zustände und Preis-Button (Epic
Abschnitt 2), Warenkorb und Bezahlpopup (Epic Abschnitte 3–4), Inline-Modus (ANNAHME-S01).

## UI-Spezifikation

### Eingabebereich — Feld leer (Kamera-Button sichtbar)

```
┌────────────────────────────────────┐
│  Artikelnummer eingeben            │
├──────────────────────────────────┬─┤
│  [Nummer eingeben ...           ]│📷│ ← AC-1
└──────────────────────────────────┴─┘
```

### Kamera-Modal (geöffnet)

```
╔═════════════════ Modal-Overlay ══════════╗
║  Kamera-Scan                        [✕] ║ ← AC-4
╠══════════════════════════════════════════╣
║                                          ║
║   ┌──────────────────────────────────┐   ║
║   │        [Live-Kamerabild]         │   ║
║   │   ┌──────────────────────────┐   │   ║
║   │   │     Scan-Rahmen          │   │   ║
║   │   └──────────────────────────┘   │   ║
║   └──────────────────────────────────┘   ║
║                                          ║
╚══════════════════════════════════════════╝
  Backdrop rgba(0,0,0,0.52) · pFocusTrap (AC-6)
```

### Nach Scan — Modal geschlossen, Wert übernommen

```
┌──────────────────────────────────┬─────┐
│  12345678                     ✕  │  ↩  │ ← AC-3
└──────────────────────────────────┴─────┘
  Artikel-Lookup startet sofort
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHILE das Artikelnummer-Eingabefeld leer ist, SHALL das System den Kamera-Button (📷) als Action-Button der InputGroup anzeigen.
- [ ] **AC-2** — WHEN der Kamera-Button geklickt wird, THEN SHALL das System ein Modal-Overlay (`p-dialog [modal]="true"`) mit dem Live-Kamerabild öffnen und den Scanner mit `active=true` starten.
- [ ] **AC-3** — WHEN ein Barcode oder QR-Code im Kamerabild erkannt wird, THEN SHALL das System das Modal schließen und den erkannten Wert in das Artikelnummer-Eingabefeld übernehmen, sodass der Artikel-Lookup unmittelbar ausgelöst wird.
- [ ] **AC-4** — WHEN der Schließen-Button (✕) im Kamera-Modal geklickt wird, THEN SHALL das System das Modal schließen und das Eingabefeld unverändert lassen.
- [ ] **AC-5** — IF die Kamera nicht verfügbar oder der Zugriff verweigert wird, THEN SHALL das System das Modal schließen und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.
- [ ] **AC-6** — WHILE das Kamera-Modal offen ist, SHALL das System den Fokus innerhalb des Modals halten (pFocusTrap).
- [ ] **AC-7** — WHEN das Eingabefeld mindestens ein Zeichen enthält, THEN SHALL das System den Kamera-Button durch den Action-Button (↩) ersetzen.
- [ ] **AC-8** — WHEN nach dem ersten Treffer weitere Codes emittiert werden, THEN SHALL das System sie verwerfen — je Modal-Öffnung wird genau ein Wert übernommen.
- [ ] **AC-9** — WHEN das Modal geschlossen wird (beliebiger Weg), THEN SHALL das System `active=false` setzen, sodass die Scanner-Komponente alle MediaStream-Tracks freigibt, und den Fokus auf das Artikelnummer-Feld zurückgeben.

## Abhängigkeiten

| Abhängigkeit | Grund |
|---|---|
| [Barcode-Scanner](../../../../../components/barcode-scanner/component.md) | Videobild und `codeDetected`; das Modal rahmt sie ein |
| Epic Abschnitt 2 | Artikel-Erkennung, die diese Story nur auslöst |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #kamera #scanner #popup-modus #barcode #kassenvorgang #modal #inputgroup

---
id: VERKAUF-S01
status: draft
depends-on: []
---

# Story: Popup-Kamera-Scanner im Kassenvorgang

## Ziel
Als Kassenpersonal kann ich im Kassenvorgang eine Artikelnummer per Kamera-Scan erfassen, damit ich auch ohne USB-Barcode-Scanner Artikel in den Warenkorb legen kann.

## Kontext
Das Artikelnummer-Eingabefeld im Kassenvorgang folgt der InputGroup-Konvention (Abschnitt 6.1): Solange das Feld leer ist, erscheint rechts ein Kamera-Button (📷) statt des Action-Buttons (↩). Ein Klick öffnet den Popup-Modus (Abschnitt 6.4) — ein Modal-Overlay mit Live-Kamerabild. Nach erfolgreichem Scan schließt das Modal automatisch und der erkannte Wert landet direkt im Eingabefeld, sodass die Artikel-Erkennung unmittelbar startet.

Der Popup-Modus gilt auch für das Artikelnummer-Feld in Wizard Schritt 2 (Feature Artikelannahme).

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
- [ ] **AC-2** — WHEN der Kamera-Button geklickt wird, THEN SHALL das System ein Modal-Overlay (`p-dialog [modal]="true"`) mit dem Live-Kamerabild öffnen.
- [ ] **AC-3** — WHEN ein Barcode oder QR-Code im Kamerabild erkannt wird, THEN SHALL das System das Modal schließen und den erkannten Wert in das Artikelnummer-Eingabefeld übernehmen, sodass der Artikel-Lookup unmittelbar ausgelöst wird.
- [ ] **AC-4** — WHEN der Schließen-Button (✕) im Kamera-Modal geklickt wird, THEN SHALL das System das Modal schließen und das Eingabefeld unverändert lassen.
- [ ] **AC-5** — IF die Kamera nicht verfügbar oder der Zugriff verweigert wird, THEN SHALL das System das Modal schließen und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.
- [ ] **AC-6** — WHILE das Kamera-Modal offen ist, SHALL das System den Fokus innerhalb des Modals halten (pFocusTrap).
- [ ] **AC-7** — WHEN das Eingabefeld mindestens ein Zeichen enthält, THEN SHALL das System den Kamera-Button durch den Action-Button (↩) ersetzen.

## Tags & Piles

**Tags:** #kamera #scanner #popup-modus #barcode #kassenvorgang #modal #inputgroup

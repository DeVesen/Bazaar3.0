---
id: C-012
status: draft
updated: 2026-07-31
---

# Component: InputGroup

**Bibliothek:** PrimeNG — `p-inputgroup` + `p-inputgroupaddon` + `pInputText`
**Verwendung:** Beide Apps — alle Eingabefelder mit Such- oder Scan-Funktion sowie Preis-Eingaben.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Slots — Aufbau
- 3. Verhalten — Interaktionsregeln
- 4. Preis-Variante — €-Addon
- 5. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Eingabefeld mit optionalem Left-Addon, Clear-Button, Lade-Spinner und kontextabhängigem Action-Button.

**Verwendungszweck:** Wird überall dort eingesetzt, wo Eingaben mit Suche, Scan oder Aktion verknüpft sind.

---

## Überblick

Die InputGroup ist das Standard-Muster für alle Such- und Scan-Eingaben in beiden Apps. Sie besteht aus bis zu fünf Slots, die je nach Kontext bestückt oder weggelassen werden. Der Clear-Button und der Spinner teilen sich dieselbe Position und sind nie gleichzeitig sichtbar.

---

## 1. ASCII-Darstellung

```
Standard-InputGroup (Such- / Scan-Feld):
[ 🔍 Left-Addon ][ Input-Feld              ][ ✕ ][ Spinner ][ ↩ / 📷 ]

Preis-Variante:
[ Preis eingeben (Kommazahl)    ][ € ]
```

---

## 2. Slots — Aufbau

| Slot | Beschreibung |
|---|---|
| **Left-Addon** | Optional (🔍 Lupe bei Suchfeldern). _Nur Haupt-App:_ kein Addon bei reinen Nummernfeldern. |
| **Input-Feld** | Debounce-Suche (800 ms Default). _Nur Haupt-App:_ konfigurierbar via `suchDebounceMs`. |
| **✕ Clear-Button** | Erscheint wenn Input nicht leer. _Nur Haupt-App:_ löscht + setzt Fokus zurück ins Eingabefeld. |
| **Spinner** | Ersetzt temporär den Clear-Button während der Suche läuft. |
| **Action-Button** | ↩ wenn Input gefüllt · 📷 wenn leer. _Nur Haupt-App:_ 📷 löst Kamera-Scan aus (QR/Barcode). |

---

## 3. Verhalten

### Clear-Button

- Sichtbar: sobald das Input-Feld einen Wert enthält.
- Aktion: Feld leeren.
- _Nur Haupt-App:_ Fokus wird nach dem Löschen zurück ins Eingabefeld gesetzt.

### Spinner

- Erscheint an der Position des Clear-Buttons, solange eine Suche (Debounce-Phase oder Netzwerkrequest) aktiv ist.
- Clear-Button und Spinner schließen sich gegenseitig aus — nie gleichzeitig sichtbar.

### Action-Button

- **↩ (Submit):** Sichtbar, wenn das Input-Feld einen Wert enthält. Löst die primäre Aktion aus (z. B. Suche starten, Artikel buchen).
- **📷 (Kamera):** Sichtbar, wenn das Input-Feld leer ist.
  - _Nur Haupt-App:_ Öffnet den Kamera-Scan (Popup-Modus oder Inline-Modus, je nach Kontext — siehe Kamera-Modi in Section 6.4 des Haupt-App-Lastenhefts).

### Debounce

- Default: 800 ms.
- _Nur Haupt-App:_ Konfigurierbar über den Einstellungsparameter `suchDebounceMs` (gespeichert im `localStorage`).

---

## 4. Preis-Variante — €-Addon

```
[ Preis eingeben (Kommazahl)    ][ € ]
```

- Das €-Zeichen erscheint als rechter Addon (kein Left-Addon, kein Clear-Button, kein Action-Button).
- _Nur Haupt-App:_ Erlaubte Eingabe: Dezimalzahl mit Komma oder Punkt.
- PrimeNG-Komponente: `p-inputnumber` (Locale DE, `minFractionDigits="2"`).

---

## 5. PrimeNG-Basis

```
p-inputgroup          ← Äußerer Wrapper (flex-Container)
├── p-inputgroupaddon ← Left-Addon (🔍) oder Right-Addon (€)
├── pInputText        ← Eingabefeld (Direktive auf <input>)
├── p-button          ← Clear-Button ([text]="true" [rounded]="true", Icon-Stil)
├── p-progressspinner ← Spinner (ersetzt Clear-Button während Suche)
└── p-button          ← Action-Button ([text]="true" [rounded]="true", Icon-Stil)
```

Preis-Variante: `p-inputnumber` anstelle von `pInputText`; nur ein Addon (rechts, €).

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Clear-Button (✕) anzeigen, sobald das Eingabefeld einen Wert enthält, und ihn ausblenden, wenn das Feld leer ist.
2. **AC-2** — WHEN eine Suche aktiv ist, THEN SHALL das System den Clear-Button durch `p-progressspinner` ersetzen; beide Elemente sind nie gleichzeitig sichtbar.
3. **AC-3** — THE SYSTEM SHALL den Action-Button als ↩ rendern, wenn das Eingabefeld einen Wert enthält, und als 📷, wenn das Feld leer ist.
4. **AC-4** — WHERE ein Left-Addon konfiguriert ist, SHALL das System das 🔍-Icon als `p-inputgroupaddon` links des Eingabefelds darstellen; ohne Konfiguration entfällt der Addon-Slot vollständig.
5. **AC-5** — WHEN der Benutzer den Clear-Button betätigt, THEN SHALL das System das Eingabefeld leeren. _(Nur Haupt-App:)_ Zusätzlich SHALL das System den Fokus zurück ins Eingabefeld setzen.
6. **AC-6** — THE SYSTEM SHALL in der Preis-Variante ein `p-inputnumber` mit `minFractionDigits="2"` und Locale DE verwenden; das €-Zeichen erscheint als rechter `p-inputgroupaddon`.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #input-group #suchfeld #debounce #clear-button #action-button #preis #scan

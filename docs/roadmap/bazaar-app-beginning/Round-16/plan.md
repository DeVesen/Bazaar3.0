---
round: Round-16
status: geplant
---

# Plan: Round 16 — Artikelannahme: Verkäufer-Suche & Scan-Infrastruktur

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-14/plan.md](../Round-14/plan.md): `sellers-api.ts` (`GET
  /api/sellers/search`, `POST /api/sellers`, `DELETE /api/sellers/{id}` real),
  `verkaeufer-dialog`-Panelstruktur (Personendaten/Kontakt/Konditionen) —
  wiederverwendbares Feld-Layout-Muster für Schritt 1 des Wizards, aber **eigene**
  Komponente hier (Wizard-Schritt braucht kein `p-dialog`-Modal, sondern Inline-
  Panels).
- [Round-15/plan.md](../Round-15/plan.md): `IArticleRepository` — wird um
  `GetMaxNumber()` ergänzt (neue Methode, keine bestehende ändern).
- [Round-7/plan.md](../Round-7/plan.md): `features/intake/intake.routes.ts` +
  Platzhalter `IntakePage`, `/intake` ist die Default-Redirect-Route
  (`redirectTo: 'intake'`).

## Implementationsplan

### Backend

#### 1. `IArticleRepository` erweitern

`GetMaxNumber(): Task<int?>` in `Domain/Ports/IArticleRepository.cs` ergänzen,
Implementierung in `ArticleRepository.cs` (Round-15): `MaxAsync(a => (int?)a.Number)`.

#### 2. `GetNextArticleNumberHandler`

`Bazaar.Application/Articles/GetNextArticleNumberHandler.cs`:
`(await repo.GetMaxNumber() ?? 0) + 1`. Endpoint `GET /api/articles/next-number`
in `Bazaar.Api/Features/Articles/ArticleEndpoints.cs` (Round-15-Datei um eine
Route ergänzt).

### Frontend — geteilte Komponenten

#### 3. `shared/components/barcode-scanner/`

```
npm install @zxing/browser @zxing/library
```

`barcode-scanner.ts`: `@Input() active`, `@Input() formats?`, `@Output()
codeDetected`. `effect()` auf `active`-Signal startet/stoppt
`BrowserMultiFormatReader.decodeFromVideoDevice(...)`, `ngOnDestroy` released
Tracks. Template: einzelnes `<video>`.

#### 4. `shared/components/input-group/`

`input-group.ts`: `@Input() modes: InputMode[]`, `@Input() variant: 'search' |
'price'`, Outputs `valueChange`/`submitted`. Internes Signal `activeMode`,
Startwert immer `'keyboard'`. Modus-Buttons nach fester Reihenfolge (Filter über
`modes`, s. spec.md Sichtbarkeitstabelle). Kamera-Slot rendert `barcode-scanner`
mit `[active]="activeMode() === 'camera'"`. Numpad-Slot rendert `app-numpad`
(bereits vorhandene Shared-Component laut `docs/components/numpad/component.md`
— falls noch nicht gebaut: hier als Abhängigkeit mit anlegen,
`shared/components/numpad/`, reine Ziffernblock-Dumb-Component nach der
Numpad-Doku, kein eigener Plan-Abschnitt nötig, da vollständig eigenständig und
kurz).

#### 5. `shared/components/autocomplete-create/`

`autocomplete-create.ts`: `@Input() options: string[]`, `@Input() entityLabel`,
`@Output() valueChange`/`entryCreated`. `p-autocomplete` mit `[dropdown]="true"`,
Modus-Ableitung als `computed(() => options().includes(value()) ? 'select' :
'create')`. Anlegen-Modal als `p-dialog` mit einem `pInputText`.

#### 6. `shared/components/scan-feedback/`

`scan-feedback.ts`: `@Input() result: 'success' | 'already-set' | 'unknown' |
null`, `@Input() pauseMs = 3000` (Code-Konstante als Default-Wert, kein Settings-
Zugriff in diesem Round). Web-Audio-Ton über zwei `OscillatorNode`-Frequenzrampen,
`navigator.vibrate?.(...)`, SVG-Kreis mit CSS-`stroke-dashoffset`-Animation über
`pauseMs`. Reine Presentational-Komponente, kein Consumer in diesem Round —
Component-Test steuert `result`/`pauseMs` direkt.

### Frontend — Intake-Feature

#### 7. `features/intake/`

`intake.page.ts` (ersetzt Round-7-Platzhalter) — Zustand `signal<'search' |
'wizard'>('search')`. Such-Zustand: `seller-search` (bereits existierende Shared-
Component aus den Component-Docs — **hier erstmals implementiert**, da bisher nur
dokumentiert: `shared/components/seller-search/`, nutzt `input-group` aus Schritt 4
für das Suchfeld, `p-listbox` für Treffer, In-Memory-Filterung über die per
`sellers-api.ts` geladene Voll-Liste).

#### 8. `intake-wizard`

`features/intake/components/intake-wizard/` — zwei `p-tabview`-Panels.
Schritt-1-Formular: drei Panels wie ANNAHME-S02, `p-select` für Typ (Liste aus
Round-13), Konditionsfelder `[disabled]="!roleService.isAdmin()"`. „Weiter" ruft
`sellers-api.ts`s `create()`. Abbrechen-Button ruft `delete(sellerId)`, danach
zurück zum Such-Zustand. Schritt 2: einfache Platzhalter-Komponente
`features/intake/components/intake-step-two-placeholder/` mit `@Input() sellerId`
— wird in Round-17 durch die echte Artikeleingabe ersetzt (Datei bleibt bestehen,
Inhalt wird ausgetauscht).

### 9. Verifikation

- `dotnet test` — `GetNextArticleNumberHandler` (leere Tabelle → `1`, mit Daten →
  `max+1`).
- `ng test` — Component-Tests für `barcode-scanner` (MediaStream-Mock via
  `navigator.mediaDevices.getUserMedia`-Stub), `input-group` (Modus-Reihenfolge je
  `modes`-Kombination), `autocomplete-create` (Modus-Wechsel bei unbekanntem Text),
  `scan-feedback` (Ton/Vibration-Aufruf gemockt, Countdown-Timing).
- `ng serve`: `/intake` → Such-Ansicht, leere Eingabe zeigt alle Verkäufer aus
  Round-14-Daten; unbekannter Suchtext → „+ Neuen Verkäufer anlegen" → Schritt 1
  vorbefüllt; „Weiter" legt echten Verkäufer an (sichtbar auch unter `/sellers`);
  Abbrechen entfernt ihn wieder. Abgerechneten Test-Verkäufer (manuell über
  Round-14-UI erzeugt, `DELETE .../settlement` vorher nie aufgerufen — Status kann
  in diesem Round nur über direkten DB-Update simuliert werden, da Abrechnen erst
  Round-20/21 existiert) auswählen → Hinweistext statt Wizard.

## Reihenfolge

Backend 1 → 2. Geteilte Komponenten 3 → 4 (4 hängt von 3 ab, Kamera-Slot), 5 und 6
unabhängig, parallel zu 3/4 möglich. Frontend 7 nach 4 (braucht `input-group`),
8 nach 7. 9 abschließend.

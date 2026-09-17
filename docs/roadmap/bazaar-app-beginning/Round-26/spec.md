---
round: Round-26
status: geklärt
---

# Spec: Round 26 — Einstellungen: JSON-Import

## Fein-Spezifikation

### Ziel

Zweiter Bereich der Einstellungen-Seite: Import der Voranmelde-App-Exportdatei —
zweistufiger Ablauf (Vorschau ohne Schreiben, dann atomare Übernahme).

### Frontend

**`import-panel`** (`features/settings/components/import-panel/`, ergänzt die
Einstellungen-Seite aus [Round-25](../Round-25/spec.md)): exakt nach
[import-panel.md](../../../components/import-panel.md), vier Zustände (leer →
Vorschau → läuft → fertig).

- Datei-Picker (`p-fileupload mode="basic"`) → sofort `POST /api/import/preview`
  (kein Zwischenklick), Vorschau erscheint ohne jede Schreiboperation.
- Vorschau: Anzahl Verkäufer/Artikel, neu/ersetzt/übersprungen, übersprungene
  Verkäufer namentlich mit Grund (`has_sold_articles` o.ä. + Anzahl).
- Unbekannte Verkäufer-Typen: je Name ein `p-select` auf vorhandene Typen
  (Round-13-Liste); „Import bestätigen" bleibt deaktiviert bis vollständig zugeordnet.
- Zwei Checkboxen „Marken übernehmen (N neu)"/„Kategorien übernehmen (N neu)",
  standardmäßig aktiv.
- Ungültiges Schema → Fehlermeldung statt Vorschau, Bestätigen gesperrt. Gültige,
  aber leere Datei (keine Verkäufer) → Hinweis „Die Datei enthält keine Verkäufer."
  **ohne** Fehlerdarstellung, Bestätigen dennoch gesperrt (kein `400`, kein Fehler —
  das Schema stimmt, nur inhaltlich leer).
- „Import bestätigen" → **zweiter** Upload derselben Datei plus `options`
  (`sellerTypeMapping`, `importBrands`, `importCategories`) an `POST /api/import` →
  `p-progressbar`, Bestätigen deaktiviert während der Ausführung → Erfolg: Toast „✓
  Import erfolgreich", Vorschau verschwindet.

### Backend

**Application** (`Bazaar.Application/Import/`):
- `PreviewImportHandler` (`POST /api/import/preview`) — parst und validiert die Datei
  gegen das Schema aus
  [`entities/import-format.md`](../../../requirements/bazaar-app/entities/import-format.md)
  (`400 import.invalid_format` bei Abweichung), **schreibt nichts**. Vergleicht gegen
  den Bestand: `newSellers`/`replacedSellers` (Abgleich über 1:1 übernommene
  Verkäufer-ID), `skippedSellers` (Seller mit `SoldAt`-Artikeln oder `SettledAt`
  gesetzt — Name + Grund + betroffene Anzahl), `unknownSellerTypes` (Namen aus der
  Datei ohne Entsprechung in `SellerType`, mit betroffener Verkäuferzahl),
  `newBrands`/`newCategories` (Namen aus `brands`/`categories`-Arrays, die noch nicht
  existieren).
- `RunImportHandler` (`POST /api/import`) — **eine Transaktion**:
  1. `sellerTypeMapping` gegen `unknownSellerTypes` aus einer erneuten Prüfung
     validieren — fehlt eine Zuordnung, `409 import.unmapped_seller_type`.
  2. Für jeden Seller der Datei: existiert er (per ID) und hat weder verkaufte
     Artikel noch ist er abgerechnet → **vollständig löschen** (samt aller Artikel)
     und aus der Datei **neu anlegen**; existiert er und ist verkauft/abgerechnet →
     überspringen (Zähler hoch, unverändert lassen); existiert er nicht → neu
     anlegen.
  3. `sellerType` je Seller über den Namen auflösen (direkt oder via
     `sellerTypeMapping`) → belegt `SalesCommission`/`FeePerItem` (wie
     `CreateSellerHandler`, Round-14, aber mit Import-Herkunft statt Rollen-Claim).
  4. Sind `importBrands`/`importCategories` gesetzt: Namen aus den Arrays anlegen,
     sofern noch nicht vorhanden, `Original = true` (Round-11/12-Aggregate
     wiederverwendet, keine neue Entity).
  5. Artikel jedes neu angelegten/ersetzten Sellers anlegen — **ohne**
     Status-Zeitstempel (`AcceptedAt`/`ReleasedAt`/`SoldAt`/`ReturnedAt` alle `null`,
     Status damit „Registriert"), `SoldManually = false`, ID 1:1 aus der Datei
     übernommen (Ausnahme vom sonstigen `IIdGenerator`-Muster — Import-IDs sind
     vorgegeben, nicht generiert).
  6. Manuell angelegte Artikel (ohne Import-Herkunft, d.h. nicht Teil eines gerade
     gelöschten Sellers) bleiben unberührt — sie gehören ohnehin zu keinem
     gelöschten Seller.
  7. Commit — Response `{importedSellers, importedArticles, skippedSellers,
     importedBrands, importedCategories}`.
- FluentValidation/Schema-Validierung: Pflichtfelder je `entities/import-format.md`.

**Infrastructure**: kein neues Repository — nutzt `ISellerRepository`,
`IArticleRepository`, `IBrandRepository`, `ICategoryRepository`,
`ISellerTypeRepository` (alle bereits vorhanden), Multipart-Datei-Parsing in der
Api-Schicht (Deserialisierung), Domain/Application bekommen nur das geparste DTO.

**Api** (`Bazaar.Api/Features/Import/`):
- `POST /api/import/preview`, `POST /api/import` (beide `admin`) — `multipart/form-
  data`, DTOs exakt nach
  [`api/import.md`](../../../requirements/bazaar-app/api/import.md).
- `errorCode`: `import.invalid_format` (400), `import.unmapped_seller_type` (409) —
  bereits katalogisiert.

### Akzeptanzkriterien

Epic_Einstellungen AC-2 bis AC-5, AC-9, AC-10 bis AC-14 (Import-Teil). `import-
panel.md` AC-1 bis AC-9 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `PreviewImportHandler` (Schema-Validierung, Skip-Erkennung,
  unbekannte Typen, leere Datei), `RunImportHandler` (Transaktions-Atomarität,
  Upsert/Skip/Delete-Zweige, Stammdaten-Checkbox-Verhalten, ID-Übernahme statt
  `IIdGenerator`).
- Frontend: `import-panel` — Vitest (vier Zustände, Typ-Zuordnung blockiert
  Bestätigen, leere-Datei-Sonderfall).
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Benutzerverwaltung — eigenes Häppchen, → [Round-27](../Round-27/round.md).

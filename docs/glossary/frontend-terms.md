# Frontend Terms

### Marken
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/master-data/brands/` — Feature "Marken" (Epic_Marken), Code-Ordner heißt `brands`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Kategorien
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/master-data/categories/` — Feature "Kategorien" (Epic_Kategorien), Code-Ordner heißt `categories`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Verkäufer-Typen
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/master-data/seller-types/` — Feature "Verkäufer-Typen" (Epic_Verkaeufer_Typen), Code-Ordner heißt `seller-types`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Meine Artikel
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/` — Feature "Meine Artikel" (Epic_Meine_Artikel), Code-Ordner heißt `my-articles`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Alle Artikel
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/registration/articles/` — Feature "Alle Artikel" (Epic_Alle_Artikel), Code-Ordner heißt `articles`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Nummernblöcke
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/registration/number-blocks/` — Feature "Nummernblöcke" (Epic_Nummernbloecke), Code-Ordner heißt `number-blocks`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Verkäufer
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/sellers/` — Feature "Verkäufer" (Epic_Verkaeufer), Code-Ordner heißt `sellers`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Profil
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/profile/` — Feature "Profil" (Epic_Profil), Code-Ordner heißt `profile`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Einstellungen
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/operations/settings/` — Feature "Einstellungen" (Epic_Einstellungen), Code-Ordner heißt `settings`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Countdown-Widget
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/countdown-embed/` — Feature "Countdown-Widget" (Epic_Countdown_Widget), Code-Ordner heißt `countdown-embed`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Registrierung
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/register/` — Self-Service-Registrierung eines neuen Verkäufers (Teil von Epic_Login, Sektion 6), Code-Ordner heißt `register`
- **Confidence:** inferred
- **First seen:** 2026-09-15

### Full-Width
- **Maps to:** PrimeNG `<p-fluid>`-Wrapper-Konvention — Eingabefelder/Selects/InputNumber/Buttons füllen ihre zugewiesene Spaltenbreite (1/2, 2/3, 100%) statt intrinsischer Breite. Umgesetzt via `<p-fluid>` um die betroffenen Form-Controls (nicht global per CSS, da sonst auch Icon-/Toolbar-Buttons betroffen wären). Beispiele: `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/profile/pages/ProfilePage.html`, `sellers/components/seller-edit-dialog.html`, `operations/settings/pages/SettingsPage.html`, `login/components/login-form.ts`, `shared/filter-panel/filter-panel.ts`.
- **Confidence:** confirmed
- **First seen:** 2026-09-15

### Seitentitel
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/core/shell/page-layout/` — zentrale Titel-Leiste über jeder eingeloggten Route (`<h1 class="page-title">`, aus `route.data['title']`); ersetzt die früher pro Feature-Seite gepflegte eigene `<h1>`. In den Epics durchgängig als „(Seitentitel)" referenziert, wenn ein Button/Element dort statt in der Feature-Toolbar sitzt.
- **Confidence:** confirmed
- **First seen:** 2026-09-15

### Verkäufer-Kachel
- **Maps to:** `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.ts` — einzelnes Element der Kachelliste auf der Verkäufer-Seite der Haupt-App (Komponente `SellerCard`, Selector `app-seller-card`), gerendert in `sellers-page.html`. Code-Name `seller-card` bleibt. Nicht verwenden: „Verkäufer-Karte“, „Karte“.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-12

### Kachelliste
- **Maps to:** `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html` — Block `.sellers-page__list` mit Kachel-Grid und Nachlade-Sentinel; der Listenbereich der Verkäufer-Seite (Haupt-App), der ab 769px in einem eigenen Bereich scrollt.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-12

### Aktionsleiste
- **Maps to:** `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.html` — gerahmte Leiste (`p-toolbar.settlement-page__actionbar`) auf einer Seite mit einem Gegenstand und Aktionen: Zurück links als reines „<"-Icon, Name des Gegenstands mittig (mit Adresse bzw. Zusatzzeile darunter), Aktionen rechts. Erste Ausprägung: Abrechnungsseite der Haupt-App im Zustand „Verkäufer abrechnen"; Vorbild für weitere Seiten dieser Art. Nicht verwenden: „Filterleiste" — dieser Begriff bleibt den Listenseiten (Suche, Sortierung, Status) vorbehalten.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-12

### Verkaufs-Page
- **Maps to:** `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/` — Verkauf-Seite der Haupt-App (Komponente `CheckoutPage`, Selector `app-checkout-page`, Überschrift „Verkauf"); Code-Ordner heißt `checkout`.
- **Aliases:** Verkauf-Seite
- **Confidence:** inferred
- **First seen:** 2026-10-13

### Artikel freigeben
- **Maps to:** `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/` — Dialog `ReleaseDialog` an der Verkäufer-Kachel der Haupt-App, hostet `app-scan-dialog` mit `targetField="releasedAt"` (Titel „Artikel freigeben"); Code-Name ist `release`.
- **Confidence:** inferred
- **First seen:** 2026-10-13

### Zurückgeben
- **Maps to:** `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.html` — `app-scan-dialog` mit `targetField="returnedAt"` und `writeMode="immediate"` (Titel „Artikel zurückgeben") auf der Abrechnungsseite der Haupt-App; Code-Name ist `return`.
- **Aliases:** Artikel zurückgeben
- **Confidence:** inferred
- **First seen:** 2026-10-13

### Abgabe-Beleg
- **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts` — Druckdokument der Haupt-App über abgegebene Artikel (Komponente `PrintDocument`, Modell-Builder `buildAbgabeBelegModel`), gedruckt über `PrintService.printIntakeReceipt` bei „Speichern" in der Artikelannahme und bei der Freigabe sowie über `PrintService.printSellerReceipt` beim Druckbutton der Verkäufer-Kachel. Nicht verwenden: „Druckvorlage".
- **Confidence:** user-confirmed
- **First seen:** 2026-10-14

### Verkäufer-Übersicht
- **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts` — Druckdokument der Abrechnung in der Haupt-App (dieselbe Komponente `PrintDocument` wie der Abgabe-Beleg, Modell-Builder `buildVerkaeuferUebersichtModel`, mehr Kennzahl-Kacheln, „Verdienst" statt „Auszahlung"), gedruckt über `PrintService.printSellerSummary`.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-14

### Artikel-Aushang
- **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/article-aushang.ts` — Druckdokument der Artikel-Seite in der Haupt-App: alle Artikel des Filterergebnisses, nach Kategorie gruppiert (Komponente `ArticleAushang`, Modell-Builder `buildArticleAushangModel`), gedruckt über `PrintService.printArticleAushang`; Spalten Bezeichnung, Marke, Farbe, Größe, Preis. Daten über `GET /api/articles/print`. Eine Liste zum Veröffentlichen, kein Beleg über Geld. Nicht verwenden: „Artikelliste" (so heißt die Tabelle auf der Seite bzw. die Liste eines Verkäufers).
- **Confidence:** user-confirmed
- **First seen:** 2026-10-31

### Druck „Meine Artikel"
- **Maps to:** `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/components/my-articles-print.ts` — Druckdokument der Seite „Meine Artikel" in der Voranmelde-App: die Liste 1:1 (Spalten Nr., Bezeichnung, Kategorie, Marke, Preis; Filter und Sortierung der Tabelle, alle Seiten), Komponente `MyArticlesPrint`, gedruckt über `PrintService.print` (`core/print/print.service.ts`, iOS-Handling aus der Haupt-App). Kein Aushang (nicht gruppiert, keine Freitexte).
- **Confidence:** inferred
- **First seen:** 2026-11-03

### Kennzahl-Kachel
- **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.html` — Infoblock auf dem Beleg (Titel links oben, darunter größerer, dickerer Wert, linksbündig), Klassen `.print-doc__tile`, Zeilen `.print-doc__tiles--a|--b`. „Kachel" allein bleibt die Verkäufer-Kachel.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-14

### Freitext (Beleg)
- **Maps to:** `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts` — Markdown-Texte je Vorlage: fünf für Abgabe-Beleg und Verkäufer-Übersicht (1 Kopfzeile links, 2 Kopfzeile Mitte, 3 über der Artikelliste, 4 Fußzeile links, 5 Fußzeile Mitte), vier für den Artikel-Aushang (1 Kopfzeile links, 2 Kopfzeile Mitte, 3 Fußzeile links, 4 Fußzeile Mitte), zusammen vierzehn Felder; Backend `Settings.AbgabeBeleg`/`Settings.VerkaeuferUebersicht` (`PrintTexts`) und `Settings.ArticleAushang` (`AushangTexts`), Endpoints `GET/PUT /api/settings/print-texts`.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-14

### Etiketten-Vordruck (Haupt-App)
- **Maps to:** `src/bazaar-app/frontend/src/app/features/blank-labels/` — Seite „Etiketten-Vordruck" (Route `/blank-labels`, nur Admin) mit den Bereichen Bogenformat, Etiketten-Inhalt und Angebrochener Bogen; Etikett und Etikettenbogen als Komponenten in `shared/components/label-sheet/`, Backend `Features/BlankLabels`.
- **Confidence:** user-confirmed
- **First seen:** 2026-11-02

### Druckversatz / Offset (Haupt-App)
- **Maps to:** `src/bazaar-app/frontend/src/app/features/blank-labels/` — Felder „Offset X (mm)“ und „Offset Y (mm)“ im Bogenformat (`offsetX`/`offsetY`, −20 bis +20 mm); verschieben nur den Druck (Plus: rechts/unten, Minus: links/oben), nicht die Vorschau; Komponente `LabelSheet` Input `applyOffset`.
- **Confidence:** user-confirmed
- **First seen:** 2026-11-05

### Bilder-Bibliothek (Haupt-App)
- **Maps to:** `LabelImage` (`src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelImage.cs`) — eigenes Bild (PNG, JPEG oder SVG, höchstens 1 MB, Name 1 bis 50 Zeichen) in der gemeinsamen Bibliothek für Logo und Verkäufer-Symbol des Etiketten-Vordrucks, höchstens 50 Bilder, inhaltsgleiche Bilder (SHA-256) nur einmal; Tabelle `LabelImages`, Endpoints `GET/POST /api/label-images`, `GET/DELETE /api/label-images/{id}` (`Bazaar.Api/Features/BlankLabels/LabelImageEndpoints.cs`); `GraphicPicker` (`src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.html`) — Abschnitt „Bibliothek“ mit Vorschaubildern, Löschen und „n von 50 Bildern“. Die Bibliothek ist Kopierquelle: Wählen kopiert die Data-URL in das Etikett, `LabelPrintDefaults` verweist nicht auf die `id`.
- **Aliases:** Bildbibliothek, Label-Image-Library
- **Confidence:** user-confirmed
- **First seen:** 2026-11-05

### Artikel-Nummer (Etikett, Haupt-App)
- **Maps to:** `numberText` in `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts` und `label-card.ts` — die Nummer im Klartext unter dem QR-Code, horizontal mittig zwischen Verkäufer-Symbol unten links und Falzlinie; Schriftgröße = Feld „Höhe Artikel-Nummer (mm)“ (`numberHeight`).
- **Aliases:** Klartext, Artikelnummer im Klartext
- **Confidence:** user-confirmed
- **First seen:** 2026-11-05

### Preiszeile (Etikett, Haupt-App)
- **Maps to:** `priceRow` in `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts`, Markup `.label-card__price-row` in `label-card.html` — Flex-Zeile aus Schreiblinie und rechtsbündigem Währungssymbol; die Schreiblinie schrumpft auf den Platz links vom Symbol; Höhe = Schriftgröße = Feld „Höhe Währungssymbol (mm)“ (`currencyHeight`).
- **Aliases:** Preisfeld
- **Confidence:** inferred
- **First seen:** 2026-11-05

### Elementgrößen (Etiketten-Vordruck, Haupt-App)
- **Maps to:** `LabelElementSizes` (`src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts`) — Felder „Größe QR-Code (mm)“, „Größe Verkäufer-Symbol (mm)“, „Höhe Artikel-Nummer (mm)“, „Höhe Währungssymbol (mm)“ im Bereich Etiketten-Inhalt; absolut in mm, 0,1 bis 100; gemerkt in `LabelPrintDefaults` (`qrCodeSize`, `sellerSymbolSize`, `numberHeight`, `currencyHeight`). Das Logo hat keine Größe, es füllt die freie Fläche.
- **Confidence:** user-confirmed
- **First seen:** 2026-11-05

### Einstellungs-Tabs (Haupt-App)
- **Maps to:** `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-tabs.ts` — vier Tabs der Einstellungsseite: „Basis-Einstellungen" (`general`, Scan-Pause, Freigabe-Schalter, Standard-Verkäufer-Typ), „User" (`users`, Benutzerverwaltung), „Beleg Druck" (`print`, Freitexte der Belege), „Sonstiges" (`misc`, JSON-Import und nur im Development-Modus „Datenbank zurücksetzen"); aktiver Tab im Query-Parameter `tab`.
- **Confidence:** user-confirmed
- **First seen:** 2026-10-18

### Filterleiste
- **Maps to:** `p-toolbar` oberhalb der Liste auf den Listenseiten der Haupt-App, z. B. `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.html` (`.articles-page__filterbar`: Suche, Marke, Kategorie, Status) und `sellers-page.html` (`.sellers-page__toolbar`: +-Button, Suche, Sortierung, Status); entsprechend auf den Seiten Marken, Kategorien und Verkäufer-Typen (+-Button, Suche, Original-Filter). Gegenstück für Seiten mit einem einzelnen Gegenstand ist die „Aktionsleiste“.
- **Confidence:** inferred
- **First seen:** 2026-10-12

### Auswahlliste
- **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.html` (`p-listbox`, gespeist aus `pendingList` in `scan-dialog.ts`) — Liste der noch nicht erfassten Artikel des Verkäufers im Scan-Dialog bei „Artikel freigeben“ und „Zurückgeben“; ein Antippen erfasst den Artikel. Nicht verwenden: „Artikelliste“ (im Druck belegt), „Liste offener Artikel“ („offen“ ist Status-Begriff der Abrechnung).
- **Confidence:** user-confirmed
- **First seen:** 2026-10-18

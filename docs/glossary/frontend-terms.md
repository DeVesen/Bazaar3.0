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

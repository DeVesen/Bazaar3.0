# Home Verkäufer

**Intent:** Verkäufer-Startseite nach dem Login — eigener Fortschritt auf einen Blick (wie viele Artikel angemeldet, welche Kosten das erzeugt) plus die relevanten Basar-Termine.
**Coverage:** partial
**Last reviewed:** 2026-09-15

## Capabilities
- Seller sees own article count — `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.ts` (`sellerHome` via `HomeApiService.getSellerHome()`)
- Seller sees own commission rate and item fee (from seller type conditions) — `HomePage.ts`
- Seller sees computed total fee (article count × item fee) — `HomePage.ts` (`totalFee`)
- Seller sees countdown to drop-off window (only, not full admin phase set) — `HomePage.ts` (`dropOffPhases`)
- Seller sees own seller number — `HomePage.ts` (`SellerNumber` component)
- Seller sees the public info text if configured — `HomePage.ts` (`showInfoPanel`)

## Spans
- **Frontend:** `home/pages/HomePage.ts` + `.html` (rollenbasiert verzweigt, gemeinsam mit Home Admin), `home/home-api.service.ts`
- **Backend:** `BAR.Host.Features.Home.HomeCompositionService` — ruft `ISellerManagementModuleApi.GetSellerConditionsAsync`, `IRegistrationModuleApi.CountArticlesForSellerAsync`, `IOperationsModuleApi.GetBazaarScheduleAsync`

## Notes
- Teilt sich `HomePage.ts` mit `home-admin` — siehe dortige Notes.
- Coverage `partial`: `HomePage.html` nicht im Detail gelesen.

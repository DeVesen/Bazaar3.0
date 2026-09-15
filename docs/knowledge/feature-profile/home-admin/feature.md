# Home Admin

**Intent:** Admin-Startseite nach dem Login — Überblick über den aktuellen Basar-Stand (wie viele Verkäufer, Artikel, Kategorien, Marken) und die zeitliche Aktivität, ohne erst in Einzelbereiche wechseln zu müssen.
**Coverage:** partial
**Last reviewed:** 2026-09-15

## Capabilities
- Admin sees seller count, article count, category count, brand count — `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.ts` (`adminHome` via `HomeApiService.getAdminHome()`)
- Admin sees an activity heatmap (article created/updated dates) — `HomePage.ts` (`ActivityHeatmap` component)
- Admin sees countdown to registration deadline, drop-off window, bazaar window (all phases) — `HomePage.ts` (`adminPhases`)
- Admin sees the public info text if configured — `HomePage.ts` (`showInfoPanel`)

## Spans
- **Frontend:** `home/pages/HomePage.ts` + `.html` (rollenbasiert verzweigt, gemeinsam mit Home Verkäufer), `home/home-api.service.ts`
- **Backend:** `BAR.Host.Features.Home.HomeCompositionService` (Host-seitige Komposition) — ruft `IOperationsModuleApi.GetBazaarScheduleAsync`, `IRegistrationModuleApi.GetDashboardStatsAsync`, `ISellerManagementModuleApi.GetSellerCountAsync` u.a.

## Notes
- **Teilt sich eine Komponente (`HomePage.ts`) mit `home-verkaeufer`** — Rollenumschaltung über `RoleService.activeRole()`. Als zwei Feature-Profile erfasst, weil es zwei separate Epics sind (`Epic_Home_Admin`, `Epic_Home_Verkaeufer`), auch wenn der Code sie nicht trennt.
- Coverage `partial`: nur `HomePage.ts` gelesen, nicht `HomePage.html` im Detail (Template kann weitere sichtbare Zustände enthalten, z.B. Ladezustände/Leerzustände).

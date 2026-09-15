# Countdown-Widget

**Intent:** Öffentlich einbettbarer Countdown zu den Basar-Terminen, für Kanäle außerhalb der App selbst (z.B. Website-Einbettung), ohne Login.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Anyone (unauthenticated) can view a timeline countdown of the 5 bazaar dates at the public route `/embed/countdown` — `src/advance-registration/frontend/BAR.App/src/app/features/countdown-embed/pages/CountdownEmbedPage.ts`
- User sees only the dates that are actually set; unset (null) dates are filtered out — `CountdownEmbedPage.ts`

## Spans
- **Frontend:** `countdown-embed/pages/CountdownEmbedPage.ts`, shared `@shared/countdown`
- **Backend:** `BAR.Modules.Operations.Contracts.IOperationsModuleApi.GetPublicInfoAsync` via `GET /api/public/info` (anonym)

## Notes
- Läuft außerhalb des `AppShell` (kein Login, keine Navigation) — Code-Kommentar zitiert "Epic_Countdown_Widget section 1", AC-6/AC-7 für das Filtern unmaintainter Termine.

# Nummernblöcke

**Intent:** Verkäufer sieht die ihm zugeteilten Nummernbereiche, aus denen seine Artikelnummern vergeben werden.
**Coverage:** partial
**Last reviewed:** 2026-09-15

## Capabilities
- Seller can view own assigned number blocks — `src/advance-registration/frontend/BAR.App/src/app/features/registration/number-blocks/pages/NumberBlocksPage.ts`
- User sees a load-error state distinctly — `NumberBlocksPage.ts`

## Spans
- **Frontend:** `registration/number-blocks/pages/NumberBlocksPage.ts`, `registration/number-blocks/blocks-api.service.ts`, shared `@shared/block-liste`
- **Backend:** `BAR.Modules.Registration.Contracts.IRegistrationModuleApi.GetMyBlocksAsync`; Zuteilung selbst läuft über `ReserveBlocksAsync`/`AllocateInitialBlocksAsync`, aber kein Frontend-Screen dafür gefunden

## Notes
- Coverage `partial`: keine sichtbare Admin-seitige Reservierungs-/Zuteilungs-UI im Frontend gefunden, obwohl das Backend (`ReserveBlocksCommandHandler`, `GetBlocksForSellerQueryHandler`, `GetNextFreeQueryHandler`) diese Fälle abdeckt. Entweder ist diese UI noch nicht gebaut, oder sie existiert an anderer Stelle, die nicht gefunden wurde — als Lücke markiert statt geraten.

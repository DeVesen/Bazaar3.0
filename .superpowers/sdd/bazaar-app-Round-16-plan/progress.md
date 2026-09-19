
## Progress

Task 1: complete (commits 64cae87..6ba1ee1, review clean)
Task 2: complete (commits 6ba1ee1..456aa73, review clean)
Task 3: complete (commits 456aa73..332d741, review clean)

## Ruling — spec.md gap discovered while preparing Task 7

spec.md claims `GET /api/sellers/search` is "bereits aus Round-14 real vorhanden,
keine Änderung nötig". Verified against `SellerSearchResult`
(`Bazaar.Domain/Ports/ISellerSearchQuery.cs`) and `SellerSearchResultDto`
(`Bazaar.Api/Features/Sellers/Dtos.cs`): neither carries `settledAt`/status.
Epic_Artikelannahme AC-12 (in scope for Round-16 per spec.md's own AC list)
requires the search result list to show a badge "Abgerechnet" and block wizard
opening for settled sellers — impossible without that field reaching the
frontend.

Ruling: extend `SellerSearchResult`/`SellerSearchResultDto`/frontend
`SellerSearchResult` with an additive `settledAt: DateTimeOffset? / string | null`
field (sourced from the existing `Seller.SettledAt` property, already used
elsewhere e.g. `GetArticleByIdHandler`) — a minimal, backward-compatible
addition (existing consumers of `/api/sellers/search`, if any beyond this
feature, ignore an extra field). Folded into Task 7's dispatch as a small
required backend step before the frontend seller-search component, rather
than spinning up a separate task — same additive-only shape as Task 1, low
risk. Cost if wrong: a five-line revert across 3 files; no data migration, no
behavior change to any existing caller.
Task 4: fix round 1/5 (2 addressed, 0 open; commits fab76b4..a8686e6)
Task 4: complete (commits 332d741..a8686e6, review clean after 1 fix round)
Task 5: minor (deferred): Escape/Tab keyboard nav in autocomplete-create modal untested, relies on PrimeNG p-dialog defaults — autocomplete-create.spec.ts
Task 5: minor (deferred): cosmetic seam between input and +-button in create-mode (no functional impact) — autocomplete-create.scss
Task 5: complete (commits a8686e6..71308d5, review clean)
Task 6: minor (deferred): AudioContext-absent test doesn't assert visual countdown still runs — scan-feedback.spec.ts
Task 6: minor (deferred): rapid repeated scans could briefly open multiple AudioContext instances before self-close — scan-feedback.ts:334
Task 6: complete (commits 71308d5..42c56cb, review clean)
Task 7: fix round 1/5 (3 addressed, 1 new Important found in fix diff — searchChanged double-emit on scan; commits 5377a9d..fd8f27e)
Task 7: fix round 2/5 (1 addressed, 0 open; commits fd8f27e..6971bde)
Task 7: complete (commits 42c56cb..6971bde, review clean after 2 fix rounds)
Task 8: fix round pending — Critical: Step-1 tab stays clickable after seller created, allowing duplicate create() calls / orphaned seller record (commits 6971bde..13505b0)
Task 8: fix round 1/5 (1 addressed, 0 open; commits 13505b0..9a10f2c)
Task 8: complete (commits 6971bde..9a10f2c, review clean after 1 fix round)
Task 8: minor (deferred): no visual browser check of tab-shell styling (relies on ::ng-deep against PrimeNG 22 class names) — intake-wizard.scss
Task 8: minor (deferred): failed remove() in Cancel path silently emits closed with no log — intake-wizard.ts onCancel

## All 8 tasks complete — proceeding to final whole-branch review

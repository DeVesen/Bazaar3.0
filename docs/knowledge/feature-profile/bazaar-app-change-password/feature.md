# Passwort ändern (Bazaar-App)

**Intent:** Erzwingt einen Passwortwechsel für Konten, die ein Admin mit `mustChangePassword` angelegt/zurückgesetzt hat, und erlaubt jedem eingeloggten Nutzer, sein Passwort freiwillig zu ändern.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User is forced to `/change-password` on every route when `mustChangePassword` is true, until changed — `frontend/src/app/core/auth/password-change.guard.ts` (`passwordChangeGuard`, wired on jedem geschützten Kind-Route in `app.routes.ts`)
- User enters aktuelles Passwort, neues Passwort, Bestätigung — je mit eigenem Eye-Icon-Toggle — `features/change-password/pages/change-password-page/change-password-page.html`
- User sees "Aktuelles Passwort ist falsch" specifically on 401 — `change-password-page.ts` `onSubmit()`
- User sees a field-level Passwort-Regel-Fehler from the server's 400 validation response (z. B. Mindestlänge) — `change-password-page.ts` `newPasswordError`
- User sees "Passwörter stimmen nicht überein" locally once both neue Passwort-Felder befüllt sind und nicht matchen — `change-password-page.html`
- User cannot submit until aktuelles Passwort, neues Passwort und Bestätigung alle nicht-leer sind und die beiden neuen Felder übereinstimmen — `change-password-page.ts` `canSubmit`
- User is re-authenticated with a fresh token when the backend returns one (own account changed), or just sees a success toast otherwise (admin changed someone else's) — `change-password-page.ts` `onSubmit()` next-handler
- User is redirected to `/intake` after a successful change — `change-password-page.ts`

## Spans
- **Frontend:** `features/change-password/pages/change-password-page/change-password-page.{ts,html,scss}`, `core/auth/password-change.guard.ts`
- **Backend:** `Bazaar.Api/Features/Auth/AuthEndpoints.cs` (`PUT /api/auth/password`, `RequireAuthorization()`), `Bazaar.Application/Auth/ChangePasswordHandler.cs`

## Notes
- `PUT /api/auth/password` nimmt die `UserId` nicht aus dem Body, sondern aus dem JWT-Claim (`sub`) — verhindert, dass ein Nutzer das Passwort einer fremden UserId ändert, selbst wenn er den Endpoint direkt aufruft.
- Rückgabe ist NoContent (kein eigenes Passwort-Reset durch Admin nötigen Re-Login) vs. `200` mit neuem Token (eigenes Passwort geändert) — derselbe Endpoint unterscheidet beide Fälle serverseitig.

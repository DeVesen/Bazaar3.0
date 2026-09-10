---
id: SPEC-R07
status: draft
updated: 2026-09-10
roadmap: docs/requirements/advance-registration/roadmap/R07-konto-sicherheit.md
---

# R07 — Konto-Sicherheit — Design

**Voranmelde-App**

## Kontext

R02 liefert Profil-Tab 1 (Steckbrief) samt Tabs-Grundgerüst
(`features/profile/pages/ProfilePage.ts`). R07 ergänzt Tab 2 (Zugangsdaten:
E-Mail + Passwort ändern) und Tab 3 (Account löschen). Backend-Infrastruktur
ist größtenteils vorhanden: JWT/Refresh-Token-Handling, `BCryptPasswordHasher`,
und eine Lösch-Kaskade in `DeleteSellerCommandHandler` (Admin-Löschung eines
fremden Sellers), die für die Self-Delete-Variante wiederverwendet wird.

## Entscheidungen aus dem Brainstorming

1. **Konto löschen:** reiner `p-confirmdialog` (Ja/Nein), kein erneutes
   Passwort nötig.
2. **E-Mail-Änderung:** sofort aktiv, kein Verifikations-Mail an neue Adresse
   (MVP-Scope, keine Mail-Infrastruktur nötig).
3. **Lösch-Kaskade:** in gemeinsamen Application-Service extrahiert, von
   Admin-Delete (`DeleteSellerCommandHandler`) und Self-Delete
   (`DeleteProfileCommandHandler`) gemeinsam genutzt (DRY).

## Backend

### Neue Endpoints (`ProfileEndpoints.cs`)

| Endpoint | Handler | Auth |
|---|---|---|
| `PUT /api/profile/email` | `ChangeEmailCommandHandler` | Seller/Admin (eigener Account via JWT `sub`) |
| `PUT /api/profile/password` | `ChangePasswordCommandHandler` | Seller/Admin |
| `DELETE /api/profile` | `DeleteProfileCommandHandler` | Seller/Admin |

### `ChangeEmailCommandHandler`

Input: `newEmail`, `currentPassword`.

1. Seller per JWT-`sub` laden.
2. `currentPassword` gegen `seller.PasswordHash` verifizieren
   (`IPasswordHasher.Verify`) → sonst `401 auth.invalid_credentials`.
3. `newEmail`-Format prüfen → sonst `400`.
4. Uniqueness prüfen (`ISellerRepository.GetByEmailAsync`) → sonst
   `409 seller.email_taken`.
5. `seller.Email` ändern, speichern.
6. Kein neues Token-Paar (JWT-`sub` trägt User-ID, nicht E-Mail).

### `ChangePasswordCommandHandler`

Input: `currentPassword`, `newPassword`, `newPasswordConfirmation`.

1. Seller per JWT-`sub` laden.
2. `currentPassword` verifizieren → sonst `401 auth.invalid_credentials`.
3. `newPassword` == `newPasswordConfirmation` und Stärke-Regeln prüfen
   (dieselbe Regel wie Registrierung) → sonst `400`.
4. Neuen Hash setzen (`IPasswordHasher.Hash`), speichern.
5. **Alle** RefreshTokens des Sellers löschen
   (`IRefreshTokenRepository.DeleteAllForSellerAsync`) — meldet andere Geräte
   ab.
6. Neues Token-Paar fürs aufrufende Gerät ausstellen — Muster aus
   `LoginCommandHandler.HandleAsync` (Zeilen 53–66): `ITokenIssuer` für
   Access-Token, `RefreshToken.Issue` + `AddAsync` für neuen Refresh-Token.
   Gesamtvorgang in einer Transaktion (`IUnitOfWork.ExecuteInTransactionAsync`)
   — kein Zwischenzustand mit gelöschten, aber noch keinem neuen Token.

### `DeleteProfileCommandHandler`

1. Seller per JWT-`sub` laden.
2. `seller.IsAdmin` → `403 profile.admin_self_delete`.
3. `SellerCascadeDeleter.DeleteAsync(seller, ct)` aufrufen (siehe unten).

### `SellerCascadeDeleter` (neuer, gemeinsamer Application-Service)

Extrahiert aus `DeleteSellerCommandHandler.HandleAsync` (Zeilen 25–39):

```csharp
public sealed class SellerCascadeDeleter(
    ISellerRepository sellers,
    INumberBlockRepository blocks,
    IRefreshTokenRepository refreshTokens,
    IArticleRepository articles,
    IUnitOfWork unitOfWork)
{
    public Task DeleteAsync(Seller seller, CancellationToken ct) =>
        unitOfWork.ExecuteInTransactionAsync(async innerCt =>
        {
            await articles.DeleteAllForSellerAsync(seller.Id, innerCt);
            await blocks.DeleteAllForSellerAsync(seller.Id, innerCt);
            await refreshTokens.DeleteAllForSellerAsync(seller.Id, innerCt);
            await sellers.DeleteAsync(seller, innerCt);
        }, ct);
}
```

`DeleteSellerCommandHandler` behält seine eigenen Guards (`self_delete_via_profile`,
`last_admin`), lädt den Ziel-Seller wie bisher, ruft danach
`SellerCascadeDeleter.DeleteAsync` statt die Schritte selbst auszuführen.
`DeleteProfileCommandHandler` lädt den Seller analog und ruft denselben Service.

## Frontend

### Tab 2 — „Zugangsdaten" (`ProfilePage`)

Zwei unabhängige Formulare, jedes mit eigenem Submit und eigener
`InfoArea`-Fehleranzeige (Pattern aus Commit `15826a2`):

- **E-Mail ändern:** Felder `newEmail`, `currentPassword`. Bei Erfolg:
  Toast/Bestätigung, Formular zurücksetzen.
- **Passwort ändern:** Felder `currentPassword`, `newPassword` (mit
  `password-strength-meter`), `newPasswordConfirmation`. Bei Erfolg: neues
  Token-Paar aus Response übernehmen (wie beim Login), Toast/Bestätigung.

Fehlerzuordnung: `401` → „aktuelles Passwort falsch" in `InfoArea`, `400` →
Feldvalidierung (Format/Stärke/Mismatch), `409` (nur E-Mail) → „E-Mail bereits
vergeben".

### Tab 3 — „Account löschen" (`ProfilePage`)

- Für Admin-Rolle: Tab-Inhalt durch Hinweistext ersetzt oder Tab ausgeblendet
  (AC-6) — kein Löschen möglich.
- Für Seller: Button „Account löschen" → `p-confirmdialog` (Ja/Nein, kein
  Passwortfeld) → bei Bestätigung `DELETE /api/profile` → bei Erfolg: lokale
  Tokens löschen, Redirect zu Login/Startseite.

## Testing

- **Unit (Backend):** je Handler die Guard-Fälle (falsches Passwort, Format,
  Email-Taken, Mismatch, Admin-Delete-Block) und der Erfolgsfall mit
  Mock-Repos; `SellerCascadeDeleter` isoliert getestet (Aufrufreihenfolge via
  Mock-Verifikation).
- **Integration (Backend):** `SellerCascadeDeleter` gegen echte DB —
  Transaktionsverhalten, dass bei Fehler in einem Schritt nichts committet
  wird.
- **Frontend:** Component-Tests für beide neue Formulare (Erfolg, jeweilige
  Fehlercodes) und den Delete-Confirm-Flow, gemäß Vitest-Konventionen.

## Akzeptanzkriterien (aus Roadmap, unverändert)

Siehe [R07-konto-sicherheit.md](../../requirements/advance-registration/roadmap/R07-konto-sicherheit.md)
Abschnitt „Fertig, wenn" — AC 1–6, direkt von Hand prüfbar.

## Nicht in diesem Schritt

- Passwort-vergessen/Reset per E-Mail.
- Zwei-Faktor-Authentifizierung.
- E-Mail-Verifikation bei Adressänderung.

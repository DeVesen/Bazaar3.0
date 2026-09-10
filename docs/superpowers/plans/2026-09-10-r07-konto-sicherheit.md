# R07 Konto-Sicherheit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** E-Mail ändern, Passwort ändern und Konto löschen für die Voranmelde-App (Profil Tab 2 „Zugangsdaten" und Tab 3 „Löschen"), Backend und Frontend als vollständiger Durchstich.

**Architecture:** Drei neue vertikale Slices in `BAR.Application/Profile/` (ChangeEmail, ChangePassword, DeleteProfile) nach dem Muster von `UpdateProfile`/`GetProfile`. Die Lösch-Kaskade aus `DeleteSellerCommandHandler` wird in einen gemeinsamen `ISellerCascadeDeleter` extrahiert, den `DeleteSellerCommandHandler` (Admin löscht fremden Seller) und der neue `DeleteProfileCommandHandler` (Self-Delete) beide nutzen. Frontend ergänzt `ProfilePage` um zwei bisher deaktivierte Tabs.

**Tech Stack:** .NET (Minimal API, FluentValidation, EF Core, xUnit v3 + Moq), Angular (Signals, Template-driven Forms, PrimeNG, Vitest).

**Spec:** [docs/superpowers/specs/2026-09-10-r07-konto-sicherheit-design.md](../specs/2026-09-10-r07-konto-sicherheit-design.md)

## Global Constraints

- Kein neues Token-Paar nach E-Mail-Änderung (JWT-`sub` = User-ID, nicht E-Mail).
- Passwortänderung löscht **alle** Refresh-Tokens des Sellers und gibt dem aufrufenden Gerät ein neues Token-Paar zurück.
- Konto-Löschung: reiner `p-confirmdialog` (Ja/Nein), **kein** erneutes Passwortfeld.
- E-Mail-Änderung: sofort aktiv, **kein** Verifikations-Mail (MVP-Scope).
- Passwort-Stärke-Regel wird laut Projektkonvention pro Validator **dupliziert**, nicht extrahiert (siehe Kommentar in `SetPasswordCommandValidator`) — dritte Kopie in `ChangePasswordCommandValidator` ist erwartet, keine Refactoring-Aufgabe.
- Admin-Rolle: `DELETE /api/profile` → `403 profile.admin_self_delete`; Tab 3 im Frontend für Admins ohne Löschmöglichkeit.
- Alle neuen Handler ohne Interface registriert (Projektkonvention) — Ausnahme: `SellerCascadeDeleter` bekommt aus Testbarkeitsgründen ein Interface `ISellerCascadeDeleter` (Moq kann keine `sealed class` ohne Interface mocken; siehe Task 2 für Begründung).

---

## Task 1: Domain — `Seller.ChangeEmail` / `Seller.ChangePassword`

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs`

**Interfaces:**
- Produces: `Seller.ChangeEmail(string newEmail)`, `Seller.ChangePassword(string newPasswordHash)` — beide werfen `ArgumentException` bei leerem Input, sonst setzen sie `Email`/`PasswordHash` direkt (private Setter, wie `UpdateProfile`).

- [ ] **Step 1: Failing Tests schreiben**

Ergänze in `SellerTests.cs` (nach `UpdateProfile_MissingRequiredField_Throws`):

```csharp
[Fact]
public void ChangeEmail_ValidEmail_UpdatesEmail()
{
    var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
        "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

    seller.ChangeEmail("anna.neu@example.com");

    Assert.Equal("anna.neu@example.com", seller.Email);
}

[Fact]
public void ChangeEmail_EmptyEmail_Throws()
{
    var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
        "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

    Assert.Throws<ArgumentException>(() => seller.ChangeEmail(""));
}

[Fact]
public void ChangePassword_ValidHash_UpdatesPasswordHash()
{
    var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
        "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

    seller.ChangePassword("neuer-hash");

    Assert.Equal("neuer-hash", seller.PasswordHash);
}

[Fact]
public void ChangePassword_EmptyHash_Throws()
{
    var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
        "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

    Assert.Throws<ArgumentException>(() => seller.ChangePassword(""));
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTests`
Expected: FAIL — `ChangeEmail`/`ChangePassword` existieren nicht (Compile-Fehler).

- [ ] **Step 3: Methoden in `Seller.cs` ergänzen**

Nach `ConsumePassword` (Zeile 117) einfügen:

```csharp
public void ChangeEmail(string newEmail)
{
    if (string.IsNullOrWhiteSpace(newEmail)) throw new ArgumentException("newEmail ist Pflicht.", nameof(newEmail));
    Email = newEmail;
}

public void ChangePassword(string newPasswordHash)
{
    if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("newPasswordHash ist Pflicht.", nameof(newPasswordHash));
    PasswordHash = newPasswordHash;
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter SellerTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Sellers/Seller.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Sellers/SellerTests.cs
git commit -m "feat(bar-backend): add Seller.ChangeEmail and Seller.ChangePassword"
```

---

## Task 2: `ISellerCascadeDeleter` extrahieren, `DeleteSellerCommandHandler` umstellen

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Sellers/SellerCascadeDeleter.cs`
- Modify: `src/advance-registration/backend/BAR.Application/Sellers/Delete/DeleteSellerCommandHandler.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Sellers/Delete/DeleteSellerCommandHandlerTests.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`

**Interfaces:**
- Produces: `ISellerCascadeDeleter.DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken ct)` — lädt den Seller, führt `guard` aus (wirft dort ggf. `ConflictException`/`ForbiddenException`), löscht dann Artikel → Nummernblöcke → RefreshTokens → Seller, alles in einer Transaktion. `guard` bekommt den geladenen Seller, damit Prüfungen wie „letzter Admin" weiterhin **innerhalb** derselben Transaktion laufen wie im Original (kein TOCTOU-Fenster durch die Extraktion).
- Consumes (Task 5): `DeleteProfileCommandHandler` nutzt dieselbe Schnittstelle.

Begründung fürs Interface (Abweichung von der reinen No-Interface-Konvention): `SellerCascadeDeleter` wird von zwei Handlern injiziert und muss in deren Unit-Tests mockbar sein; Moq kann eine `sealed class` ohne Interface nicht als Mock erzeugen. Ein Interface ist hier die kleinste Lösung, keine Mehrarbeit für zukünftige Konsumenten.

- [ ] **Step 1: Failing Test schreiben (neue Handler-Signatur)**

Ersetze `DeleteSellerCommandHandlerTests.cs` komplett:

```csharp
using BAR.Application.Sellers;
using BAR.Application.Sellers.Delete;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Delete;

public class DeleteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerCascadeDeleter> _cascadeDeleter = new();

    private DeleteSellerCommandHandler CreateHandler() =>
        new(_sellers.Object, _cascadeDeleter.Object);

    private static Seller AdminSeller(string email = "admin@bazaar.local") =>
        Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", email, "t1", true);

    [Fact]
    public async Task HandleAsync_OtherAdminDeletesNonSelfSeller_CallsCascadeDeleterWithTargetId()
    {
        var target = Seller.CreateByAdmin("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        var requester = AdminSeller();
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        var handler = CreateHandler();

        await handler.HandleAsync(new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken);

        _cascadeDeleter.Verify(c => c.DeleteAsync(
            target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_SelfDelete_ThrowsConflict()
    {
        var requester = AdminSeller();
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(requester.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.self_delete_via_profile", ex.ErrorCode);
        _cascadeDeleter.Verify(c => c.DeleteAsync(
            It.IsAny<string>(), It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_LastAdminGuard_ThrowsConflict()
    {
        var target = AdminSeller("last@bazaar.local");
        var requester = AdminSeller("other-admin@bazaar.local");
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(target, ct));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.last_admin", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter DeleteSellerCommandHandlerTests`
Expected: FAIL — `ISellerCascadeDeleter` existiert nicht, `DeleteSellerCommandHandler`-Konstruktor passt nicht.

- [ ] **Step 3: `SellerCascadeDeleter` implementieren**

Neue Datei `BAR.Application/Sellers/SellerCascadeDeleter.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Sellers;

public interface ISellerCascadeDeleter
{
    Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken);
}

public sealed class SellerCascadeDeleter(
    ISellerRepository sellers,
    INumberBlockRepository blocks,
    IRefreshTokenRepository refreshTokens,
    IArticleRepository articles,
    IUnitOfWork unitOfWork) : ISellerCascadeDeleter
{
    // guard laeuft bewusst INNERHALB der Transaktion (nicht vorher): Prüfungen wie
    // "letzter Admin" muessen denselben Datenbankstand sehen wie die anschliessende
    // Loeschung, sonst koennten zwei gleichzeitige Loeschversuche beide die Pruefung
    // bestehen (TOCTOU).
    public Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken) =>
        unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(sellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

            await guard(seller, ct);

            await articles.DeleteAllForSellerAsync(seller.Id, ct);
            await blocks.DeleteAllForSellerAsync(seller.Id, ct);
            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);
            await sellers.DeleteAsync(seller, ct);
        }, cancellationToken);
}
```

- [ ] **Step 4: `DeleteSellerCommandHandler` umstellen**

Ersetze `DeleteSellerCommandHandler.cs` komplett:

```csharp
using BAR.Application.Sellers;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Delete;

public sealed class DeleteSellerCommandHandler(ISellerRepository sellers, ISellerCascadeDeleter cascadeDeleter)
{
    public Task HandleAsync(DeleteSellerCommand command, CancellationToken cancellationToken)
    {
        if (command.SellerId == command.RequestingSellerId)
        {
            throw new ConflictException("seller.self_delete_via_profile", "Zum Löschen des eigenen Accounts das Profil verwenden");
        }

        return cascadeDeleter.DeleteAsync(command.SellerId, async (seller, ct) =>
        {
            if (seller.IsAdmin && await sellers.CountAdminsAsync(ct) <= 1)
            {
                throw new ConflictException("seller.last_admin", "Der letzte Admin kann nicht gelöscht werden");
            }
        }, cancellationToken);
    }
}
```

- [ ] **Step 5: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter DeleteSellerCommandHandlerTests`
Expected: PASS

- [ ] **Step 5a: Eigenen Unit-Test für `SellerCascadeDeleter` schreiben (bisher nur über den Mock in Step 1 abgedeckt, nicht die echte Implementierung)**

Neue Datei `src/advance-registration/backend/tests/BAR.Application.UnitTests/Sellers/SellerCascadeDeleterTests.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Sellers;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers;

public class SellerCascadeDeleterTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private SellerCascadeDeleter CreateDeleter() =>
        new(_sellers.Object, _blocks.Object, _refreshTokens.Object, _articles.Object, _unitOfWork.Object);

    private void SetUpTransaction() =>
        _unitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

    [Fact]
    public async Task DeleteAsync_GuardPasses_CascadesArticlesBlocksTokensThenSeller()
    {
        SetUpTransaction();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var deleter = CreateDeleter();

        await deleter.DeleteAsync(seller.Id, (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken);

        _articles.Verify(a => a.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_GuardThrows_DoesNotCascade()
    {
        SetUpTransaction();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var deleter = CreateDeleter();

        await Assert.ThrowsAsync<ConflictException>(() => deleter.DeleteAsync(
            seller.Id, (_, _) => throw new ConflictException("test.guard", "Guard-Fehler"), TestContext.Current.CancellationToken));

        _articles.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_UnknownSellerId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        SetUpTransaction();
        var deleter = CreateDeleter();

        var ex = await Assert.ThrowsAsync<NotFoundException>(() => deleter.DeleteAsync(
            "unknown", (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken));

        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
```

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter SellerCascadeDeleterTests`
Expected: PASS (Implementierung existiert bereits seit Step 3)

- [ ] **Step 6: DI-Registrierung anpassen**

In `BAR.Infrastructure/DependencyInjection.cs`, Zeile 126 (`services.AddScoped<BAR.Application.Sellers.Delete.DeleteSellerCommandHandler>();`) direkt davor ergänzen:

```csharp
services.AddScoped<BAR.Application.Sellers.ISellerCascadeDeleter, BAR.Application.Sellers.SellerCascadeDeleter>();
```

- [ ] **Step 7: Backend komplett bauen und alle Tests laufen lassen**

Run: `dotnet build src/advance-registration/backend/BAR.sln && dotnet test src/advance-registration/backend/BAR.sln`
Expected: PASS (inkl. `BAR.Host.IntegrationTests` — Admin-Delete-Flow unverändert im Verhalten)

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Sellers/SellerCascadeDeleter.cs src/advance-registration/backend/BAR.Application/Sellers/Delete/DeleteSellerCommandHandler.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Sellers/Delete/DeleteSellerCommandHandlerTests.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Sellers/SellerCascadeDeleterTests.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "refactor(bar-backend): extract ISellerCascadeDeleter from DeleteSellerCommandHandler"
```

---

## Task 3: `PUT /api/profile/email` — E-Mail ändern

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangeEmail/ChangeEmailCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangeEmail/ChangeEmailCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangeEmail/ChangeEmailCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/ChangeEmail/ChangeEmailCommandHandlerTests.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`

**Interfaces:**
- Produces: `ChangeEmailCommand(string NewEmail, string CurrentPassword)`, `ChangeEmailCommandHandler.HandleAsync(string sellerId, ChangeEmailCommand command, CancellationToken ct) : Task` (kein Rückgabewert — Endpoint antwortet `204 NoContent`).
- Consumes: `Seller.ChangeEmail` (Task 1), `ISellerRepository.GetByIdAsync`/`GetByEmailAsync`/`UpdateAsync`, `IPasswordHasher.Verify`.

- [ ] **Step 1: Failing Tests schreiben**

`ChangeEmailCommandHandlerTests.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Profile.ChangeEmail;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Profile.ChangeEmail;

public class ChangeEmailCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();

    private ChangeEmailCommandHandler CreateHandler() => new(_sellers.Object, _passwordHasher.Object);

    private static Seller ExistingSeller() =>
        Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed-old");

    [Fact]
    public async Task HandleAsync_CorrectPasswordAndFreeEmail_UpdatesEmail()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna.neu@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, new ChangeEmailCommand("anna.neu@example.com", "geheim123!"), TestContext.Current.CancellationToken);

        Assert.Equal("anna.neu@example.com", seller.Email);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WrongPassword_ThrowsUnauthorized()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("falsch", "hashed-old")).Returns(false);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => handler.HandleAsync(
            seller.Id, new ChangeEmailCommand("anna.neu@example.com", "falsch"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_credentials", ex.ErrorCode);
        _sellers.Verify(s => s.UpdateAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyTakenByOtherSeller_ThrowsConflict()
    {
        var seller = ExistingSeller();
        var other = Seller.Register("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", "hashed-ben");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("ben@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(other);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.HandleAsync(
            seller.Id, new ChangeEmailCommand("ben@example.com", "geheim123!"), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_UnchangedOwnEmail_DoesNotThrowConflict()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync(seller.Email, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, new ChangeEmailCommand(seller.Email, "geheim123!"), TestContext.Current.CancellationToken);

        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ChangeEmailCommandHandlerTests`
Expected: FAIL — Namespace/Klassen existieren nicht.

- [ ] **Step 3: Command, Validator, Handler implementieren**

`ChangeEmailCommand.cs`:

```csharp
namespace BAR.Application.Profile.ChangeEmail;

public sealed record ChangeEmailCommand(string NewEmail, string CurrentPassword);
```

`ChangeEmailCommandValidator.cs`:

```csharp
using FluentValidation;

namespace BAR.Application.Profile.ChangeEmail;

public sealed class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(c => c.NewEmail).NotEmpty().EmailAddress();
        RuleFor(c => c.CurrentPassword).NotEmpty();
    }
}
```

`ChangeEmailCommandHandler.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.ChangeEmail;

public sealed class ChangeEmailCommandHandler(ISellerRepository sellers, IPasswordHasher passwordHasher)
{
    public async Task HandleAsync(string sellerId, ChangeEmailCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        if (seller.PasswordHash is null || !passwordHasher.Verify(command.CurrentPassword, seller.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalid_credentials", "Ungültiges Passwort");
        }

        var existingWithEmail = await sellers.GetByEmailAsync(command.NewEmail, cancellationToken);
        if (existingWithEmail is not null && existingWithEmail.Id != seller.Id)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        seller.ChangeEmail(command.NewEmail);
        await sellers.UpdateAsync(seller, cancellationToken);
    }
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ChangeEmailCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Endpoint ergänzen**

In `ProfileEndpoints.cs`, `using BAR.Application.Profile.ChangeEmail;` ergänzen, dann vor `return app;`:

```csharp
app.MapPut("/api/profile/email", async (ClaimsPrincipal user, ChangeEmailCommand command, ChangeEmailCommandHandler handler, CancellationToken ct) =>
{
    var sellerId = user.FindFirstValue("sub")!;
    await handler.HandleAsync(sellerId, command, ct);
    return Results.NoContent();
}).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangeEmailCommand>>();
```

- [ ] **Step 6: DI-Registrierung**

In `DependencyInjection.cs`, `using BAR.Application.Profile.ChangeEmail;` ergänzen, nach Zeile 101 (`services.AddScoped<IValidator<UpdateProfileCommand>, UpdateProfileCommandValidator>();`):

```csharp
services.AddScoped<ChangeEmailCommandHandler>();
services.AddScoped<IValidator<ChangeEmailCommand>, ChangeEmailCommandValidator>();
```

- [ ] **Step 7: Failing Integration-Tests schreiben**

Ergänze in `ProfileEndpointsTests.cs` (nach `PutProfile_MissingRequiredField_Returns400`):

```csharp
[Fact]
public async Task PutProfileEmail_CorrectPassword_ChangesEmailAndOldEmailStopsWorking()
{
    var client = _factory.CreateClient();
    var email = $"{Guid.NewGuid()}@example.com";
    await client.PostAsJsonAsync("/api/auth/register", new
    {
        email, password = "geheim123!", firstName = "Anna", lastName = "Beispiel",
        address = "Hauptstr. 1", postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    }, TestContext.Current.CancellationToken);
    var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
    var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
    var newEmail = $"{Guid.NewGuid()}@example.com";

    var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail, currentPassword = "geheim123!" }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    var loginWithNewEmail = await client.PostAsJsonAsync("/api/auth/login", new { email = newEmail, password = "geheim123!" }, TestContext.Current.CancellationToken);
    Assert.Equal(HttpStatusCode.OK, loginWithNewEmail.StatusCode);
    var loginWithOldEmail = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
    Assert.Equal(HttpStatusCode.Unauthorized, loginWithOldEmail.StatusCode);
}

[Fact]
public async Task PutProfileEmail_WrongPassword_Returns401()
{
    var client = await RegisterAndAuthenticateAsync();

    var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail = "neu@example.com", currentPassword = "falsch" }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}

[Fact]
public async Task PutProfileEmail_AlreadyTaken_Returns409()
{
    var otherClient = _factory.CreateClient();
    var otherEmail = $"{Guid.NewGuid()}@example.com";
    await otherClient.PostAsJsonAsync("/api/auth/register", new
    {
        email = otherEmail, password = "geheim123!", firstName = "Ben", lastName = "Y",
        address = (string?)null, postalCode = "1", city = "Berlin", phone = "0"
    }, TestContext.Current.CancellationToken);
    var client = await RegisterAndAuthenticateAsync();

    var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail = otherEmail, currentPassword = "geheim123!" }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
}
```

- [ ] **Step 8: Integration-Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ProfileEndpointsTests`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Profile/ChangeEmail src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/ChangeEmail src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-backend): add PUT /api/profile/email"
```

---

## Task 4: `PUT /api/profile/password` — Passwort ändern

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangePassword/ChangePasswordCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangePassword/ChangePasswordCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Profile/ChangePassword/ChangePasswordCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/ChangePassword/ChangePasswordCommandHandlerTests.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`

**Interfaces:**
- Produces: `ChangePasswordCommand(string CurrentPassword, string NewPassword, string NewPasswordConfirmation)`, `ChangePasswordCommandHandler.HandleAsync(string sellerId, ChangePasswordCommand command, CancellationToken ct) : Task<TokenPairResult>`.
- Consumes: `Seller.ChangePassword` (Task 1), `IRefreshTokenRepository.DeleteAllForSellerAsync`/`AddAsync`, `ITokenIssuer`, `IClock`, `IUnitOfWork.ExecuteInTransactionAsync` (Muster aus `SetPasswordCommandHandler.cs:21-37`), `TokenPairResult` (`BAR.Application.Auth.TokenPairResult`).

- [ ] **Step 1: Failing Tests schreiben**

`ChangePasswordCommandHandlerTests.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth;
using BAR.Application.Profile.ChangePassword;
using BAR.Domain.Auth;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Profile.ChangePassword;

public class ChangePasswordCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ChangePasswordCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _passwordHasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    private void SetUpTransaction() =>
        _unitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

    private static Seller ExistingSeller() =>
        Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed-old");

    [Fact]
    public async Task HandleAsync_CorrectPasswordAndMatchingConfirmation_RotatesTokensForCallingDevice()
    {
        SetUpTransaction();
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        _passwordHasher.Setup(p => p.Hash("neuGeheim456!")).Returns("hashed-new");
        _clock.SetupGet(c => c.UtcNow).Returns(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc));
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plaintext");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(seller.Id,
            new ChangePasswordCommand("geheim123!", "neuGeheim456!", "neuGeheim456!"), TestContext.Current.CancellationToken);

        Assert.Equal("hashed-new", seller.PasswordHash);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plaintext", result.RefreshToken);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.Is<RefreshToken>(rt => rt.SellerId == seller.Id), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WrongCurrentPassword_ThrowsUnauthorized_DoesNotTouchTokens()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("falsch", "hashed-old")).Returns(false);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => handler.HandleAsync(
            seller.Id, new ChangePasswordCommand("falsch", "neuGeheim456!", "neuGeheim456!"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_credentials", ex.ErrorCode);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ChangePasswordCommandHandlerTests`
Expected: FAIL — Namespace/Klassen existieren nicht.

- [ ] **Step 3: Command, Validator, Handler implementieren**

`ChangePasswordCommand.cs`:

```csharp
namespace BAR.Application.Profile.ChangePassword;

public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword, string NewPasswordConfirmation);
```

`ChangePasswordCommandValidator.cs`:

```csharp
using FluentValidation;

namespace BAR.Application.Profile.ChangePassword;

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(c => c.CurrentPassword).NotEmpty();

        // Passwortstaerke "mind. Mittel" - dupliziert aus RegisterCommandValidator/
        // SetPasswordCommandValidator (Projektkonvention: je ein Aufrufer, keine
        // spekulative Extraktion).
        RuleFor(c => c.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Must(HasAtLeastTwoCharacterTypes)
            .WithMessage("Passwort muss mindestens 'Mittel' stark sein.");

        RuleFor(c => c.NewPasswordConfirmation)
            .Equal(c => c.NewPassword)
            .WithMessage("Passwörter stimmen nicht überein.");
    }

    private static bool HasAtLeastTwoCharacterTypes(string password)
    {
        var typeCount = new[]
        {
            password.Any(char.IsUpper),
            password.Any(char.IsLower),
            password.Any(char.IsDigit),
            password.Any(c => !char.IsLetterOrDigit(c))
        }.Count(x => x);

        return typeCount >= 2;
    }
}
```

`ChangePasswordCommandHandler.cs`:

```csharp
using BAR.Application.Abstractions;
using BAR.Application.Auth;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairResult> HandleAsync(string sellerId, ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        TokenPairResult? result = null;

        // Passwort-Aenderung, Abmelden aller Geraete und Ausstellen des neuen
        // Token-Paars sind ein einziger fachlicher Vorgang (R07 AC-3) - sonst
        // koennte ein Fehler nach dem Loeschen der alten Tokens das aufrufende
        // Geraet ohne jedes gueltige Token zuruecklassen.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(sellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

            if (seller.PasswordHash is null || !passwordHasher.Verify(command.CurrentPassword, seller.PasswordHash))
            {
                throw new UnauthorizedException("auth.invalid_credentials", "Ungültiges Passwort");
            }

            seller.ChangePassword(passwordHasher.Hash(command.NewPassword));
            await sellers.UpdateAsync(seller, ct);

            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairResult(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ChangePasswordCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Endpoint ergänzen**

In `ProfileEndpoints.cs`, `using BAR.Application.Profile.ChangePassword;` ergänzen, dann:

```csharp
app.MapPut("/api/profile/password", async (ClaimsPrincipal user, ChangePasswordCommand command, ChangePasswordCommandHandler handler, CancellationToken ct) =>
{
    var sellerId = user.FindFirstValue("sub")!;
    var result = await handler.HandleAsync(sellerId, command, ct);
    return Results.Ok(result);
}).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangePasswordCommand>>();
```

- [ ] **Step 6: DI-Registrierung**

In `DependencyInjection.cs`, `using BAR.Application.Profile.ChangePassword;` ergänzen:

```csharp
services.AddScoped<ChangePasswordCommandHandler>();
services.AddScoped<IValidator<ChangePasswordCommand>, ChangePasswordCommandValidator>();
```

- [ ] **Step 7: Failing Integration-Tests schreiben**

Ergänze in `ProfileEndpointsTests.cs`:

```csharp
[Fact]
public async Task PutProfilePassword_CorrectCurrentPassword_ReturnsNewTokenPairAndInvalidatesOldRefreshToken()
{
    var client = _factory.CreateClient();
    var email = $"{Guid.NewGuid()}@example.com";
    var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
    {
        email, password = "geheim123!", firstName = "Anna", lastName = "Beispiel",
        address = "Hauptstr. 1", postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    }, TestContext.Current.CancellationToken);
    var originalTokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", originalTokens!.AccessToken);

    var response = await client.PutAsJsonAsync("/api/profile/password", new
    {
        currentPassword = "geheim123!", newPassword = "neuGeheim456!", newPasswordConfirmation = "neuGeheim456!"
    }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var newTokens = await response.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
    Assert.NotEqual(originalTokens.RefreshToken, newTokens!.RefreshToken);

    var refreshWithOldToken = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = originalTokens.RefreshToken }, TestContext.Current.CancellationToken);
    Assert.Equal(HttpStatusCode.Unauthorized, refreshWithOldToken.StatusCode);
}

[Fact]
public async Task PutProfilePassword_WrongCurrentPassword_Returns401()
{
    var client = await RegisterAndAuthenticateAsync();

    var response = await client.PutAsJsonAsync("/api/profile/password", new
    {
        currentPassword = "falsch", newPassword = "neuGeheim456!", newPasswordConfirmation = "neuGeheim456!"
    }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}

[Fact]
public async Task PutProfilePassword_ConfirmationMismatch_Returns400()
{
    var client = await RegisterAndAuthenticateAsync();

    var response = await client.PutAsJsonAsync("/api/profile/password", new
    {
        currentPassword = "geheim123!", newPassword = "neuGeheim456!", newPasswordConfirmation = "anders789!"
    }, TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
```

`RefreshCommand.cs:3` bestätigt: `record RefreshCommand(string RefreshToken)` → Request-Body-Property `refreshToken` (camelCase) ist korrekt.

- [ ] **Step 8: Integration-Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ProfileEndpointsTests`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Profile/ChangePassword src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/ChangePassword src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-backend): add PUT /api/profile/password"
```

---

## Task 5: `DELETE /api/profile` — Konto löschen

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Profile/DeleteProfile/DeleteProfileCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/DeleteProfile/DeleteProfileCommandHandlerTests.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`

**Interfaces:**
- Produces: `DeleteProfileCommandHandler.HandleAsync(string sellerId, CancellationToken ct) : Task`.
- Consumes: `ISellerCascadeDeleter.DeleteAsync` (Task 2).

- [ ] **Step 1: Failing Tests schreiben**

`DeleteProfileCommandHandlerTests.cs`:

```csharp
using BAR.Application.Profile.DeleteProfile;
using BAR.Application.Sellers;
using BAR.Domain.Exceptions;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Profile.DeleteProfile;

public class DeleteProfileCommandHandlerTests
{
    private readonly Mock<ISellerCascadeDeleter> _cascadeDeleter = new();

    private DeleteProfileCommandHandler CreateHandler() => new(_cascadeDeleter.Object);

    [Fact]
    public async Task HandleAsync_NonAdminSeller_CallsCascadeDeleterWithOwnId()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(seller.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(seller, ct));
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, TestContext.Current.CancellationToken);

        _cascadeDeleter.Verify(c => c.DeleteAsync(
            seller.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_AdminSeller_ThrowsForbidden()
    {
        var admin = Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", "admin@bazaar.local", "t1", true);
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(admin.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(admin, ct));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => handler.HandleAsync(admin.Id, TestContext.Current.CancellationToken));

        Assert.Equal("profile.admin_self_delete", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter DeleteProfileCommandHandlerTests`
Expected: FAIL — `DeleteProfileCommandHandler` existiert nicht.

- [ ] **Step 3: Handler implementieren**

`DeleteProfileCommandHandler.cs`:

```csharp
using BAR.Application.Sellers;
using BAR.Domain.Exceptions;

namespace BAR.Application.Profile.DeleteProfile;

public sealed class DeleteProfileCommandHandler(ISellerCascadeDeleter cascadeDeleter)
{
    public Task HandleAsync(string sellerId, CancellationToken cancellationToken) =>
        cascadeDeleter.DeleteAsync(sellerId, (seller, ct) =>
        {
            if (seller.IsAdmin)
            {
                throw new ForbiddenException("profile.admin_self_delete", "Admins können ihr Konto nicht selbst löschen");
            }

            return Task.CompletedTask;
        }, cancellationToken);
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter DeleteProfileCommandHandlerTests`
Expected: PASS

- [ ] **Step 5: Endpoint ergänzen**

In `ProfileEndpoints.cs`, `using BAR.Application.Profile.DeleteProfile;` ergänzen:

```csharp
app.MapDelete("/api/profile", async (ClaimsPrincipal user, DeleteProfileCommandHandler handler, CancellationToken ct) =>
{
    var sellerId = user.FindFirstValue("sub")!;
    await handler.HandleAsync(sellerId, ct);
    return Results.NoContent();
}).RequireAuthorization();
```

- [ ] **Step 6: DI-Registrierung**

In `DependencyInjection.cs`, `using BAR.Application.Profile.DeleteProfile;` ergänzen:

```csharp
services.AddScoped<DeleteProfileCommandHandler>();
```

- [ ] **Step 7: Failing Integration-Tests schreiben**

Ergänze in `ProfileEndpointsTests.cs`:

```csharp
[Fact]
public async Task DeleteProfile_NonAdminSeller_DeletesAccountAndLoginFailsAfterwards()
{
    var client = _factory.CreateClient();
    var email = $"{Guid.NewGuid()}@example.com";
    await client.PostAsJsonAsync("/api/auth/register", new
    {
        email, password = "geheim123!", firstName = "Anna", lastName = "Beispiel",
        address = "Hauptstr. 1", postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    }, TestContext.Current.CancellationToken);
    var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
    var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

    var response = await client.DeleteAsync("/api/profile", TestContext.Current.CancellationToken);

    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    var loginAfterDelete = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
    Assert.Equal(HttpStatusCode.Unauthorized, loginAfterDelete.StatusCode);
}
```

Für den Admin-Fall (`403 profile.admin_self_delete`) reicht der bereits vorhandene Unit-Test aus Step 1 — ein Integrationstest bräuchte einen zweiten Admin-Account nur um den ersten Admin per Invite anzulegen, was gegenüber dem Unit-Test keinen zusätzlichen Erkenntniswert hat; nicht ergänzen (YAGNI).

- [ ] **Step 8: Integration-Test laufen lassen, Erfolg bestätigen**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ProfileEndpointsTests`
Expected: PASS

- [ ] **Step 9: Gesamtes Backend bauen und testen**

Run: `dotnet build src/advance-registration/backend/BAR.sln && dotnet test src/advance-registration/backend/BAR.sln`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Profile/DeleteProfile src/advance-registration/backend/tests/BAR.Application.UnitTests/Profile/DeleteProfile src/advance-registration/backend/BAR.Host/Features/Profile/ProfileEndpoints.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Profile/ProfileEndpointsTests.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs
git commit -m "feat(bar-backend): add DELETE /api/profile"
```

---

## Task 6: Frontend — `ProfileApiService` um drei Methoden ergänzen

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.ts`

**Interfaces:**
- Produces: `ProfileApiService.changeEmail(payload: ChangeEmailPayload): Observable<void>`, `.changePassword(payload: ChangePasswordPayload): Observable<TokenPair>`, `.deleteAccount(): Observable<void>`, sowie exportierte Typen `ChangeEmailPayload`, `ChangePasswordPayload`, `TokenPair`.
- Consumes (Task 7/8): diese Methoden und Typen.

Kein eigener Test für diese Datei — sie ist ein dünner HTTP-Wrapper ohne Verzweigungslogik (Muster: bestehende `getProfile`/`updateProfile` haben ebenfalls keinen eigenen Service-Test, die Abdeckung läuft über die Component-Tests in Task 7/8).

- [ ] **Step 1: Methoden und Typen ergänzen**

`profile-api.service.ts` komplett ersetzen durch:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerTypeDto {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerType: SellerTypeDto;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
}

export interface ChangeEmailPayload {
  newEmail: string;
  currentPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>('/api/profile');
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ProfileDto> {
    return this.http.put<ProfileDto>('/api/profile', payload);
  }

  changeEmail(payload: ChangeEmailPayload): Observable<void> {
    return this.http.put<void>('/api/profile/email', payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<TokenPair> {
    return this.http.put<TokenPair>('/api/profile/password', payload);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>('/api/profile');
  }
}
```

- [ ] **Step 2: Frontend bauen, Typfehler ausschließen**

Run: `npm run build --prefix src/advance-registration/frontend/BAR.App`
Expected: PASS (noch keine Verwender der neuen Methoden — reiner Kompilier-Check)

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile/profile-api.service.ts
git commit -m "feat(bar-app): add changeEmail/changePassword/deleteAccount to ProfileApiService"
```

---

## Task 7: Frontend — Tab 2 „Zugangsdaten" (E-Mail und Passwort ändern)

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.spec.ts`

**Interfaces:**
- Consumes: `ProfileApiService.changeEmail`/`changePassword` (Task 6), `PasswordStrengthMeter` (`shared/password-strength-meter/password-strength-meter.ts`), `InfoArea` (`shared/info-area/info-area.ts`), `AuthService.login` (`core/auth/auth.service.ts`).

- [ ] **Step 1: Failing Tests schreiben**

Ergänze in `ProfilePage.spec.ts` (Imports erweitern, neue `describe`-Blöcke nach dem letzten `it`):

```typescript
import { AuthService } from '../../../core/auth/auth.service';
```

```typescript
describe('ProfilePage - Zugangsdaten', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return { type: '', frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('changes the email with the correct current password', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('neu@example.com');
    fixture.componentInstance.emailCurrentPassword.set('geheim123!');
    fixture.componentInstance.changeEmail();

    const req = httpMock.expectOne('/api/profile/email');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ newEmail: 'neu@example.com', currentPassword: 'geheim123!' });
    req.flush(null);

    expect(fixture.componentInstance.emailError()).toBeNull();
  });

  it('shows 401 as wrong-password error on email change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('neu@example.com');
    fixture.componentInstance.emailCurrentPassword.set('falsch');
    fixture.componentInstance.changeEmail();

    httpMock.expectOne('/api/profile/email').flush('Ungültiges Passwort', { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.emailError()).toBe('Aktuelles Passwort ist falsch');
  });

  it('shows 409 as email-taken error on email change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('vergeben@example.com');
    fixture.componentInstance.emailCurrentPassword.set('geheim123!');
    fixture.componentInstance.changeEmail();

    httpMock.expectOne('/api/profile/email').flush('E-Mail vergeben', { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.emailError()).toBe('Diese E-Mail ist bereits vergeben');
  });

  it('changes the password and updates the auth tokens', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();
    const authService = TestBed.inject(AuthService);
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.passwordCurrentPassword.set('geheim123!');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('neuGeheim456!');
    fixture.componentInstance.changePassword();

    const req = httpMock.expectOne('/api/profile/password');
    expect(req.request.method).toBe('PUT');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(fixture.componentInstance.passwordError()).toBeNull();
  });

  it('shows 401 as wrong-password error on password change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.passwordCurrentPassword.set('falsch');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('neuGeheim456!');
    fixture.componentInstance.changePassword();

    httpMock.expectOne('/api/profile/password').flush('Ungültiges Passwort', { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.passwordError()).toBe('Aktuelles Passwort ist falsch');
  });

  it('disables the password submit while confirmation does not match', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.passwordCurrentPassword.set('geheim123!');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('anders789!');

    expect(fixture.componentInstance.canChangePassword()).toBe(false);
  });
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: FAIL — `newEmail`, `changeEmail`, `passwordCurrentPassword` etc. existieren nicht.

- [ ] **Step 3: `ProfilePage.ts` um Zugangsdaten-State und -Methoden ergänzen**

Imports ergänzen:

```typescript
import { ProfileApiService, ProfileDto, ChangeEmailPayload, ChangePasswordPayload } from '../profile-api.service';
import { PasswordStrengthMeter, PasswordStrengthLevel } from '../../../shared/password-strength-meter/password-strength-meter';
import { AuthService } from '../../../core/auth/auth.service';
```

`@Component`-Decorator, `imports`-Array um `PasswordStrengthMeter` erweitern.

Innerhalb der Klasse ergänzen (nach den bestehenden Signals):

```typescript
  private readonly authService = inject(AuthService);

  readonly newEmail = signal('');
  readonly emailCurrentPassword = signal('');
  readonly emailError = signal<string | null>(null);

  readonly passwordCurrentPassword = signal('');
  readonly newPassword = signal('');
  readonly newPasswordConfirmation = signal('');
  readonly newPasswordLevel = signal<PasswordStrengthLevel>('schwach');
  readonly passwordError = signal<string | null>(null);

  readonly canChangeEmail = computed(() =>
    this.newEmail().trim() !== '' && this.emailCurrentPassword().trim() !== '');

  readonly canChangePassword = computed(() =>
    this.passwordCurrentPassword().trim() !== '' &&
    this.newPassword().trim() !== '' &&
    this.newPassword() === this.newPasswordConfirmation() &&
    (this.newPasswordLevel() === 'mittel' || this.newPasswordLevel() === 'stark'));
```

Methoden ergänzen:

```typescript
  changeEmail(): void {
    if (!this.canChangeEmail()) return;

    this.emailError.set(null);

    const payload: ChangeEmailPayload = {
      newEmail: this.newEmail(),
      currentPassword: this.emailCurrentPassword()
    };

    this.api.changeEmail(payload).subscribe({
      next: () => {
        this.newEmail.set('');
        this.emailCurrentPassword.set('');
        this.messageService.add({ severity: 'success', summary: '✓ E-Mail geändert' });
      },
      error: (response: { status: number }) => {
        if (response.status === 401) {
          this.emailError.set('Aktuelles Passwort ist falsch');
        } else if (response.status === 409) {
          this.emailError.set('Diese E-Mail ist bereits vergeben');
        } else {
          this.emailError.set('E-Mail konnte nicht geändert werden');
        }
      }
    });
  }

  changePassword(): void {
    if (!this.canChangePassword()) return;

    this.passwordError.set(null);

    const payload: ChangePasswordPayload = {
      currentPassword: this.passwordCurrentPassword(),
      newPassword: this.newPassword(),
      newPasswordConfirmation: this.newPasswordConfirmation()
    };

    this.api.changePassword(payload).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        this.passwordCurrentPassword.set('');
        this.newPassword.set('');
        this.newPasswordConfirmation.set('');
        this.messageService.add({ severity: 'success', summary: '✓ Passwort geändert' });
      },
      error: (response: { status: number }) => {
        if (response.status === 401) {
          this.passwordError.set('Aktuelles Passwort ist falsch');
        } else {
          this.passwordError.set('Passwort konnte nicht geändert werden');
        }
      }
    });
  }
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: PASS

- [ ] **Step 5: Tab 2 im Template ausfüllen**

In `ProfilePage.html`, `disabled` bei `<p-tab value="zugangsdaten" ...>` entfernen, und den Platzhalter-Inhalt ersetzen durch:

```html
    <p-tabpanel value="zugangsdaten">
      <form (ngSubmit)="changeEmail()">
        <div class="panel-block">
          <p class="panel-block__title">E-Mail ändern</p>
          <div class="form-grid">
            <div>
              <label for="newEmail">Neue E-Mail *</label>
              <input id="newEmail" pInputText type="email" [ngModel]="newEmail()" (ngModelChange)="newEmail.set($event)" name="newEmail" required />
            </div>
            <div>
              <label for="emailCurrentPassword">Aktuelles Passwort *</label>
              <input id="emailCurrentPassword" pInputText type="password" [ngModel]="emailCurrentPassword()" (ngModelChange)="emailCurrentPassword.set($event)" name="emailCurrentPassword" required />
            </div>
          </div>
          @if (emailError()) {
            <app-info-area type="error" [message]="emailError()!" />
          }
          <p-button type="submit" label="E-Mail ändern" [disabled]="!canChangeEmail()" />
        </div>
      </form>

      <form (ngSubmit)="changePassword()">
        <div class="panel-block">
          <p class="panel-block__title">Passwort ändern</p>
          <div class="form-grid">
            <div>
              <label for="passwordCurrentPassword">Aktuelles Passwort *</label>
              <input id="passwordCurrentPassword" pInputText type="password" [ngModel]="passwordCurrentPassword()" (ngModelChange)="passwordCurrentPassword.set($event)" name="passwordCurrentPassword" required />
            </div>
            <div>
              <label for="newPassword">Neues Passwort *</label>
              <input id="newPassword" pInputText type="password" [ngModel]="newPassword()" (ngModelChange)="newPassword.set($event)" name="newPassword" required />
              <app-password-strength-meter [password]="newPassword()" (level)="newPasswordLevel.set($event)" />
            </div>
            <div>
              <label for="newPasswordConfirmation">Neues Passwort bestätigen *</label>
              <input id="newPasswordConfirmation" pInputText type="password" [ngModel]="newPasswordConfirmation()" (ngModelChange)="newPasswordConfirmation.set($event)" name="newPasswordConfirmation" required />
            </div>
          </div>
          @if (passwordError()) {
            <app-info-area type="error" [message]="passwordError()!" />
          }
          <p-button type="submit" label="Passwort ändern" [disabled]="!canChangePassword()" />
        </div>
      </form>
    </p-tabpanel>
```

- [ ] **Step 6: Tests erneut laufen lassen (Regression bestehender Tab-1-Tests)**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.spec.ts
git commit -m "feat(bar-app): add Zugangsdaten tab (email and password change)"
```

---

## Task 8: Frontend — Tab 3 „Löschen" (Konto löschen)

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.spec.ts`

**Interfaces:**
- Consumes: `ProfileApiService.deleteAccount` (Task 6), `ConfirmationService`/`ConfirmDialogModule` (`primeng/api`, bereits app-weit via `app.config.ts` provided, siehe `shared/seller-edit-dialog/seller-edit-dialog.ts:191-199` als Vorbild), `AuthService.logout()`, `AuthService.currentUser()?.role`.

- [ ] **Step 1: Failing Tests schreiben**

Ergänze in `ProfilePage.spec.ts`:

```typescript
import { ConfirmationService } from 'primeng/api';
```

```typescript
describe('ProfilePage - Konto löschen', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return { type: '', frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deletes the account and logs out after confirmation', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();
    const authService = TestBed.inject(AuthService);
    const logoutSpy = vi.spyOn(authService, 'logout').mockImplementation(() => {});
    const confirmationService = TestBed.inject(ConfirmationService);
    vi.spyOn(confirmationService, 'confirm').mockImplementation((options) => {
      options.accept?.();
      return confirmationService;
    });

    fixture.componentInstance.confirmDeleteAccount();

    httpMock.expectOne('/api/profile').flush(null);
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('hides the delete tab content for admins', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    const authService = TestBed.inject(AuthService);
    authService.currentUser.set({ sub: 'admin-1', role: 'admin', exp: Date.now() / 1000 + 3600 });
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    expect(fixture.componentInstance.isAdmin()).toBe(true);
  });
});
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag bestätigen**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: FAIL — `confirmDeleteAccount`, `isAdmin` existieren nicht.

- [ ] **Step 3: `ProfilePage.ts` um Lösch-Logik ergänzen**

Import ergänzen: `import { ConfirmationService } from 'primeng/api';` (zur bestehenden `MessageService`-Import-Zeile hinzufügen).

Innerhalb der Klasse ergänzen:

```typescript
  private readonly confirmationService = inject(ConfirmationService);

  readonly isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
```

Methode ergänzen:

```typescript
  confirmDeleteAccount(): void {
    this.confirmationService.confirm({
      message: 'Konto wirklich löschen? Alle Artikel und Nummernblöcke werden ebenfalls gelöscht.',
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => {
        this.api.deleteAccount().subscribe(() => this.authService.logout());
      }
    });
  }
```

- [ ] **Step 4: Tests laufen lassen, Erfolg bestätigen**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: PASS

- [ ] **Step 5: Tab 3 im Template ausfüllen**

In `ProfilePage.html`, `disabled` bei `<p-tab value="loeschen" ...>` entfernen, und den Platzhalter-Inhalt ersetzen durch:

```html
    <p-tabpanel value="loeschen">
      @if (isAdmin()) {
        <p>Als Admin kann das eigene Konto hier nicht gelöscht werden.</p>
      } @else {
        <div class="panel-block">
          <p class="panel-block__title">Account löschen</p>
          <p>Diese Aktion kann nicht rückgängig gemacht werden. Alle Artikel und Nummernblöcke werden mitgelöscht.</p>
          <p-button label="Account löschen" severity="danger" (onClick)="confirmDeleteAccount()" />
        </div>
      }
    </p-tabpanel>
```

`ProfilePage.ts`-`imports`-Array um `ConfirmDialogModule` **nicht** ergänzen — `<p-confirm-dialog />` ist bereits global in `core/shell/shell.html` gerendert (siehe Spec-Exploration), ein zweites Element wird nicht gebraucht.

- [ ] **Step 6: Tests erneut laufen lassen (volle Regression für ProfilePage)**

Run: `npm test --prefix src/advance-registration/frontend/BAR.App -- ProfilePage.spec.ts`
Expected: PASS — alle Tabs (Steckbrief, Zugangsdaten, Löschen)

- [ ] **Step 7: Gesamtes Frontend bauen und testen**

Run: `npm run build --prefix src/advance-registration/frontend/BAR.App && npm test --prefix src/advance-registration/frontend/BAR.App`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.spec.ts
git commit -m "feat(bar-app): add Loeschen tab (account deletion with confirm dialog)"
```

---

## Task 9: Von Hand prüfen (Roadmap-Akzeptanzkriterien)

**Files:** keine (manuelle Verifikation)

- [ ] **Step 1: App lokal starten**

Backend: `dotnet run --project src/advance-registration/backend/BAR.Host`
Frontend: `npm start --prefix src/advance-registration/frontend/BAR.App`

- [ ] **Step 2: Roadmap-AC 1–6 von Hand durchgehen**

Gemäß [R07-konto-sicherheit.md](../../requirements/advance-registration/roadmap/R07-konto-sicherheit.md) Abschnitt „Fertig, wenn":
1. E-Mail ändern ohne korrektes Passwort → wird abgelehnt.
2. E-Mail mit korrektem Passwort ändern → neue Adresse funktioniert, alte nicht mehr.
3. Passwort in Browser A ändern, während Browser B angemeldet ist → Browser B fliegt beim nächsten Refresh raus, Browser A bleibt an.
4. Passwortänderung ohne korrektes aktuelles Passwort → wird abgelehnt.
5. Als Verkäufer mit Artikeln eigenes Konto löschen → abgemeldet, Login schlägt fehl, aus Admin-Liste verschwunden, Nummern wieder frei.
6. Als Admin Tab „Account löschen" aufrufen → Löschen ist nicht möglich.

- [ ] **Step 3: Bei Abweichungen zurück zur betroffenen Task, sonst fertig.**

using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace BAR.Host.IntegrationTests.Persistence;

/// <summary>
/// Real VerkaeuferverwaltungDbContext (ueber die Factory-DI) + gemockte
/// IAnmeldungModuleApi statt frueher IArticleRepository/INumberBlockRepository -
/// Artikel/Nummernbloecke liegen seit dem Modulith-Schnitt in einem anderen
/// Schema und werden best-effort NACH der Transaktion ueber Anmeldung.Contracts
/// geloescht (siehe SellerCascadeDeleter-Kommentar), nicht mehr innerhalb
/// derselben DB-Transaktion.
/// </summary>
public class SellerCascadeDeleterTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerCascadeDeleterTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static SellerCascadeDeleter CreateDeleter(IServiceProvider services, Mock<IAnmeldungModuleApi> anmeldung) => new(
        services.GetRequiredService<ISellerRepository>(),
        services.GetRequiredService<IRefreshTokenRepository>(),
        anmeldung.Object,
        services.GetRequiredService<IUnitOfWork>());

    [Fact]
    public async Task DeleteAsync_GuardPasses_DeletesSellerAndCallsAnmeldungAfterCommit()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
        await sellers.AddAsync(seller, ct);
        var anmeldung = new Mock<IAnmeldungModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, anmeldung);

        await deleter.DeleteAsync(seller.Id, (_, _) => Task.CompletedTask, ct);

        Assert.Null(await sellers.GetByIdAsync(seller.Id, ct));
        anmeldung.Verify(a => a.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_GuardThrows_RollsBackAndDoesNotCallAnmeldung()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var seller = Seller.Register("Ben", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
        await sellers.AddAsync(seller, ct);
        var anmeldung = new Mock<IAnmeldungModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, anmeldung);

        await Assert.ThrowsAsync<ConflictException>(() => deleter.DeleteAsync(
            seller.Id, (_, _) => throw new ConflictException("test.guard", "Guard-Fehler"), ct));

        Assert.NotNull(await sellers.GetByIdAsync(seller.Id, ct));
        anmeldung.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_UnknownSellerId_ThrowsNotFoundAndDoesNotCallAnmeldung()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var anmeldung = new Mock<IAnmeldungModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, anmeldung);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() => deleter.DeleteAsync(
            "unknown1", (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken));

        Assert.Equal("seller.not_found", ex.ErrorCode);
        anmeldung.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

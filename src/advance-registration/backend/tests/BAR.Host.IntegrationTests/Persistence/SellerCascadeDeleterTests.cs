using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace BAR.Host.IntegrationTests.Persistence;

/// <summary>
/// Real SellerManagementDbContext (via factory DI) + mocked
/// IRegistrationModuleApi instead of the former
/// IArticleRepository/INumberBlockRepository - since the modulith split,
/// articles/number blocks live in a different schema and are deleted
/// best-effort AFTER the transaction via Registration.Contracts (see the
/// SellerCascadeDeleter comment), no longer within the same DB transaction.
/// </summary>
public class SellerCascadeDeleterTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerCascadeDeleterTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static SellerCascadeDeleter CreateDeleter(IServiceProvider services, Mock<IRegistrationModuleApi> registration) => new(
        services.GetRequiredService<ISellerRepository>(),
        services.GetRequiredService<IRefreshTokenRepository>(),
        registration.Object,
        services.GetRequiredService<IUnitOfWork>());

    [Fact]
    public async Task DeleteAsync_GuardPasses_DeletesSellerAndCallsRegistrationAfterCommit()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
        await sellers.AddAsync(seller, ct);
        var registration = new Mock<IRegistrationModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, registration);

        await deleter.DeleteAsync(seller.Id, (_, _) => Task.CompletedTask, ct);

        Assert.Null(await sellers.GetByIdAsync(seller.Id, ct));
        registration.Verify(a => a.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_GuardThrows_RollsBackAndDoesNotCallRegistration()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var seller = Seller.Register("Ben", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
        await sellers.AddAsync(seller, ct);
        var registration = new Mock<IRegistrationModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, registration);

        await Assert.ThrowsAsync<ConflictException>(() => deleter.DeleteAsync(
            seller.Id, (_, _) => throw new ConflictException("test.guard", "Guard-Fehler"), ct));

        Assert.NotNull(await sellers.GetByIdAsync(seller.Id, ct));
        registration.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_UnknownSellerId_ThrowsNotFoundAndDoesNotCallRegistration()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var registration = new Mock<IRegistrationModuleApi>();
        var deleter = CreateDeleter(scope.ServiceProvider, registration);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() => deleter.DeleteAsync(
            "unknown1", (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken));

        Assert.Equal("seller.not_found", ex.ErrorCode);
        registration.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

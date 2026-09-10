using BAR.Application.Sellers;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

/// <summary>
/// Integration test gegen echte Postgres-DB (statt Mock-IUnitOfWork wie in
/// BAR.Application.UnitTests.Sellers.SellerCascadeDeleterTests): belegt, dass
/// die Kaskade transaktional ist - schlaegt der Guard fehl, bleibt der
/// Datenbestand (Seller, Artikel, Nummernblock) unveraendert. Design-Spec
/// 2026-09-10-r07-konto-sicherheit-design.md, Abschnitt "Integration (Backend)".
/// </summary>
public class SellerCascadeDeleterTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    private static readonly DateTime Now = new(2026, 9, 10, 10, 0, 0, DateTimeKind.Utc);

    public SellerCascadeDeleterTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task DeleteAsync_GuardThrows_RollsBackAndLeavesSellerArticlesAndBlocksIntact()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        string sellerId;

        using (var setupScope = _factory.Services.CreateScope())
        {
            var sellers = setupScope.ServiceProvider.GetRequiredService<ISellerRepository>();
            var blocks = setupScope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
            var articles = setupScope.ServiceProvider.GetRequiredService<IArticleRepository>();

            var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
                "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
            await sellers.AddAsync(seller, ct);
            sellerId = seller.Id;

            var block = NumberBlock.Assign(sellerId, 9001, 10, Now);
            await blocks.AddAsync(block, ct);

            var article = Article.Create(sellerId, 9001, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);
            await articles.CreateAsync(article, newBlock: null, ct);
        }

        using (var deleteScope = _factory.Services.CreateScope())
        {
            var cascadeDeleter = deleteScope.ServiceProvider.GetRequiredService<ISellerCascadeDeleter>();

            var ex = await Assert.ThrowsAsync<ConflictException>(() => cascadeDeleter.DeleteAsync(
                sellerId,
                (_, _) => throw new ConflictException("test.guard", "Guard-Fehler"),
                ct));

            Assert.Equal("test.guard", ex.ErrorCode);
        }

        using (var verifyScope = _factory.Services.CreateScope())
        {
            var sellers = verifyScope.ServiceProvider.GetRequiredService<ISellerRepository>();
            var blocks = verifyScope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
            var articles = verifyScope.ServiceProvider.GetRequiredService<IArticleRepository>();

            Assert.NotNull(await sellers.GetByIdAsync(sellerId, ct));
            Assert.Equal(1, await articles.CountForSellerAsync(sellerId, ct));
            Assert.Single(await blocks.GetForSellerAsync(sellerId, ct));
        }
    }

    [Fact]
    public async Task DeleteAsync_GuardPasses_CommitsCascadeAcrossArticlesBlocksAndSeller()
    {
        _ = _factory.Server;
        var ct = TestContext.Current.CancellationToken;
        string sellerId;

        using (var setupScope = _factory.Services.CreateScope())
        {
            var sellers = setupScope.ServiceProvider.GetRequiredService<ISellerRepository>();
            var blocks = setupScope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
            var articles = setupScope.ServiceProvider.GetRequiredService<IArticleRepository>();

            var seller = Seller.Register("Ben", "Beispiel", null, "76133", "Karlsruhe",
                "0721 12345", $"{Guid.NewGuid()}@example.com", "t0000001", "hashed");
            await sellers.AddAsync(seller, ct);
            sellerId = seller.Id;

            var block = NumberBlock.Assign(sellerId, 9101, 10, Now);
            await blocks.AddAsync(block, ct);

            var article = Article.Create(sellerId, 9101, "Body", "H&M", "Bodys", 3.00m, null, null, null, Now);
            await articles.CreateAsync(article, newBlock: null, ct);
        }

        using (var deleteScope = _factory.Services.CreateScope())
        {
            var cascadeDeleter = deleteScope.ServiceProvider.GetRequiredService<ISellerCascadeDeleter>();

            await cascadeDeleter.DeleteAsync(sellerId, (_, _) => Task.CompletedTask, ct);
        }

        using (var verifyScope = _factory.Services.CreateScope())
        {
            var sellers = verifyScope.ServiceProvider.GetRequiredService<ISellerRepository>();
            var blocks = verifyScope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
            var articles = verifyScope.ServiceProvider.GetRequiredService<IArticleRepository>();

            Assert.Null(await sellers.GetByIdAsync(sellerId, ct));
            Assert.Equal(0, await articles.CountForSellerAsync(sellerId, ct));
            Assert.Empty(await blocks.GetForSellerAsync(sellerId, ct));
        }
    }
}

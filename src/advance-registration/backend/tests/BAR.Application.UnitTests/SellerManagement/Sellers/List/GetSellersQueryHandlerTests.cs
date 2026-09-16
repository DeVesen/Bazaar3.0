using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.SellerManagement.Application.Sellers.List;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Sellers.List;

/// <summary>
/// GetSellersQueryHandler no longer joins via SQL (ISellerListQuery is gone),
/// but composes in memory via IMasterDataModuleApi/IRegistrationModuleApi -
/// see the handler's comment. These tests therefore mock the three building
/// blocks instead of a single query port.
/// </summary>
public class GetSellersQueryHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();

    private GetSellersQueryHandler CreateHandler() => new(_sellers.Object, _masterData.Object, _registration.Object);

    private static Seller MakeSeller(string firstName, string lastName, string sellerTypeId = "t1", string city = "Karlsruhe") =>
        Seller.CreateByAdmin(firstName, lastName, null, "76133", city, "0721 1", $"{firstName}.{lastName}@example.com".ToLowerInvariant(), sellerTypeId, false);

    private void SetUpDefaults(IReadOnlyList<Seller> all, IReadOnlyDictionary<string, SellerBlockSummaryDto>? summaries = null, int totalAdmins = 5)
    {
        _sellers.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(all);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(totalAdmins);
        foreach (var typeId in all.Select(s => s.SellerTypeId).Distinct())
        {
            _masterData.Setup(t => t.GetSellerTypeConditionsAsync(typeId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SellerTypeConditionsDto(typeId, "Standard", 15m, 0.5m));
        }

        _registration.Setup(a => a.GetBlockSummariesForSellersAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(summaries ?? new Dictionary<string, SellerBlockSummaryDto>());
    }

    private static GetSellersQuery Query(string? search = null, string? sellerTypeId = null, int page = 1, int pageSize = 25, string requestingSellerId = "requester", params SellerSortDto[] sort) =>
        new(sellerTypeId, search, page, pageSize, sort, requestingSellerId);

    [Fact]
    public async Task HandleAsync_SearchTermMatchesLastName_FiltersOutNonMatches()
    {
        var anna = MakeSeller("Anna", "Beispiel");
        var ben = MakeSeller("Ben", "Muster");
        SetUpDefaults([anna, ben]);

        var result = await CreateHandler().HandleAsync(Query(search: "beispiel"), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].FirstName);
    }

    [Fact]
    public async Task HandleAsync_SellerTypeIdGiven_FiltersOutOtherTypes()
    {
        var anna = MakeSeller("Anna", "Beispiel", sellerTypeId: "t1");
        var ben = MakeSeller("Ben", "Muster", sellerTypeId: "t2");
        SetUpDefaults([anna, ben]);

        var result = await CreateHandler().HandleAsync(Query(sellerTypeId: "t2"), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Ben", result.Items[0].FirstName);
    }

    [Fact]
    public async Task HandleAsync_SearchTermMatchesCityOrEmail_IncludesThoseSellers()
    {
        var anna = MakeSeller("Anna", "Beispiel", city: "Ettlingen");
        var ben = MakeSeller("Ben", "Muster", city: "Karlsruhe");
        SetUpDefaults([anna, ben]);

        var result = await CreateHandler().HandleAsync(Query(search: "ettlingen"), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].FirstName);
    }

    [Fact]
    public async Task HandleAsync_NoSortGiven_DefaultsToLastNameAscending()
    {
        var ben = MakeSeller("Ben", "Zeta");
        var anna = MakeSeller("Anna", "Alpha");
        SetUpDefaults([ben, anna]);

        var result = await CreateHandler().HandleAsync(Query(), TestContext.Current.CancellationToken);

        Assert.Equal("Alpha", result.Items[0].LastName);
        Assert.Equal("Zeta", result.Items[1].LastName);
    }

    [Fact]
    public async Task HandleAsync_SortByArticleCountDescending_OrdersByEnrichedCount()
    {
        var anna = MakeSeller("Anna", "Beispiel");
        var ben = MakeSeller("Ben", "Muster");
        var summaries = new Dictionary<string, SellerBlockSummaryDto>
        {
            [anna.Id] = new(101, 2),
            [ben.Id] = new(201, 9)
        };
        SetUpDefaults([anna, ben], summaries);

        var result = await CreateHandler().HandleAsync(
            Query(sort: new SellerSortDto("articleCount", Descending: true)), TestContext.Current.CancellationToken);

        Assert.Equal("Ben", result.Items[0].FirstName);
        Assert.Equal(9, result.Items[0].ArticleCount);
    }

    [Fact]
    public async Task HandleAsync_SortByStartNumberAscending_OrdersByEnrichedStartNumber()
    {
        var anna = MakeSeller("Anna", "Beispiel");
        var ben = MakeSeller("Ben", "Muster");
        var summaries = new Dictionary<string, SellerBlockSummaryDto>
        {
            [anna.Id] = new(201, 0),
            [ben.Id] = new(101, 0)
        };
        SetUpDefaults([anna, ben], summaries);

        var result = await CreateHandler().HandleAsync(
            Query(sort: new SellerSortDto("startNumber", Descending: false)), TestContext.Current.CancellationToken);

        Assert.Equal("Ben", result.Items[0].FirstName);
        Assert.Equal(101, result.Items[0].StartNumber);
    }

    [Fact]
    public async Task HandleAsync_PageSizeSmallerThanTotal_ReturnsOnlyRequestedPageButFullTotalCount()
    {
        var sellers = Enumerable.Range(1, 5).Select(i => MakeSeller($"F{i}", $"L{i}")).ToList<Seller>();
        SetUpDefaults(sellers);

        var result = await CreateHandler().HandleAsync(Query(page: 2, pageSize: 2), TestContext.Current.CancellationToken);

        Assert.Equal(5, result.TotalCount);
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.Page);
        Assert.Equal(2, result.PageSize);
    }

    [Fact]
    public async Task HandleAsync_SellerTypeConditionsUnresolvable_ExcludesThatSellerFromResult()
    {
        var anna = MakeSeller("Anna", "Beispiel", sellerTypeId: "unknown");
        _sellers.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([anna]);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("unknown", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerTypeConditionsDto?)null);
        _registration.Setup(a => a.GetBlockSummariesForSellersAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerBlockSummaryDto>());

        var result = await CreateHandler().HandleAsync(Query(), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.TotalCount);
    }

    [Fact]
    public async Task HandleAsync_RowIsRequestingSeller_CanDeleteIsFalse()
    {
        var anna = MakeSeller("Anna", "Beispiel");
        SetUpDefaults([anna], totalAdmins: 5);

        var result = await CreateHandler().HandleAsync(
            Query(requestingSellerId: anna.Id), TestContext.Current.CancellationToken);

        Assert.False(result.Items[0].CanDelete);
    }

    [Fact]
    public async Task HandleAsync_RowIsLastRemainingAdmin_CanDeleteIsFalse()
    {
        var anna = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t1", isAdmin: true);
        SetUpDefaults([anna], totalAdmins: 1);

        var result = await CreateHandler().HandleAsync(
            Query(requestingSellerId: "someone-else"), TestContext.Current.CancellationToken);

        Assert.False(result.Items[0].CanDelete);
    }

    [Fact]
    public async Task HandleAsync_RowIsAdminButNotLastOne_CanDeleteIsTrue()
    {
        var anna = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t1", isAdmin: true);
        SetUpDefaults([anna], totalAdmins: 2);

        var result = await CreateHandler().HandleAsync(
            Query(requestingSellerId: "someone-else"), TestContext.Current.CancellationToken);

        Assert.True(result.Items[0].CanDelete);
    }
}

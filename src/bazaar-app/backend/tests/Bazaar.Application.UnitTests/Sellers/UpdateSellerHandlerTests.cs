using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class UpdateSellerHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private UpdateSellerHandler CreateSut() => new(_sellerRepository.Object);

    private static Seller CreateSeller(decimal salesCommission = 10m, decimal feePerItem = 0.5m) =>
        Seller.Create(
            "SELLER001", "Anna", "Meier", null, null, null, null,
            "anna@example.org", "SELLERTYPE001", salesCommission, feePerItem);

    private static UpdateSellerCommand CreateCommand(
        decimal salesCommission = 10m, decimal feePerItem = 0.5m, bool callerIsAdmin = false) => new()
    {
        Id = "SELLER001",
        FirstName = "Anna",
        LastName = "Meier",
        Email = "anna@example.org",
        SellerTypeId = "SELLERTYPE001",
        SalesCommission = salesCommission,
        FeePerItem = feePerItem,
        CallerIsAdmin = callerIsAdmin
    };

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(CreateCommand()));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_SellerAlreadySettled_ThrowsConflictWithSettlementLockedCode_RegardlessOfCaller()
    {
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(CreateCommand(callerIsAdmin: true)));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NonAdminChangesConditions_ThrowsForbiddenWithConditionsAdminOnlyCode()
    {
        var seller = CreateSeller(salesCommission: 10m, feePerItem: 0.5m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ForbiddenException>(() => sut.Handle(
            CreateCommand(salesCommission: 15m, feePerItem: 0.5m, callerIsAdmin: false)));

        Assert.Equal("seller.conditions_admin_only", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NonAdminEchoesUnchangedConditions_DoesNotThrowAndUpdatesDetailsOnly()
    {
        var seller = CreateSeller(salesCommission: 10m, feePerItem: 0.5m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        await sut.Handle(CreateCommand(salesCommission: 10m, feePerItem: 0.5m, callerIsAdmin: false));

        Assert.Equal(10m, seller.SalesCommission);
        Assert.Equal(0.5m, seller.FeePerItem);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }

    [Fact]
    public async Task Handle_AdminChangesConditions_AppliesNewConditionsAndDetails()
    {
        var seller = CreateSeller(salesCommission: 10m, feePerItem: 0.5m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var command = CreateCommand(salesCommission: 15m, feePerItem: 1m, callerIsAdmin: true);
        command.FirstName = "Anna-Lena";
        await sut.Handle(command);

        Assert.Equal("Anna-Lena", seller.FirstName);
        Assert.Equal(15m, seller.SalesCommission);
        Assert.Equal(1m, seller.FeePerItem);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }
}

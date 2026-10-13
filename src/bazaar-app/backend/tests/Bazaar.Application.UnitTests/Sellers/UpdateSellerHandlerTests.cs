using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class UpdateSellerHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();

    private UpdateSellerHandler CreateSut() => new(_sellerRepository.Object, _sellerTypeRepository.Object);

    private static Seller CreateSeller(decimal salesCommission = 10m, decimal feePerItem = 0.5m) =>
        Seller.Create(
            "SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null,
            "anna@example.org", "SELLERTYPE001", salesCommission, feePerItem);

    private static UpdateSellerCommand CreateCommand(
        decimal salesCommission = 10m, decimal feePerItem = 0.5m, bool callerIsAdmin = false) => new()
    {
        Id = "SELLER001",
        FirstName = "Anna",
        LastName = "Meier",
        Email = "anna@example.org",
        City = "Karlsruhe",
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

    [Fact]
    public async Task Handle_NonAdminChangesType_DerivesConditionsFromNewTypeAndDoesNotThrow()
    {
        var seller = CreateSeller(salesCommission: 10m, feePerItem: 0.5m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var newType = SellerType.Create("SELLERTYPE002", "Verein", 20m, 1.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE002")).ReturnsAsync(newType);
        var sut = CreateSut();

        var command = CreateCommand(callerIsAdmin: false);
        command.SellerTypeId = "SELLERTYPE002";
        // Non-admin still echoes the old values in the request body (frontend habit) —
        // the type change must win over them regardless.
        command.SalesCommission = seller.SalesCommission;
        command.FeePerItem = seller.FeePerItem;

        await sut.Handle(command);

        Assert.Equal("SELLERTYPE002", seller.SellerTypeId);
        Assert.Equal(20m, seller.SalesCommission);
        Assert.Equal(1.5m, seller.FeePerItem);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }

    [Fact]
    public async Task Handle_AdminChangesTypeWithExplicitConditionsInSameRequest_TypeChangeWinsOverManualValues()
    {
        var seller = CreateSeller(salesCommission: 10m, feePerItem: 0.5m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var newType = SellerType.Create("SELLERTYPE002", "Verein", 20m, 1.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE002")).ReturnsAsync(newType);
        var sut = CreateSut();

        // Admin sends a type change AND explicit, different manual conditions in the same
        // request — per api/sellers.md §4 ("Typwechsel überschreibt die Konditionen ...
        // auch manuell gesetzte"), the type's own values must win, not the manual ones.
        var command = CreateCommand(salesCommission: 99m, feePerItem: 9m, callerIsAdmin: true);
        command.SellerTypeId = "SELLERTYPE002";

        await sut.Handle(command);

        Assert.Equal("SELLERTYPE002", seller.SellerTypeId);
        Assert.Equal(20m, seller.SalesCommission);
        Assert.Equal(1.5m, seller.FeePerItem);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }

    [Fact]
    public async Task Handle_TypeChangedToUnknownType_ThrowsNotFoundWithSellerTypeNotFoundCode()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _sellerTypeRepository.Setup(r => r.GetById("UNKNOWN")).ReturnsAsync((SellerType?)null);
        var sut = CreateSut();

        var command = CreateCommand(callerIsAdmin: true);
        command.SellerTypeId = "UNKNOWN";

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(command));

        Assert.Equal("seller_type.not_found", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
    }
}

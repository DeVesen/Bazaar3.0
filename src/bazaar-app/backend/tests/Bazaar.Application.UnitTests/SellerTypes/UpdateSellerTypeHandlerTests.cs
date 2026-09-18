using Bazaar.Application.SellerTypes;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.SellerTypes;

public class UpdateSellerTypeHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();

    private UpdateSellerTypeHandler CreateSut() =>
        new(_sellerTypeRepository.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerTypeNotFoundCode()
    {
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync((SellerType?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(
            new UpdateSellerTypeCommand { Id = "SELLERTYPE001", Name = "Standard", CommissionRate = 10m, ItemFee = 0.5m }));

        Assert.Equal("seller_type.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_RenameToExistingDifferentSellerTypeName_ThrowsConflictWithNameTakenCode()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerTypeRepository.Setup(r => r.ExistsByNameIgnoreCase("Premium")).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateSellerTypeCommand { Id = "SELLERTYPE001", Name = "Premium", CommissionRate = 10m, ItemFee = 0.5m }));

        Assert.Equal("seller_type.name_taken", exception.ErrorCode);
        _sellerTypeRepository.Verify(r => r.Update(It.IsAny<SellerType>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RenameToSameNameDifferentCase_DoesNotThrowSelfCollisionGuard()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        var sut = CreateSut();

        await sut.Handle(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = "STANDARD", CommissionRate = 12m, ItemFee = 0.75m });

        _sellerTypeRepository.Verify(r => r.ExistsByNameIgnoreCase(It.IsAny<string>()), Times.Never);
        _sellerTypeRepository.Verify(r => r.Update(sellerType), Times.Once);
    }

    [Fact]
    public async Task Handle_SuccessfulUpdate_UpdatesFieldsAndCallsRepositoryUpdate()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerTypeRepository.Setup(r => r.ExistsByNameIgnoreCase("Premium")).ReturnsAsync(false);
        var sut = CreateSut();

        await sut.Handle(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = " Premium ", CommissionRate = 20m, ItemFee = 1.5m });

        Assert.Equal("Premium", sellerType.Name);
        Assert.Equal(20m, sellerType.CommissionRate);
        Assert.Equal(1.5m, sellerType.ItemFee);
        _sellerTypeRepository.Verify(r => r.Update(sellerType), Times.Once);
    }
}

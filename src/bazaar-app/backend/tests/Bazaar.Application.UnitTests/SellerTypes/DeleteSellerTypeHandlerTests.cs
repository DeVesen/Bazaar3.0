using Bazaar.Application.SellerTypes;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Moq;

using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.SellerTypes;

public class DeleteSellerTypeHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();
    private readonly Mock<ISellerCountBySellerTypeQuery> _sellerCountQuery = new();
    private readonly Mock<ISettingsRepository> _settingsRepository = new();
    private readonly SettingsAggregate _settings = SettingsAggregate.Create(3000);

    public DeleteSellerTypeHandlerTests()
    {
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(_settings);
    }

    private DeleteSellerTypeHandler CreateSut() =>
        new(_sellerTypeRepository.Object, _sellerCountQuery.Object, _settingsRepository.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerTypeNotFoundCode()
    {
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync((SellerType?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLERTYPE001"));

        Assert.Equal("seller_type.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NoSellersAssigned_RemovesSellerType()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE001")).ReturnsAsync(0);
        var sut = CreateSut();

        await sut.Handle("SELLERTYPE001");

        _sellerTypeRepository.Verify(r => r.Remove(sellerType), Times.Once);
    }

    [Fact]
    public async Task Handle_SellersStillAssigned_ThrowsConflictAndDoesNotRemove()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE001")).ReturnsAsync(5);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("SELLERTYPE001"));

        Assert.Equal("seller_type.in_use", exception.ErrorCode);
        _sellerTypeRepository.Verify(r => r.Remove(It.IsAny<SellerType>()), Times.Never);
    }

    [Fact]
    public async Task Handle_TypeIsDefaultSellerType_RemovesTypeAndClearsDefault()
    {
        // Arrange
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE001")).ReturnsAsync(0);
        _settings.ChangeDefaultSellerType("SELLERTYPE001");
        var sut = CreateSut();

        // Act
        await sut.Handle("SELLERTYPE001");

        // Assert
        _sellerTypeRepository.Verify(r => r.Remove(sellerType), Times.Once);
        Assert.Null(_settings.DefaultSellerTypeId);
        _settingsRepository.Verify(r => r.Update(_settings), Times.Once);
    }

    [Fact]
    public async Task Handle_TypeIsNotDefaultSellerType_KeepsDefaultAndDoesNotUpdateSettings()
    {
        // Arrange
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE001")).ReturnsAsync(0);
        _settings.ChangeDefaultSellerType("SELLERTYPE002");
        var sut = CreateSut();

        // Act
        await sut.Handle("SELLERTYPE001");

        // Assert
        Assert.Equal("SELLERTYPE002", _settings.DefaultSellerTypeId);
        _settingsRepository.Verify(r => r.Update(It.IsAny<SettingsAggregate>()), Times.Never);
    }
}

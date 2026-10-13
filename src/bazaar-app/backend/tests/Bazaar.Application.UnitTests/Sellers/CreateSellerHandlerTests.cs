using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class CreateSellerHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private CreateSellerHandler CreateSut() =>
        new(_sellerRepository.Object, _sellerTypeRepository.Object, _idGenerator.Object);

    [Fact]
    public async Task Handle_KnownSellerType_CopiesConditionsFromSellerTypeAndAddsSeller()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _idGenerator.Setup(g => g.Generate()).Returns("SELLER001");
        var sut = CreateSut();

        var seller = await sut.Handle(new CreateSellerCommand
        {
            FirstName = "Anna",
            LastName = "Meier",
            Email = "anna@example.org",
            SellerTypeId = "SELLERTYPE001",
            Address = "Hauptstraße 1",
            PostalCode = "76133",
            City = "Karlsruhe",
            Phone = "0123456"
        });

        Assert.Equal("SELLER001", seller.Id);
        Assert.Equal("Anna", seller.FirstName);
        Assert.Equal("Meier", seller.LastName);
        Assert.Equal(10m, seller.SalesCommission);
        Assert.Equal(0.5m, seller.FeePerItem);
        Assert.Equal(0m, seller.IntakeFeePaid);
        Assert.Null(seller.SettledAt);
        Assert.Null(seller.PayoutAmount);
        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001")), Times.Once);
    }

    [Fact]
    public async Task Handle_CommandWithoutEmail_AddsSellerWithoutEmailAndWithConditionsFromSellerType()
    {
        var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
        _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
        _idGenerator.Setup(g => g.Generate()).Returns("SELLER001");
        var sut = CreateSut();

        var seller = await sut.Handle(new CreateSellerCommand
        {
            FirstName = "Anna",
            LastName = "Meier",
            City = "Karlsruhe",
            SellerTypeId = "SELLERTYPE001"
        });

        Assert.Null(seller.Email);
        Assert.Equal(10m, seller.SalesCommission);
        Assert.Equal(0.5m, seller.FeePerItem);
        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001")), Times.Once);
    }

    [Fact]
    public async Task Handle_UnknownSellerType_ThrowsNotFoundWithSellerTypeNotFoundCode()
    {
        _sellerTypeRepository.Setup(r => r.GetById("MISSING")).ReturnsAsync((SellerType?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(new CreateSellerCommand
        {
            FirstName = "Anna",
            LastName = "Meier",
            Email = "anna@example.org",
            SellerTypeId = "MISSING"
        }));

        Assert.Equal("seller_type.not_found", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Add(It.IsAny<Seller>()), Times.Never);
    }
}

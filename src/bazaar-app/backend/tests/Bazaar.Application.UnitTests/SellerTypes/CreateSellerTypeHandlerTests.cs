using Bazaar.Application.SellerTypes;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.SellerTypes;

public class CreateSellerTypeHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private CreateSellerTypeHandler CreateSut() =>
        new(_sellerTypeRepository.Object, _idGenerator.Object);

    [Fact]
    public async Task Handle_NameAvailable_TrimsNameAddsSellerType()
    {
        _sellerTypeRepository.Setup(r => r.ExistsByNameIgnoreCase("Standard")).ReturnsAsync(false);
        _idGenerator.Setup(g => g.Generate()).Returns("SELLERTYPE001");
        var sut = CreateSut();

        var sellerType = await sut.Handle(
            new CreateSellerTypeCommand { Name = "  Standard  ", CommissionRate = 10m, ItemFee = 0.5m });

        Assert.Equal("SELLERTYPE001", sellerType.Id);
        Assert.Equal("Standard", sellerType.Name);
        Assert.Equal(10m, sellerType.CommissionRate);
        Assert.Equal(0.5m, sellerType.ItemFee);
        _sellerTypeRepository.Verify(
            r => r.Add(It.Is<SellerType>(s => s.Id == "SELLERTYPE001" && s.Name == "Standard")), Times.Once);
    }

    [Theory]
    [InlineData("Standard")]
    [InlineData("STANDARD")]
    [InlineData("  standard  ")]
    public async Task Handle_DuplicateName_ThrowsConflictWithNameTakenCode(string name)
    {
        _sellerTypeRepository.Setup(r => r.ExistsByNameIgnoreCase(name.Trim())).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new CreateSellerTypeCommand { Name = name, CommissionRate = 10m, ItemFee = 0.5m }));

        Assert.Equal("seller_type.name_taken", exception.ErrorCode);
        _sellerTypeRepository.Verify(r => r.Add(It.IsAny<SellerType>()), Times.Never);
    }
}

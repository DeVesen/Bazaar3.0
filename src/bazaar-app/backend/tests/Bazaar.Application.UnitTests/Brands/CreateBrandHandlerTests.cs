using Bazaar.Application.Brands;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Brands;

public class CreateBrandHandlerTests
{
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private CreateBrandHandler CreateSut() =>
        new(_brandRepository.Object, _idGenerator.Object);

    [Fact]
    public async Task Handle_NameAvailable_TrimsNameAddsBrandWithGivenOriginal()
    {
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Adidas")).ReturnsAsync(false);
        _idGenerator.Setup(g => g.Generate()).Returns("BRAND001");
        var sut = CreateSut();

        var brand = await sut.Handle(new CreateBrandCommand { Name = "  Adidas  ", Original = true });

        Assert.Equal("BRAND001", brand.Id);
        Assert.Equal("Adidas", brand.Name);
        Assert.True(brand.Original);
        _brandRepository.Verify(r => r.Add(It.Is<Brand>(b => b.Id == "BRAND001" && b.Name == "Adidas")), Times.Once);
    }

    [Theory]
    [InlineData("Adidas")]
    [InlineData("ADIDAS")]
    [InlineData("  adidas  ")]
    public async Task Handle_DuplicateName_ThrowsConflictWithNameTakenCode(string name)
    {
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase(name.Trim())).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new CreateBrandCommand { Name = name, Original = false }));

        Assert.Equal("brand.name_taken", exception.ErrorCode);
        _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
    }
}

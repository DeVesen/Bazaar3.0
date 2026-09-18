using Bazaar.Application.Brands;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Brands;

public class GetBrandsHandlerTests
{
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<IBrandArticleLink> _brandArticleLink = new();

    private GetBrandsHandler CreateSut() =>
        new(_brandRepository.Object, _brandArticleLink.Object);

    [Fact]
    public async Task Handle_ReturnsBrandsSortedByNameWithArticleCountPopulated()
    {
        var nike = Brand.Create("BRAND002", "Nike", original: false);
        var adidas = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetAll()).ReturnsAsync([nike, adidas]);
        _brandArticleLink.Setup(l => l.CountByBrandName("Adidas")).ReturnsAsync(3);
        _brandArticleLink.Setup(l => l.CountByBrandName("Nike")).ReturnsAsync(5);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(2, result.Count);
        Assert.Equal(new BrandListItem("BRAND001", "Adidas", true, 3), result[0]);
        Assert.Equal(new BrandListItem("BRAND002", "Nike", false, 5), result[1]);
    }
}

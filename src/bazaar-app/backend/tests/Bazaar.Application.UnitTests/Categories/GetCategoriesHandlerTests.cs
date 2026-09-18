using Bazaar.Application.Categories;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Categories;

public class GetCategoriesHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<ICategoryArticleLink> _categoryArticleLink = new();

    private GetCategoriesHandler CreateSut() =>
        new(_categoryRepository.Object, _categoryArticleLink.Object);

    [Fact]
    public async Task Handle_ReturnsCategoriesSortedByNameWithArticleCountPopulated()
    {
        var toys = Category.Create("CATEGORY002", "Spielzeug", original: false);
        var books = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync([toys, books]);
        _categoryArticleLink.Setup(l => l.CountByCategoryName("Bücher")).ReturnsAsync(3);
        _categoryArticleLink.Setup(l => l.CountByCategoryName("Spielzeug")).ReturnsAsync(5);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(2, result.Count);
        Assert.Equal(new CategoryListItem("CATEGORY001", "Bücher", true, 3), result[0]);
        Assert.Equal(new CategoryListItem("CATEGORY002", "Spielzeug", false, 5), result[1]);
    }
}

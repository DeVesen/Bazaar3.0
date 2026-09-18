using Bazaar.Application.Categories;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Categories;

public class DeleteCategoryHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<ICategoryArticleLink> _categoryArticleLink = new();

    private DeleteCategoryHandler CreateSut() =>
        new(_categoryRepository.Object, _categoryArticleLink.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithCategoryNotFoundCode()
    {
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync((Category?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("CATEGORY001"));

        Assert.Equal("category.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NoArticlesReference_RemovesCategory()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        _categoryArticleLink.Setup(l => l.CountByCategoryName("Bücher")).ReturnsAsync(0);
        var sut = CreateSut();

        await sut.Handle("CATEGORY001");

        _categoryRepository.Verify(r => r.Remove(category), Times.Once);
    }

    /// <summary>
    /// This branch is structurally correct but unreachable in Round-12 via the real
    /// (placeholder) ICategoryArticleLink, which always returns 0 for CountByCategoryName —
    /// Round-15 wires the real Articles table and makes this branch reachable. The mock
    /// here proves the handler logic ahead of that.
    /// </summary>
    [Fact]
    public async Task Handle_ArticlesStillReferenceCategory_ThrowsConflictAndDoesNotRemove_UnreachableUntilRound15()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        _categoryArticleLink.Setup(l => l.CountByCategoryName("Bücher")).ReturnsAsync(2);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("CATEGORY001"));

        Assert.Equal("category.in_use", exception.ErrorCode);
        _categoryRepository.Verify(r => r.Remove(It.IsAny<Category>()), Times.Never);
    }
}

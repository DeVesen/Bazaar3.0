using Bazaar.Application.Categories;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Categories;

public class UpdateCategoryHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<ICategoryArticleLink> _categoryArticleLink = new();

    private UpdateCategoryHandler CreateSut() =>
        new(_categoryRepository.Object, _categoryArticleLink.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithCategoryNotFoundCode()
    {
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync((Category?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(
            new UpdateCategoryCommand { Id = "CATEGORY001", Name = "Bücher", Original = true }));

        Assert.Equal("category.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_RenameToExistingDifferentCategoryName_ThrowsConflictWithNameTakenCode()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Spielzeug")).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateCategoryCommand { Id = "CATEGORY001", Name = "Spielzeug", Original = true }));

        Assert.Equal("category.name_taken", exception.ErrorCode);
        _categoryRepository.Verify(r => r.Update(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RenameToSameNameDifferentCase_DoesNotThrowSelfCollisionGuard()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        var sut = CreateSut();

        await sut.Handle(new UpdateCategoryCommand { Id = "CATEGORY001", Name = "BÜCHER", Original = false });

        _categoryRepository.Verify(r => r.ExistsByNameIgnoreCase(It.IsAny<string>()), Times.Never);
        _categoryRepository.Verify(r => r.Update(category), Times.Once);
        _categoryArticleLink.Verify(
            l => l.RenameArticlesReferencingCategory(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SuccessfulRename_UpdatesNameAndOriginalAndCallsUpdate()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Spielzeug")).ReturnsAsync(false);
        var sut = CreateSut();

        await sut.Handle(new UpdateCategoryCommand { Id = "CATEGORY001", Name = " Spielzeug ", Original = false });

        Assert.Equal("Spielzeug", category.Name);
        Assert.False(category.Original);
        _categoryRepository.Verify(r => r.Update(category), Times.Once);
    }

    [Fact]
    public async Task Handle_ActuallyChangedName_CallsRenameArticlesReferencingCategoryOnce()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Spielzeug")).ReturnsAsync(false);
        var sut = CreateSut();

        await sut.Handle(new UpdateCategoryCommand { Id = "CATEGORY001", Name = "Spielzeug", Original = true });

        _categoryArticleLink.Verify(l => l.RenameArticlesReferencingCategory("Bücher", "Spielzeug"), Times.Once);
    }

    [Fact]
    public async Task Handle_NameUnchanged_DoesNotCallRenameArticlesReferencingCategory()
    {
        var category = Category.Create("CATEGORY001", "Bücher", original: true);
        _categoryRepository.Setup(r => r.GetById("CATEGORY001")).ReturnsAsync(category);
        var sut = CreateSut();

        await sut.Handle(new UpdateCategoryCommand { Id = "CATEGORY001", Name = "Bücher", Original = false });

        _categoryArticleLink.Verify(
            l => l.RenameArticlesReferencingCategory(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}

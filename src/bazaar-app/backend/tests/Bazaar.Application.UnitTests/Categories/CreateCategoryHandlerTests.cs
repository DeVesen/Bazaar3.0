using Bazaar.Application.Categories;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Categories;

public class CreateCategoryHandlerTests
{
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private CreateCategoryHandler CreateSut() =>
        new(_categoryRepository.Object, _idGenerator.Object);

    [Fact]
    public async Task Handle_NameAvailable_TrimsNameAddsCategoryWithGivenOriginal()
    {
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Bücher")).ReturnsAsync(false);
        _idGenerator.Setup(g => g.Generate()).Returns("CATEGORY001");
        var sut = CreateSut();

        var category = await sut.Handle(new CreateCategoryCommand { Name = "  Bücher  ", Original = true });

        Assert.Equal("CATEGORY001", category.Id);
        Assert.Equal("Bücher", category.Name);
        Assert.True(category.Original);
        _categoryRepository.Verify(
            r => r.Add(It.Is<Category>(c => c.Id == "CATEGORY001" && c.Name == "Bücher")), Times.Once);
    }

    [Theory]
    [InlineData("Bücher")]
    [InlineData("BÜCHER")]
    [InlineData("  bücher  ")]
    public async Task Handle_DuplicateName_ThrowsConflictWithNameTakenCode(string name)
    {
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase(name.Trim())).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new CreateCategoryCommand { Name = name, Original = false }));

        Assert.Equal("category.name_taken", exception.ErrorCode);
        _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }
}

using Bazaar.Application.Articles;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class GetNextArticleNumberHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();

    private GetNextArticleNumberHandler CreateSut() => new(_articleRepository.Object);

    [Fact]
    public async Task Handle_EmptyTable_ReturnsOne()
    {
        _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync((int?)null);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(1, result);
    }

    [Fact]
    public async Task Handle_TableWithData_ReturnsMaxPlusOne()
    {
        _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync(7);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(8, result);
    }

    [Fact]
    public async Task Handle_MaxNumberRaisedByRenumbering_ReturnsMaxPlusOne()
    {
        // Arrange
        _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync(9999);
        var sut = CreateSut();

        // Act
        var result = await sut.Handle();

        // Assert
        Assert.Equal(10000, result);
    }
}

using Bazaar.Application.Brands;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Brands;

public class DeleteBrandHandlerTests
{
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<IBrandArticleLink> _brandArticleLink = new();

    private DeleteBrandHandler CreateSut() =>
        new(_brandRepository.Object, _brandArticleLink.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithBrandNotFoundCode()
    {
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync((Brand?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("BRAND001"));

        Assert.Equal("brand.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NoArticlesReference_RemovesBrand()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        _brandArticleLink.Setup(l => l.CountByBrandName("Adidas")).ReturnsAsync(0);
        var sut = CreateSut();

        await sut.Handle("BRAND001");

        _brandRepository.Verify(r => r.Remove(brand), Times.Once);
    }

    /// <summary>
    /// This branch is structurally correct but unreachable in Round-11 via the real
    /// (placeholder) IBrandArticleLink, which always returns 0 for CountByBrandName —
    /// Round-15 wires the real Articles table and makes this branch reachable. The mock
    /// here proves the handler logic ahead of that.
    /// </summary>
    [Fact]
    public async Task Handle_ArticlesStillReferenceBrand_ThrowsConflictAndDoesNotRemove_UnreachableUntilRound15()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        _brandArticleLink.Setup(l => l.CountByBrandName("Adidas")).ReturnsAsync(2);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("BRAND001"));

        Assert.Equal("brand.in_use", exception.ErrorCode);
        _brandRepository.Verify(r => r.Remove(It.IsAny<Brand>()), Times.Never);
    }
}

using Bazaar.Application.Brands;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Brands;

public class UpdateBrandHandlerTests
{
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<IBrandArticleLink> _brandArticleLink = new();

    private UpdateBrandHandler CreateSut() =>
        new(_brandRepository.Object, _brandArticleLink.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithBrandNotFoundCode()
    {
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync((Brand?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(
            new UpdateBrandCommand { Id = "BRAND001", Name = "Adidas", Original = true }));

        Assert.Equal("brand.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_RenameToExistingDifferentBrandName_ThrowsConflictWithNameTakenCode()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Nike")).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateBrandCommand { Id = "BRAND001", Name = "Nike", Original = true }));

        Assert.Equal("brand.name_taken", exception.ErrorCode);
        _brandRepository.Verify(r => r.Update(It.IsAny<Brand>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RenameToSameNameDifferentCase_DoesNotThrowSelfCollisionGuard()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        var sut = CreateSut();

        await sut.Handle(new UpdateBrandCommand { Id = "BRAND001", Name = "ADIDAS", Original = false });

        _brandRepository.Verify(r => r.ExistsByNameIgnoreCase(It.IsAny<string>()), Times.Never);
        _brandRepository.Verify(r => r.Update(brand), Times.Once);
        _brandArticleLink.Verify(
            l => l.RenameArticlesReferencingBrand(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SuccessfulRename_UpdatesNameAndOriginalAndCallsUpdate()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Puma")).ReturnsAsync(false);
        var sut = CreateSut();

        await sut.Handle(new UpdateBrandCommand { Id = "BRAND001", Name = " Puma ", Original = false });

        Assert.Equal("Puma", brand.Name);
        Assert.False(brand.Original);
        _brandRepository.Verify(r => r.Update(brand), Times.Once);
    }

    [Fact]
    public async Task Handle_ActuallyChangedName_CallsRenameArticlesReferencingBrandOnce()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Puma")).ReturnsAsync(false);
        var sut = CreateSut();

        await sut.Handle(new UpdateBrandCommand { Id = "BRAND001", Name = "Puma", Original = true });

        _brandArticleLink.Verify(l => l.RenameArticlesReferencingBrand("Adidas", "Puma"), Times.Once);
    }

    [Fact]
    public async Task Handle_NameUnchanged_DoesNotCallRenameArticlesReferencingBrand()
    {
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        _brandRepository.Setup(r => r.GetById("BRAND001")).ReturnsAsync(brand);
        var sut = CreateSut();

        await sut.Handle(new UpdateBrandCommand { Id = "BRAND001", Name = "Adidas", Original = false });

        _brandArticleLink.Verify(
            l => l.RenameArticlesReferencingBrand(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}

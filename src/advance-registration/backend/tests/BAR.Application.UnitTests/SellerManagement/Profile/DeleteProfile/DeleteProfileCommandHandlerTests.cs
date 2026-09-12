using BAR.Modules.SellerManagement.Application.Profile.DeleteProfile;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Profile.DeleteProfile;

public class DeleteProfileCommandHandlerTests
{
    private readonly Mock<ISellerCascadeDeleter> _cascadeDeleter = new();

    private DeleteProfileCommandHandler CreateHandler() => new(_cascadeDeleter.Object);

    [Fact]
    public async Task HandleAsync_NonAdminSeller_CallsCascadeDeleterWithOwnId()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(seller.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(seller, ct));
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, TestContext.Current.CancellationToken);

        _cascadeDeleter.Verify(c => c.DeleteAsync(
            seller.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_AdminSeller_ThrowsForbidden()
    {
        var admin = Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", "admin@bazaar.local", "t1", true);
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(admin.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(admin, ct));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => handler.HandleAsync(admin.Id, TestContext.Current.CancellationToken));

        Assert.Equal("profile.admin_self_delete", ex.ErrorCode);
    }
}

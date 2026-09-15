using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

namespace BAR.Application.UnitTests.SellerManagement.Auth.BootstrapAdmin;

public class AdminBootstrapStateTests
{
    [Fact]
    public void HasAdmin_BeforeInitialize_IsFalse()
    {
        var state = new AdminBootstrapState();

        Assert.False(state.HasAdmin);
    }

    [Fact]
    public void Initialize_WithTrue_SetsHasAdmin()
    {
        var state = new AdminBootstrapState();

        state.Initialize(true);

        Assert.True(state.HasAdmin);
    }

    [Fact]
    public void MarkAdminCreated_AfterInitializeFalse_FlipsToTrue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(false);

        state.MarkAdminCreated();

        Assert.True(state.HasAdmin);
    }
}

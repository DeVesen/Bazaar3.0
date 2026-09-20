namespace Bazaar.Application.UnitTests.Auth;

using Bazaar.Application.Auth;

public class AdminBootstrapStateTests
{
    [Fact]
    public void HasAdmin_BeforeInitialize_IsFalse()
    {
        var state = new AdminBootstrapState();
        Assert.False(state.HasAdmin);
    }

    [Fact]
    public void Initialize_SetsHasAdminToGivenValue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(true);
        Assert.True(state.HasAdmin);
    }

    [Fact]
    public void MarkAdminCreated_SetsHasAdminToTrue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(false);
        state.MarkAdminCreated();
        Assert.True(state.HasAdmin);
    }
}

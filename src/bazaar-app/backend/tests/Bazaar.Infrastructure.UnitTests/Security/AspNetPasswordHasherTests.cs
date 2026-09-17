using Bazaar.Infrastructure.Security;

namespace Bazaar.Infrastructure.UnitTests.Security;

public class AspNetPasswordHasherTests
{
    private readonly AspNetPasswordHasher _sut = new();

    [Fact]
    public void Hash_then_verify_with_correct_password_returns_true()
    {
        var hash = _sut.Hash("correct-horse-battery-staple");

        var result = _sut.Verify(hash, "correct-horse-battery-staple");

        Assert.True(result);
    }

    [Fact]
    public void Verify_with_wrong_password_returns_false()
    {
        var hash = _sut.Hash("correct-horse-battery-staple");

        var result = _sut.Verify(hash, "wrong-password");

        Assert.False(result);
    }
}

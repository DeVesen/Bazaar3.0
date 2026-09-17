using System.Text.RegularExpressions;
using Bazaar.Infrastructure.Security;

namespace Bazaar.Infrastructure.UnitTests.Security;

public partial class NanoIdGeneratorTests
{
    private readonly NanoIdGenerator _sut = new();

    [Fact]
    public void Generate_returns_eight_character_string_from_expected_alphabet()
    {
        for (var i = 0; i < 100; i++)
        {
            var id = _sut.Generate();

            Assert.Equal(8, id.Length);
            Assert.Matches(AlphabetRegex(), id);
        }
    }

    [Fact]
    public void Generate_returns_different_values_across_calls()
    {
        var ids = Enumerable.Range(0, 50).Select(_ => _sut.Generate()).ToHashSet();

        Assert.True(ids.Count > 1);
    }

    [GeneratedRegex("^[0-9A-Za-z]{8}$")]
    private static partial Regex AlphabetRegex();
}

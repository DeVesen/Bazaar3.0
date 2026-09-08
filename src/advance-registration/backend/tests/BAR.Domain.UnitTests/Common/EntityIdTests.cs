using BAR.Domain.Common;

namespace BAR.Domain.UnitTests.Common;

public class EntityIdTests
{
    [Fact]
    public void New_Always_ReturnsEightAlphanumericCharacters()
    {
        // Arrange & Act
        var id = EntityId.New();

        // Assert
        id.Should().HaveLength(8);
        EntityId.IsValid(id).Should().BeTrue();
    }

    [Fact]
    public void New_CalledRepeatedly_ProducesDistinctValues()
    {
        // Arrange
        const int count = 1000;

        // Act
        var ids = Enumerable.Range(0, count).Select(_ => EntityId.New()).ToList();

        // Assert
        ids.Distinct().Should().HaveCount(count);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("short")]
    [InlineData("toolongvalue")]
    [InlineData("abcd-123")]
    public void IsValid_MalformedValue_ReturnsFalse(string? value)
    {
        // Act
        var result = EntityId.IsValid(value);

        // Assert
        result.Should().BeFalse();
    }
}

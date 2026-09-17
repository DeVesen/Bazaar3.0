using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Registration.NumberBlocks;

public class NumberBlockSequenceTests
{
    [Fact]
    public void AllNumbersOrdered_SingleBlock_ReturnsFullRange()
    {
        var block = NumberBlock.Assign("s1", 101, 5, DateTime.UtcNow);

        var result = NumberBlockSequence.AllNumbersOrdered([block]);

        Assert.Equal([101, 102, 103, 104, 105], result);
    }

    [Fact]
    public void AllNumbersOrdered_MultipleBlocksOutOfOrder_ReturnsAscendingAcrossBlocks()
    {
        var second = NumberBlock.Assign("s1", 201, 3, DateTime.UtcNow);
        var first = NumberBlock.Assign("s1", 101, 2, DateTime.UtcNow);

        var result = NumberBlockSequence.AllNumbersOrdered([second, first]);

        Assert.Equal([101, 102, 201, 202, 203], result);
    }

    [Fact]
    public void AllNumbersOrdered_NoBlocks_ReturnsEmpty()
    {
        Assert.Empty(NumberBlockSequence.AllNumbersOrdered([]));
    }
}

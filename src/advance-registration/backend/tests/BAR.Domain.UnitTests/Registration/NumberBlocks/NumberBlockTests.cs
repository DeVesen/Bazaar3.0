using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Registration.NumberBlocks;

public class NumberBlockTests
{
    [Fact]
    public void Assign_ValidRange_ComputesToNumberFromBlockSize()
    {
        var now = DateTime.UtcNow;
        var block = NumberBlock.Assign(sellerId: "a3f9c2d1", fromNumber: 101, blockSize: 10, assignedAtUtc: now);

        Assert.Equal(8, block.Id.Length);
        Assert.Equal(101, block.FromNumber);
        Assert.Equal(110, block.ToNumber);
        Assert.Equal(now, block.AssignedAt);
    }
}

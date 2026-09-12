using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Registration.NumberBlocks;

public class NumberBlockAllocatorTests
{
    [Fact]
    public void Allocate_NoExistingBlocks_StartsAtStartNumber()
    {
        var result = NumberBlockAllocator.Allocate(
            existingBlocks: [], sellerId: "a3f9c2d1", blockCount: 1,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Single(result);
        Assert.Equal(1, result[0].FromNumber);
        Assert.Equal(10, result[0].ToNumber);
    }

    [Fact]
    public void Allocate_MultipleBlocks_AreContiguous()
    {
        var result = NumberBlockAllocator.Allocate(
            existingBlocks: [], sellerId: "a3f9c2d1", blockCount: 2,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].FromNumber);
        Assert.Equal(10, result[0].ToNumber);
        Assert.Equal(11, result[1].FromNumber);
        Assert.Equal(20, result[1].ToNumber);
    }

    [Fact]
    public void Allocate_RangeOccupied_SkipsToNextFreeRange()
    {
        // Occupied: 1-10 and 21-30 -> the next free contiguous 2-block range (20 numbers) starts at 31.
        var occupied = new[]
        {
            NumberBlock.Assign("other1", 1, 10, DateTime.UtcNow),
            NumberBlock.Assign("other2", 21, 10, DateTime.UtcNow)
        };

        var result = NumberBlockAllocator.Allocate(
            existingBlocks: occupied, sellerId: "a3f9c2d1", blockCount: 2,
            startNumber: 1, blockSize: 10, nowUtc: DateTime.UtcNow);

        Assert.Equal(31, result[0].FromNumber);
    }

    [Fact]
    public void Allocate_AssignsToGivenSeller()
    {
        var result = NumberBlockAllocator.Allocate([], "a3f9c2d1", 1, 1, 10, DateTime.UtcNow);

        Assert.Equal("a3f9c2d1", result[0].SellerId);
    }

    [Fact]
    public void Allocate_NoFreeRangeAvailable_ThrowsConflictExceptionWithBlockNoFreeRangeCode()
    {
        var occupied = new[] { NumberBlock.Assign("other", 1, int.MaxValue - 1, DateTime.UtcNow) };

        var ex = Assert.Throws<NoFreeRangeException>(() =>
            NumberBlockAllocator.Allocate(occupied, "a3f9c2d1", 1, 1, 10, DateTime.UtcNow));

        var domainException = Assert.IsAssignableFrom<BAR.SharedKernel.Exceptions.ConflictException>(ex);
        Assert.Equal("block.no_free_range", domainException.ErrorCode);
    }
}

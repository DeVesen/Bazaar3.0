using System.Text.Json;
using Bazaar.Api.Features.Settlement;

namespace Bazaar.Api.UnitTests.Features.Settlement;

/// <summary>
/// Round-20 Task 4: proves the GET /api/sellers/{id}/settlement response DTO
/// serializes to the exact shape required by docs/requirements/bazaar-app/api/settlement.md
/// (camelCase, nested "seller" object) - mirrors ValidationFilterTests' approach of
/// asserting the actual serialized JSON rather than just the C# record shape, since
/// minimal API endpoints can't be unit-invoked directly without a full host.
/// </summary>
public class SettlementEndpointsTests
{
    private static readonly JsonSerializerOptions WebDefaults = new(JsonSerializerDefaults.Web);

    [Fact]
    public void SellerSettlementDto_Serializes_ToSpecShape()
    {
        var dto = new SellerSettlementDto(
            new SellerSettlementSellerDto("a3f9c2d1", "Anna", "Meier", "…", "…", "…"),
            OpenCount: 0,
            SoldCount: 31,
            ReturnedCount: 9,
            Revenue: 380.50m,
            CommissionRate: 12.5m,
            Commission: 47.56m,
            Payout: 332.94m,
            IntakeFeePaid: 20.00m,
            NotDeliveredCount: 10,
            SettledAt: null,
            PayoutAmount: null,
            CanSettle: true);

        var json = JsonSerializer.Serialize(dto, WebDefaults);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        var seller = root.GetProperty("seller");
        Assert.Equal("a3f9c2d1", seller.GetProperty("id").GetString());
        Assert.Equal("Anna", seller.GetProperty("firstName").GetString());
        Assert.Equal("Meier", seller.GetProperty("lastName").GetString());
        Assert.Equal("…", seller.GetProperty("postalCode").GetString());
        Assert.Equal("…", seller.GetProperty("city").GetString());

        Assert.Equal(0, root.GetProperty("openCount").GetInt32());
        Assert.Equal(31, root.GetProperty("soldCount").GetInt32());
        Assert.Equal(9, root.GetProperty("returnedCount").GetInt32());
        Assert.Equal(380.50m, root.GetProperty("revenue").GetDecimal());
        Assert.Equal(12.5m, root.GetProperty("commissionRate").GetDecimal());
        Assert.Equal(47.56m, root.GetProperty("commission").GetDecimal());
        Assert.Equal(332.94m, root.GetProperty("payout").GetDecimal());
        Assert.Equal(20.00m, root.GetProperty("intakeFeePaid").GetDecimal());
        Assert.Equal(10, root.GetProperty("notDeliveredCount").GetInt32());
        Assert.Equal(JsonValueKind.Null, root.GetProperty("settledAt").ValueKind);
        Assert.Equal(JsonValueKind.Null, root.GetProperty("payoutAmount").ValueKind);
        Assert.True(root.GetProperty("canSettle").GetBoolean());
    }
}

using System.Text.Json;
using Bazaar.Application.Import;

namespace Bazaar.Api.UnitTests.Features.Import;

/// <summary>
/// ImportEndpoints returns PreviewImportResult/RunImportResult directly via
/// Results.Ok(result) — no separate response DTO. Since a Minimal API
/// delegate can't be invoked directly in a unit test, the serialized shape
/// of these result records is the only provable contract for the response
/// bodies documented in docs/requirements/bazaar-app/api/import.md. Mirrors
/// SettlementEndpointsTests' approach: serialize with the same
/// JsonSerializerDefaults.Web policy Minimal API applies to Results.Ok(...)
/// by default, then assert the exact camelCase keys from the API doc.
/// </summary>
public class ImportResponseSerializationTests
{
    private static readonly JsonSerializerOptions WebDefaults = new(JsonSerializerDefaults.Web);

    [Fact]
    public void PreviewImportResult_Serializes_ToSpecShape()
    {
        var result = new PreviewImportResult(
            sellerCount: 84,
            articleCount: 612,
            newSellers: 71,
            replacedSellers: 11,
            skippedSellers:
            [
                new SkippedSellerDetail("a3f9c2d1", "Anna Meier", "has_sold_articles", 7),
                new SkippedSellerDetail("c4a1b2d3", "Peter Klein", "settled", null)
            ],
            unknownSellerTypes:
            [
                new UnknownSellerTypeDetail("Verein", 3)
            ],
            newBrands: 23,
            newCategories: 5);

        var json = JsonSerializer.Serialize(result, WebDefaults);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(84, root.GetProperty("sellerCount").GetInt32());
        Assert.Equal(612, root.GetProperty("articleCount").GetInt32());
        Assert.Equal(71, root.GetProperty("newSellers").GetInt32());
        Assert.Equal(11, root.GetProperty("replacedSellers").GetInt32());

        var skippedSellers = root.GetProperty("skippedSellers");
        Assert.Equal(2, skippedSellers.GetArrayLength());

        var soldSkip = skippedSellers[0];
        Assert.Equal("a3f9c2d1", soldSkip.GetProperty("id").GetString());
        Assert.Equal("Anna Meier", soldSkip.GetProperty("name").GetString());
        Assert.Equal("has_sold_articles", soldSkip.GetProperty("reason").GetString());
        Assert.Equal(7, soldSkip.GetProperty("soldCount").GetInt32());

        var settledSkip = skippedSellers[1];
        Assert.Equal("c4a1b2d3", settledSkip.GetProperty("id").GetString());
        Assert.Equal("Peter Klein", settledSkip.GetProperty("name").GetString());
        Assert.Equal("settled", settledSkip.GetProperty("reason").GetString());
        Assert.Equal(JsonValueKind.Null, settledSkip.GetProperty("soldCount").ValueKind);

        var unknownSellerTypes = root.GetProperty("unknownSellerTypes");
        Assert.Equal(1, unknownSellerTypes.GetArrayLength());
        Assert.Equal("Verein", unknownSellerTypes[0].GetProperty("name").GetString());
        Assert.Equal(3, unknownSellerTypes[0].GetProperty("affectedSellers").GetInt32());

        Assert.Equal(23, root.GetProperty("newBrands").GetInt32());
        Assert.Equal(5, root.GetProperty("newCategories").GetInt32());
    }

    [Fact]
    public void RunImportResult_Serializes_ToSpecShape()
    {
        var result = new RunImportResult(
            ImportedSellers: 82,
            ImportedArticles: 598,
            SkippedSellers: 2,
            ImportedBrands: 23,
            ImportedCategories: 5);

        var json = JsonSerializer.Serialize(result, WebDefaults);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(82, root.GetProperty("importedSellers").GetInt32());
        Assert.Equal(598, root.GetProperty("importedArticles").GetInt32());
        Assert.Equal(2, root.GetProperty("skippedSellers").GetInt32());
        Assert.Equal(23, root.GetProperty("importedBrands").GetInt32());
        Assert.Equal(5, root.GetProperty("importedCategories").GetInt32());
    }
}

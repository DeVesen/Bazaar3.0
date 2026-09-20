using System.Text;
using Bazaar.Application.Import;
using Bazaar.Domain.Exceptions;

namespace Bazaar.Application.UnitTests.Import;

public class ImportFileParserTests
{
    private const string WellFormedJson = """
        {
          "exportedAt": "2026-06-14T08:00:00Z",
          "sellers": [
            {
              "id": "Ab3dEf7G",
              "firstName": "Max",
              "lastName": "Mustermann",
              "address": "Hauptstr. 1",
              "postalCode": "12345",
              "city": "Musterstadt",
              "phone": "0123456789",
              "email": "max@example.com",
              "sellerType": "Privat",
              "articles": [
                {
                  "id": "Xy9zWq2P",
                  "number": 101,
                  "name": "Winterjacke",
                  "brand": "Nike",
                  "category": "Jacken",
                  "price": 25.00,
                  "size": "M",
                  "color": "Blau",
                  "description": "kaum getragen"
                }
              ]
            }
          ],
          "brands": ["Nike", "Adidas"],
          "categories": ["Jacken", "Hosen"]
        }
        """;

    private static Stream ToStream(string json) => new MemoryStream(Encoding.UTF8.GetBytes(json));

    [Fact]
    public async Task Parse_WellFormedJson_ReturnsExpectedDtoShape()
    {
        var dto = await ImportFileParser.Parse(ToStream(WellFormedJson), TestContext.Current.CancellationToken);

        Assert.Equal(new DateTimeOffset(2026, 6, 14, 8, 0, 0, TimeSpan.Zero), dto.ExportedAt);
        Assert.Equal(["Nike", "Adidas"], dto.Brands);
        Assert.Equal(["Jacken", "Hosen"], dto.Categories);

        var seller = Assert.Single(dto.Sellers!);
        Assert.Equal("Ab3dEf7G", seller.Id);
        Assert.Equal("Max", seller.FirstName);
        Assert.Equal("Mustermann", seller.LastName);
        Assert.Equal("Hauptstr. 1", seller.Address);
        Assert.Equal("12345", seller.PostalCode);
        Assert.Equal("Musterstadt", seller.City);
        Assert.Equal("0123456789", seller.Phone);
        Assert.Equal("max@example.com", seller.Email);
        Assert.Equal("Privat", seller.SellerType);

        var article = Assert.Single(seller.Articles!);
        Assert.Equal("Xy9zWq2P", article.Id);
        Assert.Equal(101, article.Number);
        Assert.Equal("Winterjacke", article.Name);
        Assert.Equal("Nike", article.Brand);
        Assert.Equal("Jacken", article.Category);
        Assert.Equal(25.00m, article.Price);
        Assert.Equal("M", article.Size);
        Assert.Equal("Blau", article.Color);
        Assert.Equal("kaum getragen", article.Description);
    }

    [Fact]
    public async Task Parse_MalformedJson_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportFileParser.Parse(ToStream("{ not valid json"), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Theory]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","sellers":null,"brands":[],"categories":[]}""")]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","brands":[],"categories":[]}""")]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","sellers":[],"brands":null,"categories":[]}""")]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","sellers":[],"categories":[]}""")]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","sellers":[],"brands":[],"categories":null}""")]
    [InlineData("""{"exportedAt":"2026-06-14T08:00:00Z","sellers":[],"brands":[]}""")]
    public async Task Parse_MissingOrNullTopLevelArray_ThrowsBadRequestWithInvalidFormatErrorCode(string json)
    {
        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task Parse_SellerMissingRequiredField_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        const string json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [
                {
                  "id": "Ab3dEf7G",
                  "firstName": "Max",
                  "lastName": "Mustermann",
                  "email": "",
                  "sellerType": "Privat",
                  "articles": []
                }
              ],
              "brands": [],
              "categories": []
            }
            """;

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task Parse_NullElementInSellersArray_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        const string json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [
                null,
                {
                  "id": "Ab3dEf7G",
                  "firstName": "Max",
                  "lastName": "Mustermann",
                  "email": "max@example.com",
                  "sellerType": "Privat",
                  "articles": []
                }
              ],
              "brands": [],
              "categories": []
            }
            """;

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task Parse_NullElementInArticlesArray_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        const string json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [
                {
                  "id": "Ab3dEf7G",
                  "firstName": "Max",
                  "lastName": "Mustermann",
                  "email": "max@example.com",
                  "sellerType": "Privat",
                  "articles": [
                    null,
                    {
                      "id": "Xy9zWq2P",
                      "number": 101,
                      "name": "Winterjacke",
                      "brand": "Nike",
                      "category": "Jacken",
                      "price": 25.00
                    }
                  ]
                }
              ],
              "brands": [],
              "categories": []
            }
            """;

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Theory]
    [InlineData(0, 25.00)]
    [InlineData(-1, 25.00)]
    [InlineData(101, -0.01)]
    public async Task Parse_ArticleWithInvalidNumberOrPrice_ThrowsBadRequestWithInvalidFormatErrorCode(int number, decimal price)
    {
        var json = $$"""
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [
                {
                  "id": "Ab3dEf7G",
                  "firstName": "Max",
                  "lastName": "Mustermann",
                  "email": "max@example.com",
                  "sellerType": "Privat",
                  "articles": [
                    {
                      "id": "Xy9zWq2P",
                      "number": {{number}},
                      "name": "Winterjacke",
                      "brand": "Nike",
                      "category": "Jacken",
                      "price": {{price.ToString(System.Globalization.CultureInfo.InvariantCulture)}}
                    }
                  ]
                }
              ],
              "brands": [],
              "categories": []
            }
            """;

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task Parse_SellerWithOptionalFieldsAbsent_ParsesSuccessfully()
    {
        const string json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [
                {
                  "id": "Ab3dEf7G",
                  "firstName": "Max",
                  "lastName": "Mustermann",
                  "email": "max@example.com",
                  "sellerType": "Privat",
                  "articles": []
                }
              ],
              "brands": [],
              "categories": []
            }
            """;

        var dto = await ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken);

        var seller = Assert.Single(dto.Sellers!);
        Assert.Null(seller.Address);
        Assert.Null(seller.PostalCode);
        Assert.Null(seller.City);
        Assert.Null(seller.Phone);
        Assert.Empty(seller.Articles!);
    }

    [Fact]
    public async Task Parse_EmptySellersArray_ParsesSuccessfully()
    {
        const string json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [],
              "brands": [],
              "categories": []
            }
            """;

        var dto = await ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Empty(dto.Sellers!);
    }
}

namespace Bazaar.Application.Import;

/// <summary>
/// Mirrors the JSON export of the Voranmelde-App 1:1
/// (docs/requirements/bazaar-app/entities/import-format.md). Field names
/// are PascalCase C# convention; the parser deserializes the camelCase
/// JSON with PropertyNameCaseInsensitive, so no [JsonPropertyName]
/// attributes are needed here.
/// </summary>
public sealed class ImportFileDto
{
    public DateTimeOffset ExportedAt { get; set; }

    public List<ImportSellerDto>? Sellers { get; set; }

    public List<string>? Brands { get; set; }

    public List<string>? Categories { get; set; }
}

public sealed class ImportSellerDto
{
    public string? Id { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? Address { get; set; }

    public string? PostalCode { get; set; }

    public string? City { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    /// <summary>
    /// The seller type's name, not its id — see import-format.md's
    /// sellerType rule. Cross-referencing against the real SellerType
    /// repository happens in PreviewImportHandler, not here.
    /// </summary>
    public string? SellerType { get; set; }

    public List<ImportArticleDto>? Articles { get; set; }
}

public sealed class ImportArticleDto
{
    public string? Id { get; set; }

    public int Number { get; set; }

    public string? Name { get; set; }

    public string? Brand { get; set; }

    public string? Category { get; set; }

    public decimal Price { get; set; }

    public string? Size { get; set; }

    public string? Color { get; set; }

    public string? Description { get; set; }
}

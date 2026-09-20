namespace Bazaar.Application.Import;

/// <summary>
/// The <c>options</c> JSON field of <c>POST /api/import</c> (api/import.md
/// section 2) — the admin's decisions collected after reviewing the
/// <see cref="PreviewImportHandler"/> response.
/// </summary>
public sealed class ImportOptionsCommand
{
    /// <summary>
    /// Maps a file <c>sellerType</c> name (not matching any existing
    /// <c>SellerType.Name</c> case-insensitively) to a real
    /// <see cref="Bazaar.Domain.SellerTypes.SellerType"/>'s <c>Id</c>.
    /// </summary>
    public Dictionary<string, string> SellerTypeMapping { get; set; } = new();

    public bool ImportBrands { get; set; }

    public bool ImportCategories { get; set; }
}

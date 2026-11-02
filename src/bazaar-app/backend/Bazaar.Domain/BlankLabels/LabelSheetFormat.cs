namespace Bazaar.Domain.BlankLabels;

/// <summary>
/// Unter einem Namen gespeichertes Bogenformat. Der Name ist eindeutig und wird exakt
/// verglichen (gleicher Name = gleiches Format).
/// </summary>
public sealed class LabelSheetFormat
{
    public const int NameMaxLength = 50;
    public const string NameTakenErrorCode = "label_sheet_format.name_taken";
    public const string NotFoundErrorCode = "label_sheet_format.not_found";

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public LabelSheetGeometry Geometry { get; private set; } = null!;

    public static LabelSheetFormat Create(string id, string name, LabelSheetGeometry geometry)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.", nameof(id));
        var normalizedName = NormalizeName(name);
        EnsureValidGeometry(geometry);
        return new LabelSheetFormat { Id = id, Name = normalizedName, Geometry = geometry with { } };
    }

    public void ReplaceGeometry(LabelSheetGeometry geometry)
    {
        EnsureValidGeometry(geometry);
        Geometry = geometry with { };
    }

    /// <summary>Trimmt den Namen; leer oder länger als <see cref="NameMaxLength"/> ist ungültig.</summary>
    public static string NormalizeName(string name)
    {
        ArgumentNullException.ThrowIfNull(name);
        var trimmed = name.Trim();
        if (trimmed.Length == 0) throw new ArgumentException("Name required.", nameof(name));
        if (trimmed.Length > NameMaxLength) throw new ArgumentOutOfRangeException(nameof(name));
        return trimmed;
    }

    private static void EnsureValidGeometry(LabelSheetGeometry geometry)
    {
        ArgumentNullException.ThrowIfNull(geometry);
        if (!geometry.HasValidMeasures()) throw new ArgumentOutOfRangeException(nameof(geometry));
        if (!geometry.FitsSheetWidth() || !geometry.FitsSheetHeight())
        {
            throw new ArgumentException("Labels do not fit on the sheet.", nameof(geometry));
        }
    }
}

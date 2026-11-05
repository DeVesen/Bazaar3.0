using System.Security.Cryptography;

namespace Bazaar.Domain.BlankLabels;

/// <summary>
/// Bild der gemeinsamen Bilder-Bibliothek des Etiketten-Vordrucks (Logo oder Verkäufer-Symbol).
/// Die Bibliothek ist Kopierquelle: die Auswahl kopiert die Data-URL in <see cref="LabelGraphic"/>,
/// es gibt keinen Verweis auf die Id. Inhaltsgleiche Bilder (<see cref="ContentHash"/>) gibt es nur einmal.
/// </summary>
public sealed class LabelImage
{
    public const int MaxCount = 50;
    public const int NameMaxLength = 50;
    public const string NotFoundErrorCode = "label_image.not_found";
    public const string LibraryFullErrorCode = "label_image.library_full";

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public string DataUrl { get; private init; } = null!;
    public string MediaType { get; private init; } = null!;
    public int SizeBytes { get; private init; }

    /// <summary>SHA-256 der Bildbytes, kleingeschriebenes Hex (64 Zeichen).</summary>
    public string ContentHash { get; private init; } = null!;

    public DateTimeOffset CreatedAt { get; private init; }

    public static LabelImage Create(string id, string name, string dataUrl, DateTimeOffset createdAt)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.", nameof(id));
        var normalizedName = NormalizeName(name);
        if (!LabelGraphic.TryDecodeImageDataUrl(dataUrl, out var mediaType, out var content))
        {
            throw new ArgumentException("Invalid image data URL.", nameof(dataUrl));
        }
        return new LabelImage
        {
            Id = id,
            Name = normalizedName,
            DataUrl = dataUrl,
            MediaType = mediaType,
            SizeBytes = content.Length,
            ContentHash = HashOf(content),
            CreatedAt = createdAt,
        };
    }

    /// <summary>Hash, den <see cref="Create"/> für diese Data-URL setzt; für die Duplikatsuche vor dem Anlegen.</summary>
    public static string ComputeContentHash(string dataUrl)
    {
        if (!LabelGraphic.TryDecodeImageDataUrl(dataUrl, out _, out var content))
        {
            throw new ArgumentException("Invalid image data URL.", nameof(dataUrl));
        }
        return HashOf(content);
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

    private static string HashOf(byte[] content) => Convert.ToHexStringLower(SHA256.HashData(content));
}

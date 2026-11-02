using System.Text.RegularExpressions;

namespace Bazaar.Domain.BlankLabels;

public enum LabelGraphicKind
{
    Icon,
    Image,
}

/// <summary>
/// Logo oder Verkäufer-Symbol eines Etiketts: ein Icon aus der Icon-Liste (Schlüssel) oder
/// ein eigenes Bild als Base64-Data-URL (PNG, JPEG oder SVG, höchstens 1 MB).
/// </summary>
public sealed partial record LabelGraphic(LabelGraphicKind Kind, string Value)
{
    public const int MaxImageBytes = 1_048_576;

    private const string DataPrefix = "data:";
    private const string Base64Marker = ";base64,";
    private const int MaxBase64Length = (MaxImageBytes + 2) / 3 * 4;

    private static readonly string[] ImageMediaTypes = ["image/png", "image/jpeg", "image/svg+xml"];

    public bool IsValid() => Kind switch
    {
        LabelGraphicKind.Icon => IsValidIconKey(Value),
        LabelGraphicKind.Image => IsValidImageDataUrl(Value),
        _ => false,
    };

    private static bool IsValidIconKey(string? value) => value is not null && IconKeyPattern().IsMatch(value);

    private static bool IsValidImageDataUrl(string? value)
    {
        if (value is null || !value.StartsWith(DataPrefix, StringComparison.Ordinal)) return false;
        var markerIndex = value.IndexOf(Base64Marker, StringComparison.Ordinal);
        if (markerIndex < 0) return false;
        var mediaType = value[DataPrefix.Length..markerIndex];
        var payload = value[(markerIndex + Base64Marker.Length)..];
        return ImageMediaTypes.Contains(mediaType) && HasAllowedPayloadSize(payload);
    }

    private static bool HasAllowedPayloadSize(string base64Payload)
    {
        if (base64Payload.Length > MaxBase64Length) return false;
        var buffer = new byte[base64Payload.Length];
        return Convert.TryFromBase64String(base64Payload, buffer, out var byteCount) && byteCount <= MaxImageBytes;
    }

    [GeneratedRegex("^[a-z0-9-]{1,30}$")]
    private static partial Regex IconKeyPattern();
}

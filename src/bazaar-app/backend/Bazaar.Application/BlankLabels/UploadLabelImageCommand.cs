using Bazaar.Domain.BlankLabels;

namespace Bazaar.Application.BlankLabels;

/// <summary>Body von POST /api/label-images; Name ist der Dateiname ohne Endung, vom Frontend gekürzt.</summary>
public sealed class UploadLabelImageCommand
{
    public string Name { get; set; } = string.Empty;
    public string DataUrl { get; set; } = string.Empty;
}

/// <summary><paramref name="Created"/> = false: das Bild war schon (inhaltsgleich) in der Bibliothek.</summary>
public sealed record UploadLabelImageResult(LabelImage Image, bool Created);

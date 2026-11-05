namespace Bazaar.Domain.BlankLabels;

/// <summary>Bibliothekseintrag ohne Bildinhalt; die Liste bleibt klein.</summary>
public sealed record LabelImageSummary(string Id, string Name, string MediaType, int SizeBytes, DateTimeOffset CreatedAt);

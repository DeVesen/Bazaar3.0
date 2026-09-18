namespace Bazaar.Application.Release;

/// <summary>
/// Backs POST /api/release (api/release.md). One request releases a
/// seller's pre-registered articles as a single atomic transaction —
/// "Entweder alles oder nichts."
/// </summary>
public sealed class ReleaseCommand
{
    public string SellerId { get; set; } = string.Empty;
    public decimal FeeAmount { get; set; }
    public IReadOnlyList<string> ArticleIds { get; set; } = [];
}

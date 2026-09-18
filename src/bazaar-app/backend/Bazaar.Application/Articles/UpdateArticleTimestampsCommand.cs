namespace Bazaar.Application.Articles;

/// <summary>
/// <see cref="Id"/> is set by the endpoint from the route value. Full
/// replace of the three setable timestamps — createdAt/settledAt are never
/// part of this command (api/articles.md §5).
/// </summary>
public sealed class UpdateArticleTimestampsCommand
{
    public string Id { get; set; } = string.Empty;
    public DateTimeOffset? ReleasedAt { get; set; }
    public DateTimeOffset? SoldAt { get; set; }
    public DateTimeOffset? ReturnedAt { get; set; }
}

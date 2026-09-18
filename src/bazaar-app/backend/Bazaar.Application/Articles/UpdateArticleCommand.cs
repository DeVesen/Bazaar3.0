namespace Bazaar.Application.Articles;

/// <summary>
/// <see cref="Id"/> is NOT part of the wire contract — the endpoint sets it
/// from the route value after ASP.NET model binding. number/sellerId are
/// never part of this command — they are never editable (api/articles.md §4).
/// </summary>
public sealed class UpdateArticleCommand
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }
}

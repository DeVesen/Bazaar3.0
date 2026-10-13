namespace Bazaar.Application.Articles;

/// <summary>
/// <see cref="Id"/> is NOT part of the wire contract — the endpoint sets it
/// from the route value after ASP.NET model binding. sellerId is never part
/// of this command — an article never changes its owner (api/articles.md §4).
/// <see cref="Number"/> is editable: it must be free or the article's own number.
/// </summary>
public sealed class UpdateArticleCommand
{
    public string Id { get; set; } = string.Empty;
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }
}

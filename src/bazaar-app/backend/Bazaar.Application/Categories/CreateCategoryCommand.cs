namespace Bazaar.Application.Categories;

/// <summary>
/// <see cref="Name"/> is bound directly from the JSON request body of POST /api/categories.
/// <see cref="Original"/> is NOT part of the wire contract — the endpoint sets it from the
/// authenticated caller's role claim after ASP.NET model binding (and after the
/// ValidationFilter has already run).
/// </summary>
public sealed class CreateCategoryCommand
{
    public string Name { get; set; } = string.Empty;
    public bool Original { get; set; } // set by the endpoint from the role claim, not bound from JSON
}

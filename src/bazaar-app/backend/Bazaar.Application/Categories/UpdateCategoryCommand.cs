namespace Bazaar.Application.Categories;

/// <summary>
/// <see cref="Name"/>/<see cref="Original"/> are bound directly from the JSON request body of
/// PUT /api/categories/{id}. <see cref="Id"/> is NOT part of the wire contract — the endpoint
/// sets it from the route value after ASP.NET model binding.
/// </summary>
public sealed class UpdateCategoryCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public string Name { get; set; } = string.Empty;
    public bool Original { get; set; }
}

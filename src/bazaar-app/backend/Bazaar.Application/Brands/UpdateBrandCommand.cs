namespace Bazaar.Application.Brands;

/// <summary>
/// <see cref="Name"/>/<see cref="Original"/> are bound directly from the JSON request body of
/// PUT /api/brands/{id}. <see cref="Id"/> is NOT part of the wire contract — the endpoint sets
/// it from the route value after ASP.NET model binding.
/// </summary>
public sealed class UpdateBrandCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public string Name { get; set; } = string.Empty;
    public bool Original { get; set; }
}

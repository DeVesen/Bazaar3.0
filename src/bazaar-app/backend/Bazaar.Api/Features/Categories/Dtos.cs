namespace Bazaar.Api.Features.Categories;

public sealed record CategoryDto(string Id, string Name, bool Original, int ArticleCount);

using BAR.Application.Sellers.List;
using BAR.Domain.Ports.Queries;

namespace BAR.Host.Features.Sellers;

public static class SellersEndpoints
{
    // Known sortable fields per api/sellers.md Section 1
    private static readonly HashSet<string> ValidSortFields = new()
    {
        "startNumber", "firstName", "lastName", "postalCode", "city",
        "sellerType.name", "commissionRate", "itemFee", "articleCount"
    };

    public static IEndpointRouteBuilder MapSellersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sellers").RequireAuthorization("admin");

        group.MapGet("/", async (
            string? search, int page, int pageSize, string? sort,
            GetSellersQueryHandler handler, CancellationToken ct) =>
        {
            var sortMeta = ParseSort(sort);
            var query = new GetSellersQuery(search, page <= 0 ? 1 : page, pageSize <= 0 ? 25 : pageSize, sortMeta);
            return Results.Ok(await handler.HandleAsync(query, ct));
        });

        return app;
    }

    /// <summary>Parst `?sort=field:asc,field2:desc` (api/cross-cutting.md Abschnitt 4).</summary>
    private static IReadOnlyList<SellerSort> ParseSort(string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return [];
        }

        return sort.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split(':'))
            .Where(parts => parts.Length == 2)
            .Where(parts => ValidSortFields.Contains(parts[0]))
            .Select(parts => new SellerSort(parts[0], parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }
}

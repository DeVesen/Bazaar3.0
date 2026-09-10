using BAR.Application.Sellers;
using BAR.Application.Sellers.Create;
using BAR.Application.Sellers.List;
using BAR.Application.Sellers.Update;
using BAR.Domain.Ports;
using BAR.Domain.Ports.Queries;
using BAR.Host.Validation;

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

        group.MapPost("/", async (
            CreateSellerCommand command, CreateSellerCommandHandler handler,
            ISellerTypeRepository sellerTypes, CancellationToken ct) =>
        {
            var response = await handler.HandleAsync(command, ct);
            var type = await sellerTypes.GetByIdAsync(response.SellerTypeId, ct);
            var enriched = response with { SellerType = new SellerTypeSummary(type!.Id, type.Name, type.CommissionRate, type.ItemFee) };
            return Results.Created($"/api/sellers/{enriched.Id}", enriched);
        }).AddEndpointFilter<ValidationFilter<CreateSellerCommand>>();

        group.MapPut("/{id}", async (
            string id, UpdateSellerCommand body, UpdateSellerCommandHandler handler,
            INumberBlockRepository blocks, CancellationToken ct) =>
        {
            var command = body with { SellerId = id };
            var response = await handler.HandleAsync(command, ct);
            var sellerBlocks = await blocks.GetForSellerAsync(id, ct);
            var enriched = response with
            {
                StartNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : null
            };
            return Results.Ok(enriched);
        }).AddEndpointFilter<ValidationFilter<UpdateSellerCommand>>();

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

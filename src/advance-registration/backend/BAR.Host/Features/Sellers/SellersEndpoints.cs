using System.Security.Claims;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Host.Validation;
using Microsoft.Extensions.Configuration;

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
            string? sellerTypeId, string? search, int? page, int? pageSize, string? sort,
            ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sortMeta = ParseSort(sort);
            var effectivePage = Math.Max(page ?? 1, 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var query = new GetSellersQuery(sellerTypeId, search, effectivePage, effectivePageSize, sortMeta);
            return Results.Ok(await sellerManagement.GetSellersAsync(query, ct));
        });

        group.MapPost("/", async (
            CreateSellerCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var result = await sellerManagement.CreateSellerAsync(command, ct);
            return Results.Created($"/api/sellers/{result.Id}", result);
        }).AddEndpointFilter<ValidationFilter<CreateSellerCommand>>();

        group.MapPut("/{id}", async (
            string id, UpdateSellerCommand body, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var command = body with { SellerId = id };
            return Results.Ok(await sellerManagement.UpdateSellerAsync(command, ct));
        }).AddEndpointFilter<ValidationFilter<UpdateSellerCommand>>();

        group.MapDelete("/{id}", async (
            string id, ClaimsPrincipal user, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var requestingSellerId = user.FindFirstValue("sub")!;
            await sellerManagement.DeleteSellerAsync(new DeleteSellerCommand(id, requestingSellerId), ct);
            return Results.NoContent();
        });

        group.MapPost("/{id}/invite", (
            string id, ISellerManagementModuleApi sellerManagement, IConfiguration configuration, CancellationToken ct) =>
            InviteAsync(id, sellerManagement, configuration, ct));

        return app;
    }

    static async Task<IResult> InviteAsync(string id, ISellerManagementModuleApi sellerManagement, IConfiguration configuration, CancellationToken ct)
    {
        var result = await sellerManagement.InviteSellerAsync(id, ct);
        var baseUrl = configuration["Frontend:BaseUrl"];
        var inviteUrl = $"{baseUrl}/set-password?token={result.Token}";
        return Results.Ok(new { inviteUrl, expiresAt = result.ExpiresAt });
    }

    /// <summary>Parst `?sort=field:asc,field2:desc` (api/cross-cutting.md Abschnitt 4).</summary>
    private static IReadOnlyList<SellerSortDto> ParseSort(string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return [];
        }

        return sort.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split(':'))
            .Where(parts => parts.Length == 2)
            .Where(parts => ValidSortFields.Contains(parts[0]))
            .Select(parts => new SellerSortDto(parts[0], parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }
}

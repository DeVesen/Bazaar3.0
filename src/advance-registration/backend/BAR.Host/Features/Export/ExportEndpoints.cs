using System.Text.Json;
using BAR.Application.Export;

namespace BAR.Host.Features.Export;

public static class ExportEndpoints
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public static IEndpointRouteBuilder MapExportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/export").RequireAuthorization("admin");

        group.MapGet("/", async (
            bool? includeBrands, bool? includeCategories,
            GetExportQueryHandler handler, CancellationToken ct) =>
        {
            var query = new GetExportQuery(includeBrands ?? false, includeCategories ?? false);
            var response = await handler.HandleAsync(query, ct);

            var json = JsonSerializer.SerializeToUtf8Bytes(response, SerializerOptions);
            var fileName = $"basar-export-{DateTime.UtcNow:yyyy-MM-dd}.json";
            return Results.File(json, "application/json", fileName);
        });

        return app;
    }
}

using System.Security.Claims;
using System.Text;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Articles;

namespace BAR.Host.Features.Articles;

public static class ArticleImportExportEndpoints
{
    public static IEndpointRouteBuilder MapArticleImportExportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine/export", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var csv = await registration.GetArticleExportCsvAsync(sellerId, ct);
            return CsvFile(csv, $"meine-artikel-{DateTime.UtcNow:yyyy-MM-dd}.csv");
        }).RequireAuthorization();

        app.MapGet("/api/articles/mine/template", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var csv = await registration.GetArticleTemplateCsvAsync(sellerId, ct);
            return CsvFile(csv, $"meine-artikel-vorlage-{DateTime.UtcNow:yyyy-MM-dd}.csv");
        }).RequireAuthorization();

        app.MapPost("/api/articles/mine/import", async (
            ClaimsPrincipal user, IFormFile file, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var isAdmin = user.IsInRole("admin");
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream, ct);

            var command = new ImportArticlesCommand(sellerId, isAdmin, stream.ToArray(), file.FileName);
            var result = await registration.ImportArticlesAsync(command, ct);

            return result.Success
                ? Results.Ok(new { created = result.Created, updated = result.Updated, deleted = result.Deleted })
                : Results.Json(new { errors = result.Errors }, statusCode: StatusCodes.Status422UnprocessableEntity);
        }).RequireAuthorization()
          .DisableAntiforgery();

        return app;
    }

    private static IResult CsvFile(string csv, string fileName)
    {
        var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true).GetBytes(csv);
        return Results.File(bytes, "text/csv; charset=utf-8", fileName);
    }
}

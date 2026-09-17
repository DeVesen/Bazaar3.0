using System.Security.Claims;
using System.Text;
using BAR.Modules.Registration.Contracts;

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

        return app;
    }

    private static IResult CsvFile(string csv, string fileName)
    {
        var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true).GetBytes(csv);
        return Results.File(bytes, "text/csv; charset=utf-8", fileName);
    }
}

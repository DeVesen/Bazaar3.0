using Bazaar.Application.ArticleImport;
using Bazaar.Domain.Exceptions;

namespace Bazaar.Api.Features.ArticleImport;

public static class ArticleImportEndpoints
{
    internal const long MaxFileBytes = 2 * 1024 * 1024;

    public static IEndpointRouteBuilder MapArticleImportEndpoints(this IEndpointRouteBuilder app)
    {
        // Wie POST /api/import wird der multipart-Body von Hand gelesen: eine Datei plus ein Textfeld
        // ("locale") lassen sich mit einfacher Parameterbindung nicht ausdrücken.
        app.MapPost("/api/sellers/{id}/articles/import", async (
            string id,
            HttpRequest request,
            ImportSellerArticlesHandler handler,
            CancellationToken cancellationToken) =>
        {
            var (file, locale) = await ParseImportRequest(request);

            await using var stream = file.OpenReadStream();
            var result = await handler.Handle(id, stream, file.FileName, locale, cancellationToken);
            return Results.Ok(new ArticleImportResponseDto(result.ImportedCount));
        })
        .RequireAuthorization("admin");

        return app;
    }

    /// <summary>
    /// Liest die multipart-Felder <c>file</c> und <c>locale</c> und prüft Datei und Größe, bevor etwas
    /// verarbeitet wird.
    /// </summary>
    internal static async Task<(IFormFile File, string? Locale)> ParseImportRequest(HttpRequest request)
    {
        if (!request.HasFormContentType)
        {
            throw InvalidFormat();
        }

        var form = await request.ReadFormAsync();
        var file = form.Files["file"];
        if (file is null || file.Length == 0)
        {
            throw InvalidFormat();
        }

        if (file.Length > MaxFileBytes)
        {
            throw new BadRequestException("Die Datei ist größer als 2 MB", "import.file_too_large");
        }

        return (file, form["locale"].ToString());
    }

    private static BadRequestException InvalidFormat() =>
        new("Es wurde keine Datei übermittelt", "import.invalid_format");
}

public sealed record ArticleImportResponseDto(int ImportedCount);

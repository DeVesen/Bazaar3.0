using System.Text.Json;
using Bazaar.Application.Import;
using Bazaar.Domain.Exceptions;

namespace Bazaar.Api.Features.Import;

public static class ImportEndpoints
{
    private static readonly JsonSerializerOptions OptionsJsonSettings = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static IEndpointRouteBuilder MapImportEndpoints(this IEndpointRouteBuilder app)
    {
        // IFormFile parameter binding: ASP.NET Core Minimal APIs bind a
        // single IFormFile parameter directly from a multipart/form-data
        // body's field named after the parameter ("file") - no [FromForm]
        // needed. If the field is absent, binding fails before this delegate
        // runs and ASP.NET Core itself returns 400 (verified against
        // api/import.md's contract in the report), so no manual null-check
        // for a missing file is needed here.
        //
        // Binding an IFormFile also attaches anti-forgery metadata, which
        // fails every request with a 500 because no anti-forgery middleware
        // is registered. The API authenticates via JWT bearer header, not a
        // cookie, so there is no CSRF surface and the check is disabled.
        app.MapPost("/api/import/preview", async (IFormFile file, PreviewImportHandler handler, CancellationToken cancellationToken) =>
        {
            if (file.Length == 0)
            {
                throw new BadRequestException("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
            }

            await using var stream = file.OpenReadStream();
            var result = await handler.Handle(stream, cancellationToken);
            return Results.Ok(result);
        })
        .RequireAuthorization("admin")
        .DisableAntiforgery();

        // Mixed file + JSON-string multipart body: Minimal API's simple
        // parameter binding can't express "file plus a JSON-encoded form
        // field", so the request is read manually here (same reasoning as
        // ImportFileParser's manual deserialization of the file content).
        app.MapPost("/api/import", async (HttpRequest request, RunImportHandler handler, CancellationToken cancellationToken) =>
        {
            var (file, command) = await ParseRunImportRequest(request);

            await using var stream = file.OpenReadStream();
            var result = await handler.Handle(stream, command, cancellationToken);
            return Results.Ok(result);
        })
        .RequireAuthorization("admin");

        return app;
    }

    /// <summary>
    /// Extracted from the endpoint delegate so it can be unit-tested without
    /// a full host: parses the <c>file</c> + <c>options</c> multipart fields
    /// of <c>POST /api/import</c> and throws <see cref="BadRequestException"/>
    /// with <c>import.invalid_format</c> for anything missing/malformed. This
    /// codebase's <c>api/import.md</c> defines no separate errorCode for a
    /// malformed <c>options</c> field, so reusing <c>import.invalid_format</c>
    /// is the pragmatic choice.
    /// </summary>
    internal static async Task<(IFormFile File, ImportOptionsCommand Command)> ParseRunImportRequest(HttpRequest request)
    {
        if (!request.HasFormContentType)
        {
            throw new BadRequestException("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
        }

        var form = await request.ReadFormAsync();
        var file = form.Files["file"];
        var optionsJson = form["options"].ToString();

        if (file is null || file.Length == 0 || string.IsNullOrWhiteSpace(optionsJson))
        {
            throw new BadRequestException("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
        }

        ImportOptionsCommand? command;
        try
        {
            command = JsonSerializer.Deserialize<ImportOptionsCommand>(optionsJson, OptionsJsonSettings);
        }
        catch (JsonException)
        {
            throw new BadRequestException("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
        }

        if (command is null)
        {
            throw new BadRequestException("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
        }

        return (file, command);
    }
}

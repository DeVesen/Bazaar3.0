using System.Text;
using Bazaar.Api.Features.Import;
using Bazaar.Domain.Exceptions;
using Microsoft.AspNetCore.Http;

namespace Bazaar.Api.UnitTests.Features.Import;

/// <summary>
/// ImportEndpoints.MapImportEndpoints wires HttpRequest/IFormFile directly to
/// PreviewImportHandler/RunImportHandler (both already unit-tested in
/// Bazaar.Application.UnitTests) — Minimal API delegates can't be invoked
/// without a full host, so this tests the extracted
/// ParseRunImportRequest helper instead (mirrors ValidationFilterTests'
/// approach of testing the non-trivial logic directly rather than through
/// the endpoint lambda). Covers POST /api/import's multipart file+JSON-string
/// binding: a well-formed "options" field parses correctly, and a
/// missing/malformed "file"/"options" field surfaces as
/// import.invalid_format (api/import.md defines no separate errorCode for a
/// malformed options field, so this codebase reuses import.invalid_format —
/// see task-5-report.md for the reasoning).
/// </summary>
public class ImportEndpointsTests
{
    private static HttpRequest BuildRequest(IFormFile? file, string? optionsJson)
    {
        var files = new FormFileCollection();
        if (file is not null)
        {
            files.Add(file);
        }

        var formFields = new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>();
        if (optionsJson is not null)
        {
            formFields["options"] = optionsJson;
        }

        var form = new FormCollection(formFields, files);
        var httpContext = new DefaultHttpContext();
        httpContext.Request.ContentType = "multipart/form-data; boundary=----irrelevant";
        httpContext.Request.Form = form;
        return httpContext.Request;
    }

    private static IFormFile BuildFile(string content = "file-content", string fieldName = "file", string fileName = "import.json")
    {
        var bytes = Encoding.UTF8.GetBytes(content);
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, fieldName, fileName);
    }

    [Fact]
    public async Task ParseRunImportRequest_WithWellFormedOptions_ParsesIntoCommand()
    {
        const string optionsJson = """
            { "sellerTypeMapping": { "Verein": "b7c1e4f2" }, "importBrands": true, "importCategories": false }
            """;
        var request = BuildRequest(BuildFile(), optionsJson);

        var (file, command) = await ImportEndpoints.ParseRunImportRequest(request);

        Assert.NotNull(file);
        Assert.True(command.ImportBrands);
        Assert.False(command.ImportCategories);
        Assert.Equal("b7c1e4f2", command.SellerTypeMapping["Verein"]);
    }

    [Fact]
    public async Task ParseRunImportRequest_WithMissingOptions_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        var request = BuildRequest(BuildFile(), optionsJson: null);

        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportEndpoints.ParseRunImportRequest(request));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseRunImportRequest_WithMalformedOptionsJson_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        var request = BuildRequest(BuildFile(), optionsJson: "{ not valid json");

        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportEndpoints.ParseRunImportRequest(request));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseRunImportRequest_WithMissingFile_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        var request = BuildRequest(file: null, optionsJson: """{ "importBrands": true, "importCategories": true }""");

        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportEndpoints.ParseRunImportRequest(request));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseRunImportRequest_WithNonMultipartRequest_ThrowsBadRequestWithInvalidFormatErrorCode()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Request.ContentType = "application/json";

        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => ImportEndpoints.ParseRunImportRequest(httpContext.Request));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }
}

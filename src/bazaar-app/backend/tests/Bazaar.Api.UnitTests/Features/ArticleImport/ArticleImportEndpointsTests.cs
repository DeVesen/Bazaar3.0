using Bazaar.Api.Features.ArticleImport;
using Bazaar.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Bazaar.Api.UnitTests.Features.ArticleImport;

public class ArticleImportEndpointsTests
{
    private static HttpRequest BuildRequest(IFormFile? file, string? locale, bool multipart = true)
    {
        var files = new FormFileCollection();
        if (file is not null) files.Add(file);

        var fields = new Dictionary<string, StringValues>();
        if (locale is not null) fields["locale"] = locale;

        var httpContext = new DefaultHttpContext();
        if (!multipart)
        {
            // Ein gesetztes Request.Form lässt HasFormContentType immer true werden, daher bleibt es hier ungesetzt.
            httpContext.Request.ContentType = "application/json";
            return httpContext.Request;
        }

        httpContext.Request.ContentType = "multipart/form-data; boundary=----irrelevant";
        httpContext.Request.Form = new FormCollection(fields, files);
        return httpContext.Request;
    }

    private static IFormFile BuildFile(long length, string fileName = "artikel.csv") =>
        new FormFile(new MemoryStream(new byte[length]), 0, length, "file", fileName);

    [Fact]
    public async Task ParseImportRequest_FileAndLocale_ReturnsBoth()
    {
        // Arrange
        var request = BuildRequest(BuildFile(10), "de-DE");

        // Act
        var (file, locale) = await ArticleImportEndpoints.ParseImportRequest(request);

        // Assert
        Assert.Equal("artikel.csv", file.FileName);
        Assert.Equal("de-DE", locale);
    }

    [Fact]
    public async Task ParseImportRequest_FileOfExactlyTwoMegabytes_IsAccepted()
    {
        // Arrange
        var request = BuildRequest(BuildFile(ArticleImportEndpoints.MaxFileBytes), "de-DE");

        // Act
        var (file, _) = await ArticleImportEndpoints.ParseImportRequest(request);

        // Assert
        Assert.Equal(ArticleImportEndpoints.MaxFileBytes, file.Length);
    }

    [Fact]
    public async Task ParseImportRequest_FileLargerThanTwoMegabytes_ThrowsFileTooLarge()
    {
        // Arrange
        var request = BuildRequest(BuildFile(ArticleImportEndpoints.MaxFileBytes + 1), "de-DE");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
        Assert.Equal("import.file_too_large", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseImportRequest_MissingFile_ThrowsInvalidFormat()
    {
        // Arrange
        var request = BuildRequest(null, "de-DE");

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseImportRequest_NotMultipart_ThrowsInvalidFormat()
    {
        // Arrange
        var request = BuildRequest(BuildFile(10), "de-DE", multipart: false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task ParseImportRequest_MissingLocale_ReturnsEmptyLocale()
    {
        // Arrange
        var request = BuildRequest(BuildFile(10), null);

        // Act
        var (_, locale) = await ArticleImportEndpoints.ParseImportRequest(request);

        // Assert
        Assert.True(string.IsNullOrEmpty(locale));
    }
}

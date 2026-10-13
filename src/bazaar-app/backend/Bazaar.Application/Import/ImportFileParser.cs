using System.Text.Json;
using Bazaar.Domain.Exceptions;

namespace Bazaar.Application.Import;

/// <summary>
/// Deserializes an uploaded import file (docs/requirements/bazaar-app/entities/import-format.md)
/// and validates it structurally. Pure parsing — no repository reads/writes, no cross-reference
/// of sellerType against the real SellerType data (that is PreviewImportHandler's job). Takes a
/// Stream rather than IFormFile to keep the Application layer decoupled from
/// Microsoft.AspNetCore.Http (Bazaar.Architecture.Tests\DependencyDirectionTests.cs).
/// </summary>
public static class ImportFileParser
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task<ImportFileDto> Parse(Stream content, CancellationToken cancellationToken = default)
    {
        ImportFileDto? dto;
        try
        {
            dto = await JsonSerializer.DeserializeAsync<ImportFileDto>(content, SerializerOptions, cancellationToken);
        }
        catch (JsonException)
        {
            throw InvalidFormat();
        }

        if (dto is null)
        {
            throw InvalidFormat();
        }

        Validate(dto);

        return dto;
    }

    private static void Validate(ImportFileDto dto)
    {
        if (dto.Sellers is null)
        {
            throw InvalidFormat();
        }

        if (dto.Brands is null)
        {
            throw InvalidFormat();
        }

        if (dto.Categories is null)
        {
            throw InvalidFormat();
        }

        foreach (var seller in dto.Sellers)
        {
            if (seller is null)
            {
                throw InvalidFormat();
            }

            ValidateSeller(seller);
        }
    }

    private static void ValidateSeller(ImportSellerDto seller)
    {
        if (string.IsNullOrWhiteSpace(seller.Id) ||
            string.IsNullOrWhiteSpace(seller.FirstName) ||
            string.IsNullOrWhiteSpace(seller.LastName) ||
            string.IsNullOrWhiteSpace(seller.City) ||
            string.IsNullOrWhiteSpace(seller.SellerType))
        {
            throw InvalidFormat();
        }

        if (seller.Articles is null)
        {
            throw InvalidFormat();
        }

        foreach (var article in seller.Articles)
        {
            if (article is null)
            {
                throw InvalidFormat();
            }

            ValidateArticle(article);
        }
    }

    private static void ValidateArticle(ImportArticleDto article)
    {
        if (string.IsNullOrWhiteSpace(article.Id) ||
            string.IsNullOrWhiteSpace(article.Name) ||
            string.IsNullOrWhiteSpace(article.Brand) ||
            string.IsNullOrWhiteSpace(article.Category) ||
            article.Number <= 0 ||
            article.Price < 0)
        {
            throw InvalidFormat();
        }
    }

    private static BadRequestException InvalidFormat() =>
        new("Datei entspricht nicht dem erwarteten Schema", "import.invalid_format");
}

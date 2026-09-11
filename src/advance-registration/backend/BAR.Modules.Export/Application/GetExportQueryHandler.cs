using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts;

namespace BAR.Modules.Export.Application;

/// <summary>
/// Reine Lesekomposition ueber drei Module (modulith-thinking: kein eigenes
/// Schema, keine eigene Akte) - ersetzt den frueheren SQL-Join gegen
/// Sellers/SellerTypes/Articles in einem gemeinsamen DbContext. §11.7: der
/// Export traegt nur den Namen des Verkaeufer-Typs, keine Konditionszahlen -
/// die Haupt-App loest Provision/Gebuehr ueber den Namen selbst auf.
/// </summary>
public sealed class GetExportQueryHandler(
    IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, IAnmeldungModuleApi anmeldung, IStammdatenModuleApi stammdaten)
{
    public async Task<ExportResponse> HandleAsync(GetExportQuery request, CancellationToken cancellationToken)
    {
        var sellers = await verkaeuferverwaltung.GetAllSellersForExportAsync(cancellationToken);
        var articles = await anmeldung.GetArticlesForExportAsync(cancellationToken);

        var articlesBySeller = articles.ToLookup(a => a.SellerId);

        // §11.7: nur Verkaeufer mit mindestens einem Artikel werden exportiert -
        // wer sich zwar angemeldet, aber noch nichts erfasst hat, ist fuer die
        // Haupt-App am Basar-Morgen nicht relevant.
        var sellerResponses = sellers
            .Where(s => articlesBySeller.Contains(s.Id))
            .Select(s => new ExportSellerResponse(
                s.Id, s.FirstName, s.LastName, s.Address, s.PostalCode, s.City, s.Phone, s.Email, s.SellerTypeName,
                articlesBySeller[s.Id].Select(a => new ExportArticleResponse(
                    a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description)).ToList()))
            .ToList();

        var brands = request.IncludeBrands
            ? await stammdaten.GetAllBrandNamesAsync(cancellationToken)
            : [];
        var categories = request.IncludeCategories
            ? await stammdaten.GetAllCategoryNamesAsync(cancellationToken)
            : [];

        return new ExportResponse(DateTime.UtcNow, sellerResponses, brands, categories);
    }
}

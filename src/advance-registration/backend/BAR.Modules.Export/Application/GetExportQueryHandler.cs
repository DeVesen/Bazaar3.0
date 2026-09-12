using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts;

namespace BAR.Modules.Export.Application;

/// <summary>
/// A pure read composition across three modules (modulith-thinking: no
/// schema of its own, no record of its own) - replaces the former SQL join
/// against Sellers/SellerTypes/Articles in a shared DbContext. §11.7: the
/// export carries only the seller type's name, not its condition figures -
/// the main app resolves commission/fee from the name itself.
/// </summary>
public sealed class GetExportQueryHandler(
    ISellerManagementModuleApi sellerManagement, IRegistrationModuleApi registration, IMasterDataModuleApi masterData)
{
    public async Task<ExportResponse> HandleAsync(GetExportQuery request, CancellationToken cancellationToken)
    {
        var sellers = await sellerManagement.GetAllSellersForExportAsync(cancellationToken);
        var articles = await registration.GetArticlesForExportAsync(cancellationToken);

        var articlesBySeller = articles.ToLookup(a => a.SellerId);

        // §11.7: only sellers with at least one article are exported - someone
        // who registered but hasn't captured anything yet is not relevant to
        // the main app on bazaar morning.
        var sellerResponses = sellers
            .Where(s => articlesBySeller.Contains(s.Id))
            .Select(s => new ExportSellerResponse(
                s.Id, s.FirstName, s.LastName, s.Address, s.PostalCode, s.City, s.Phone, s.Email, s.SellerTypeName,
                articlesBySeller[s.Id].Select(a => new ExportArticleResponse(
                    a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description)).ToList()))
            .ToList();

        var brands = request.IncludeBrands
            ? await masterData.GetAllBrandNamesAsync(cancellationToken)
            : [];
        var categories = request.IncludeCategories
            ? await masterData.GetAllCategoryNamesAsync(cancellationToken)
            : [];

        return new ExportResponse(DateTime.UtcNow, sellerResponses, brands, categories);
    }
}

using BAR.Domain.Ports.Queries;

namespace BAR.Application.Export;

public sealed class GetExportQueryHandler(IExportQuery query)
{
    public async Task<ExportResponse> HandleAsync(GetExportQuery request, CancellationToken cancellationToken)
    {
        var result = await query.ExecuteAsync(request.IncludeBrands, request.IncludeCategories, cancellationToken);

        var sellers = result.Sellers.Select(s => new ExportSellerResponse(
            s.Id, s.FirstName, s.LastName, s.Address, s.PostalCode, s.City, s.Phone, s.Email, s.SellerType,
            s.Articles.Select(a => new ExportArticleResponse(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description
            )).ToList()
        )).ToList();

        return new ExportResponse(DateTime.UtcNow, sellers, result.Brands, result.Categories);
    }
}

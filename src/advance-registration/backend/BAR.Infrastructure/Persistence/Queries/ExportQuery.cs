using BAR.Domain.Ports.Queries;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class ExportQuery(BarDbContext dbContext) : IExportQuery
{
    public async Task<ExportResult> ExecuteAsync(bool includeBrands, bool includeCategories, CancellationToken cancellationToken)
    {
        var sellerRows = await (
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            where dbContext.Articles.Any(a => a.SellerId == seller.Id)
            select new { Seller = seller, TypeName = type.Name })
            .ToListAsync(cancellationToken);

        var sellerIds = sellerRows.Select(r => r.Seller.Id).ToList();
        var articles = await dbContext.Articles
            .Where(a => sellerIds.Contains(a.SellerId))
            .ToListAsync(cancellationToken);

        var sellers = sellerRows.Select(row => new ExportSeller(
            row.Seller.Id, row.Seller.FirstName, row.Seller.LastName, row.Seller.Address,
            row.Seller.PostalCode, row.Seller.City, row.Seller.Phone, row.Seller.Email, row.TypeName,
            articles.Where(a => a.SellerId == row.Seller.Id).Select(a => new ExportArticle(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description
            )).ToList()
        )).ToList();

        var brands = includeBrands
            ? await dbContext.Brands.OrderBy(b => b.Name).Select(b => b.Name).ToListAsync(cancellationToken)
            : [];

        var categories = includeCategories
            ? await dbContext.Categories.OrderBy(c => c.Name).Select(c => c.Name).ToListAsync(cancellationToken)
            : [];

        return new ExportResult(sellers, brands, categories);
    }
}

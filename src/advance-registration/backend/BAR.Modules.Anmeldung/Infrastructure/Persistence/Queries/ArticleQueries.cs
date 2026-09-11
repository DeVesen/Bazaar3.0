using System.Globalization;
using System.Linq.Expressions;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.Ports.Queries;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Anmeldung.Infrastructure.Persistence.Queries;

public sealed class ArticleQueries(AnmeldungDbContext dbContext) : IArticleQueries
{
    public async Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var query = dbContext.Articles.Where(a => a.SellerId == sellerId);
        query = ApplyBrandCategoryFilters(query, brand, category);
        query = await ApplySearchFilterAsync(query, search, null, cancellationToken);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await ApplySort(query, sort)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ArticleSearchPage(items, totalCount);
    }

    public async Task<ArticleSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        IReadOnlyCollection<string>? searchMatchingSellerIds,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var query = dbContext.Articles.AsQueryable();
        if (sellerId is not null) query = query.Where(a => a.SellerId == sellerId);
        query = ApplyBrandCategoryFilters(query, brand, category);
        query = await ApplySearchFilterAsync(query, search, searchMatchingSellerIds, cancellationToken);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await ApplySort(query, sort)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ArticleSearchPage(items, totalCount);
    }

    private static IQueryable<Article> ApplyBrandCategoryFilters(IQueryable<Article> query, string? brand, string? category)
    {
        if (!string.IsNullOrWhiteSpace(brand)) query = query.Where(a => a.Brand == brand);
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);
        return query;
    }

    private static async Task<IQueryable<Article>> ApplySearchFilterAsync(
        IQueryable<Article> query, string? search, IReadOnlyCollection<string>? searchMatchingSellerIds, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var term = $"%{search.Trim()}%";
        var numberMatchIds = await GetNumberMatchingArticleIdsAsync(query, search, cancellationToken);

        return query.Where(a =>
            numberMatchIds.Contains(a.Id) ||
            EF.Functions.ILike(a.Name, term) ||
            EF.Functions.ILike(a.Category, term) ||
            EF.Functions.ILike(a.Brand, term) ||
            (searchMatchingSellerIds != null && searchMatchingSellerIds.Contains(a.SellerId)));
    }

    /// <summary>
    /// Abweichung vom Brief: <c>EF.Functions.ILike(a.Number.ToString(), term)</c>
    /// wirft zur Laufzeit eine <see cref="InvalidOperationException"/>
    /// ("could not be translated") - der EF-Core/Npgsql-Provider uebersetzt
    /// <c>int.ToString()</c> innerhalb eines LINQ-Praedikats nicht in SQL
    /// (empirisch mit dem echten Postgres-Testcontainer verifiziert). Deshalb
    /// wird der Number-Teilstring-Abgleich hier separat behandelt: die
    /// (bereits durch brand/category/sellerId eingeschraenkten) Kandidaten
    /// werden nur mit Id+Number geladen und der Teilstring-Vergleich lokal
    /// in-memory ausgefuehrt - fuer den Basar-Datenumfang unkritisch. Die
    /// passenden Ids fliessen danach wieder in ein server-seitiges
    /// <c>WHERE id IN (...) OR ILike(...)</c> ein.
    /// </summary>
    private static async Task<HashSet<string>> GetNumberMatchingArticleIdsAsync(
        IQueryable<Article> baseQuery, string search, CancellationToken cancellationToken)
    {
        var term = search.Trim();
        var candidates = await baseQuery
            .Select(a => new { a.Id, a.Number })
            .ToListAsync(cancellationToken);

        return candidates
            .Where(x => x.Number.ToString(CultureInfo.InvariantCulture).Contains(term, StringComparison.OrdinalIgnoreCase))
            .Select(x => x.Id)
            .ToHashSet();
    }

    private static IQueryable<Article> ApplySort(IQueryable<Article> query, string? sort)
    {
        Expression<Func<Article, int>> byNumber = a => a.Number;
        Expression<Func<Article, string>> byName = a => a.Name;
        Expression<Func<Article, string>> byCategory = a => a.Category;
        Expression<Func<Article, string>> byBrand = a => a.Brand;
        Expression<Func<Article, decimal>> byPrice = a => a.Price;

        if (string.IsNullOrWhiteSpace(sort))
        {
            return query.OrderBy(byNumber);
        }

        IOrderedQueryable<Article>? ordered = null;
        foreach (var part in sort.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            var pieces = part.Split(':');
            var field = pieces[0].Trim().ToLowerInvariant();
            var descending = pieces.Length > 1 && pieces[1].Trim().Equals("desc", StringComparison.OrdinalIgnoreCase);

            ordered = (ordered is null, field) switch
            {
                (true, "number") => descending ? query.OrderByDescending(byNumber) : query.OrderBy(byNumber),
                (true, "name") => descending ? query.OrderByDescending(byName) : query.OrderBy(byName),
                (true, "category") => descending ? query.OrderByDescending(byCategory) : query.OrderBy(byCategory),
                (true, "brand") => descending ? query.OrderByDescending(byBrand) : query.OrderBy(byBrand),
                (true, "price") => descending ? query.OrderByDescending(byPrice) : query.OrderBy(byPrice),
                (false, "number") => descending ? ordered!.ThenByDescending(byNumber) : ordered!.ThenBy(byNumber),
                (false, "name") => descending ? ordered!.ThenByDescending(byName) : ordered!.ThenBy(byName),
                (false, "category") => descending ? ordered!.ThenByDescending(byCategory) : ordered!.ThenBy(byCategory),
                (false, "brand") => descending ? ordered!.ThenByDescending(byBrand) : ordered!.ThenBy(byBrand),
                (false, "price") => descending ? ordered!.ThenByDescending(byPrice) : ordered!.ThenBy(byPrice),
                _ => ordered ?? query.OrderBy(byNumber)
            };
        }

        return ordered ?? query.OrderBy(byNumber);
    }
}

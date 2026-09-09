using System.Globalization;
using System.Linq.Expressions;
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class ArticleQueries(BarDbContext dbContext) : IArticleQueries
{
    public async Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var query = dbContext.Articles.Where(a => a.SellerId == sellerId);
        query = ApplyBrandCategoryFilters(query, brand, category);
        query = await ApplySearchFilterAsync(query, search, cancellationToken);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await ApplySort(
                query, sort,
                a => a.Number, a => a.Name, a => a.Category, a => a.Brand, a => a.Price)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ArticleSearchPage(items, totalCount);
    }

    public async Task<ArticleAdminSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        int page, int pageSize, string? sort, CancellationToken cancellationToken)
    {
        var articleQuery = dbContext.Articles.AsQueryable();
        if (sellerId is not null) articleQuery = articleQuery.Where(a => a.SellerId == sellerId);
        articleQuery = ApplyBrandCategoryFilters(articleQuery, brand, category);

        // Abweichung vom Brief: siehe GetNumberMatchingArticleIdsAsync unten -
        // der Number-Teil des Suchbegriffs kann nicht per EF.Functions.ILike
        // uebersetzt werden, daher hier vorab ermittelt (auf demselben
        // brand/category/sellerId-gefilterten Ausschnitt).
        HashSet<string>? numberMatchIds = null;
        if (!string.IsNullOrWhiteSpace(search))
        {
            numberMatchIds = await GetNumberMatchingArticleIdsAsync(articleQuery, search, cancellationToken);
        }

        // Abweichung vom Brief: statt "select new { Article, Seller }" +
        // spaeter erneutem .Join() gegen das schon gejoindete IQueryable
        // (Brief-Vorschlag), bleibt hier alles EINE anonyme Join-Projektion,
        // auf der Where/OrderBy/Skip/Take direkt aufsetzen. Ein Zwischenschritt
        // "select new JoinedRow(a, s)" (eigener Record) wurde bewusst NICHT
        // verwendet: empirisch mit dem echten Postgres-Testcontainer fuehrt
        // das dazu, dass EF Core 10/Npgsql 10.0.3 Mitgliederzugriffe wie
        // `x.Article.Id` bzw. `x.Article.Number` in einem nachfolgenden
        // Where/OrderBy nicht mehr uebersetzen kann ("could not be
        // translated" - Details in task-7-report.md). Die anonyme Projektion
        // (Transparent Identifier) bleibt dagegen durchgehend uebersetzbar.
        var joined =
            from a in articleQuery
            join s in dbContext.Sellers on a.SellerId equals s.Id
            select new { Article = a, Seller = s };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            joined = joined.Where(x =>
                numberMatchIds!.Contains(x.Article.Id) ||
                EF.Functions.ILike(x.Article.Name, term) ||
                EF.Functions.ILike(x.Article.Category, term) ||
                EF.Functions.ILike(x.Article.Brand, term) ||
                EF.Functions.ILike(x.Seller.FirstName, term) ||
                EF.Functions.ILike(x.Seller.LastName, term));
        }

        var totalCount = await joined.CountAsync(cancellationToken);

        var pageItems = await ApplySort(
                joined, sort,
                x => x.Article.Number, x => x.Article.Name, x => x.Article.Category, x => x.Article.Brand, x => x.Article.Price)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);

        var sellerIds = pageItems.Select(x => x.Seller.Id).Distinct().ToList();
        var startNumbers = await dbContext.NumberBlocks
            .Where(b => sellerIds.Contains(b.SellerId))
            .GroupBy(b => b.SellerId)
            .Select(g => new { SellerId = g.Key, StartNumber = g.Min(b => b.FromNumber) })
            .ToDictionaryAsync(x => x.SellerId, x => x.StartNumber, cancellationToken);

        var result = pageItems
            .Select(x => new ArticleWithSeller(
                x.Article, x.Seller.Id, startNumbers.GetValueOrDefault(x.Seller.Id), x.Seller.FirstName, x.Seller.LastName))
            .ToList();

        return new ArticleAdminSearchPage(result, totalCount);
    }

    private static IQueryable<Article> ApplyBrandCategoryFilters(IQueryable<Article> query, string? brand, string? category)
    {
        if (!string.IsNullOrWhiteSpace(brand)) query = query.Where(a => a.Brand == brand);
        if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);
        return query;
    }

    private static async Task<IQueryable<Article>> ApplySearchFilterAsync(
        IQueryable<Article> query, string? search, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(search)) return query;

        var term = $"%{search.Trim()}%";
        var numberMatchIds = await GetNumberMatchingArticleIdsAsync(query, search, cancellationToken);

        return query.Where(a =>
            numberMatchIds.Contains(a.Id) ||
            EF.Functions.ILike(a.Name, term) ||
            EF.Functions.ILike(a.Category, term) ||
            EF.Functions.ILike(a.Brand, term));
    }

    /// <summary>
    /// Abweichung vom Brief: <c>EF.Functions.ILike(a.Number.ToString(), term)</c>
    /// wirft zur Laufzeit eine <see cref="InvalidOperationException"/>
    /// ("could not be translated") - der EF-Core/Npgsql-10.0.3-Provider
    /// uebersetzt <c>int.ToString()</c> innerhalb eines LINQ-Praedikats nicht
    /// in SQL (empirisch mit dem echten Postgres-Testcontainer verifiziert,
    /// siehe task-7-report.md). Deshalb wird der Number-Teilstring-Abgleich
    /// hier separat behandelt: die (bereits durch brand/category/sellerId
    /// eingeschraenkten) Kandidaten werden nur mit Id+Number geladen und der
    /// Teilstring-Vergleich lokal in-memory ausgefuehrt - fuer den
    /// Basar-Datenumfang (siehe Brief, Abschnitt "Vereinfachung") unkritisch.
    /// Die passenden Ids fliessen danach wieder in ein server-seitiges
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

    /// <summary>
    /// Generischer Sort-Helfer fuer <c>IQueryable&lt;Article&gt;</c> (mine) und
    /// die anonyme Join-Projektion (admin). Die Feld-Selektoren werden vom
    /// Aufrufer als Expression uebergeben, damit der generische Parameter
    /// <typeparamref name="T"/> (bei Admin: der anonyme Join-Typ) nur am
    /// Aufrufort - wo der konkrete Typ bekannt ist - aufgeloest werden muss.
    /// Das vermeidet sowohl das Problem, einen anonymen Typ in C# explizit zu
    /// benennen, als auch den EF-Uebersetzungsfehler bei eigenen Records
    /// (siehe SearchAllAsync).
    /// </summary>
    private static IQueryable<T> ApplySort<T>(
        IQueryable<T> query, string? sort,
        Expression<Func<T, int>> byNumber,
        Expression<Func<T, string>> byName,
        Expression<Func<T, string>> byCategory,
        Expression<Func<T, string>> byBrand,
        Expression<Func<T, decimal>> byPrice)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return query.OrderBy(byNumber);
        }

        IOrderedQueryable<T>? ordered = null;
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

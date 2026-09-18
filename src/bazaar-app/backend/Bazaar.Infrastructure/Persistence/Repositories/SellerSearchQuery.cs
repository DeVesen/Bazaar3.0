using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Backs GET /api/sellers/search (spec.md://api/cross-cutting.md §6).
/// Search rules: token-decompose the incoming query on spaces, each token
/// must match (case-insensitively, substring) at least one of
/// FirstName/LastName/Id (OR across fields), and every token must find a
/// match somewhere, independently (AND across tokens). Empty/whitespace
/// query returns all sellers, not paginated.
///
/// Design decision: filtering happens client-side (after materializing the
/// candidate rows) via string.Contains(..., StringComparison.OrdinalIgnoreCase)
/// rather than EF.Functions.ILike. There is no prior ILIKE usage anywhere in
/// this codebase to follow as precedent, whereas OrdinalIgnoreCase is the
/// established case-insensitivity idiom in the Application layer (see e.g.
/// GetBrandsHandler/UpdateBrandHandler). It also keeps this query provider-
/// agnostic, matching the existing Infrastructure test convention of
/// UseInMemoryDatabase (the InMemory provider cannot translate
/// EF.Functions.ILike, which is Npgsql-specific). The seller list size in
/// this domain (a single Basar's sellers) makes the lack of DB-side
/// filtering a non-issue.
/// </summary>
public sealed class SellerSearchQuery(BazaarDbContext dbContext) : ISellerSearchQuery
{
    public async Task<IReadOnlyList<SellerSearchResult>> Search(string? q)
    {
        var sellers = await (
            from seller in dbContext.Sellers
            join sellerType in dbContext.SellerTypes on seller.SellerTypeId equals sellerType.Id
            select new SellerSearchResult(seller.Id, seller.FirstName, seller.LastName, seller.City, sellerType.Name))
            .ToListAsync();

        var tokens = SellerTokenSearch.Tokenize(q);

        if (tokens.Length == 0)
        {
            return sellers;
        }

        return sellers
            .Where(s => SellerTokenSearch.Matches(tokens, s.FirstName, s.LastName, s.Id))
            .ToList();
    }
}

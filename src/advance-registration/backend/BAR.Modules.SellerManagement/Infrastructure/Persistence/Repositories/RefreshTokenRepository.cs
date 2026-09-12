using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.SellerManagement.Infrastructure.Persistence.Repositories;

public sealed class RefreshTokenRepository(SellerManagementDbContext dbContext) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

    public async Task AddAsync(RefreshToken token, CancellationToken cancellationToken)
    {
        dbContext.RefreshTokens.Add(token);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens.Where(t => t.Id == id).ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteExpiredForSellerAsync(string sellerId, DateTime nowUtc, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens
            .Where(t => t.SellerId == sellerId && t.ExpiresAt < nowUtc)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        await dbContext.RefreshTokens.Where(t => t.SellerId == sellerId).ExecuteDeleteAsync(cancellationToken);
    }

    public Task<int> CountActiveForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        dbContext.RefreshTokens.CountAsync(t => t.SellerId == sellerId, cancellationToken);

    public async Task DeleteOldestForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        var oldest = await dbContext.RefreshTokens
            .Where(t => t.SellerId == sellerId)
            .OrderBy(t => t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (oldest is not null)
        {
            dbContext.RefreshTokens.Remove(oldest);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}

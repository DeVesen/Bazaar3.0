using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerRepository(BarDbContext dbContext) : ISellerRepository
{
    public Task<Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Email == email, cancellationToken);

    public Task<Seller?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Id == id, cancellationToken);

    public async Task AddAsync(Seller seller, CancellationToken cancellationToken)
    {
        dbContext.Sellers.Add(seller);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

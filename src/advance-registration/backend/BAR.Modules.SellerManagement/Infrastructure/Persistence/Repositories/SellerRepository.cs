using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BAR.Modules.SellerManagement.Infrastructure.Persistence.Repositories;

public sealed class SellerRepository(SellerManagementDbContext dbContext) : ISellerRepository
{
    public Task<Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Email == email, cancellationToken);

    public Task<Seller?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Id == id, cancellationToken);

    public Task<Seller?> GetByInviteTokenAsync(string inviteToken, CancellationToken cancellationToken) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.InviteToken == inviteToken, cancellationToken);

    public async Task<IReadOnlyList<Seller>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Sellers.ToListAsync(cancellationToken);

    public async Task AddAsync(Seller seller, CancellationToken cancellationToken)
    {
        dbContext.Sellers.Add(seller);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            // Two concurrent registrations with the same email: the upfront
            // check in the handler saw "free" both times, the unique index
            // decides. This is the same domain error, not a 500.
            dbContext.Entry(seller).State = EntityState.Detached;
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }
    }

    public async Task UpdateAsync(Seller seller, CancellationToken cancellationToken)
    {
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }
    }

    public async Task DeleteAsync(Seller seller, CancellationToken cancellationToken)
    {
        dbContext.Sellers.Remove(seller);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<int> CountAdminsAsync(CancellationToken cancellationToken) =>
        dbContext.Sellers.CountAsync(s => s.IsAdmin, cancellationToken);

    public Task<int> CountByTypeAsync(string sellerTypeId, CancellationToken cancellationToken) =>
        dbContext.Sellers.CountAsync(s => s.SellerTypeId == sellerTypeId, cancellationToken);
}

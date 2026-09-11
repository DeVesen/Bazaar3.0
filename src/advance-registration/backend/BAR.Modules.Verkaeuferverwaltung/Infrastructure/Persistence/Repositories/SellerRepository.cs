using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence.Repositories;

public sealed class SellerRepository(VerkaeuferverwaltungDbContext dbContext) : ISellerRepository
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
            // Zwei gleichzeitige Registrierungen mit derselben E-Mail: die
            // Vorab-Pruefung im Handler sah beide Male "frei", der eindeutige
            // Index entscheidet. Das ist derselbe Fachfehler, kein 500.
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

using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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

    public Task UpdateAsync(Seller seller, CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);
}

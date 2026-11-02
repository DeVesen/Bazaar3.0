using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class LabelSheetFormatRepository(BazaarDbContext dbContext) : ILabelSheetFormatRepository
{
    public async Task<IReadOnlyList<LabelSheetFormat>> GetAll() =>
        await dbContext.LabelSheetFormats.ToListAsync();

    public Task<LabelSheetFormat?> GetById(string id) =>
        dbContext.LabelSheetFormats.SingleOrDefaultAsync(f => f.Id == id);

    public Task<LabelSheetFormat?> FindByName(string name) =>
        dbContext.LabelSheetFormats.SingleOrDefaultAsync(f => f.Name == name);

    public async Task Add(LabelSheetFormat format)
    {
        await dbContext.LabelSheetFormats.AddAsync(format);
        try
        {
            await dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            dbContext.Entry(format).State = EntityState.Detached;
            throw new ConflictException("Bogenformat existiert bereits", LabelSheetFormat.NameTakenErrorCode);
        }
    }

    public async Task Update(LabelSheetFormat format)
    {
        dbContext.LabelSheetFormats.Update(format);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(LabelSheetFormat format)
    {
        dbContext.LabelSheetFormats.Remove(format);
        await dbContext.SaveChangesAsync();
    }

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}

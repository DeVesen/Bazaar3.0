using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class LabelImageRepository(BazaarDbContext dbContext) : ILabelImageRepository
{
    public async Task<IReadOnlyList<LabelImageSummary>> GetSummaries()
    {
        // Projektion ohne DataUrl. Sortiert wird im Speicher (höchstens LabelImage.MaxCount Zeilen),
        // weil SQLite (Unit-Tests) DateTimeOffset nicht in ORDER BY kann.
        var summaries = await dbContext.LabelImages
            .AsNoTracking()
            .Select(i => new LabelImageSummary(i.Id, i.Name, i.MediaType, i.SizeBytes, i.CreatedAt))
            .ToListAsync();
        return summaries.OrderByDescending(s => s.CreatedAt).ThenByDescending(s => s.Id, StringComparer.Ordinal).ToList();
    }

    public Task<LabelImage?> GetById(string id) =>
        dbContext.LabelImages.SingleOrDefaultAsync(i => i.Id == id);

    public Task<LabelImage?> FindByHash(string contentHash) =>
        dbContext.LabelImages.SingleOrDefaultAsync(i => i.ContentHash == contentHash);

    public Task<int> Count() => dbContext.LabelImages.CountAsync();

    public async Task<LabelImage> Add(LabelImage image)
    {
        await dbContext.LabelImages.AddAsync(image);
        try
        {
            await dbContext.SaveChangesAsync();
            return image;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            dbContext.Entry(image).State = EntityState.Detached;
            var winner = await FindByHash(image.ContentHash);
            if (winner is null) throw;
            return winner;
        }
    }

    public async Task Remove(LabelImage image)
    {
        dbContext.LabelImages.Remove(image);
        await dbContext.SaveChangesAsync();
    }

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
}

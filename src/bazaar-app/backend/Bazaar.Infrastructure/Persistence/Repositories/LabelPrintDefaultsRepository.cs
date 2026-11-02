using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class LabelPrintDefaultsRepository(BazaarDbContext dbContext) : ILabelPrintDefaultsRepository
{
    public Task<LabelPrintDefaults?> Find() =>
        dbContext.LabelPrintDefaults.SingleOrDefaultAsync(d => d.Id == LabelPrintDefaults.FixedId);

    public async Task Add(LabelPrintDefaults defaults)
    {
        await dbContext.LabelPrintDefaults.AddAsync(defaults);
        await dbContext.SaveChangesAsync();
    }

    public async Task Update(LabelPrintDefaults defaults)
    {
        dbContext.LabelPrintDefaults.Update(defaults);
        await dbContext.SaveChangesAsync();
    }
}

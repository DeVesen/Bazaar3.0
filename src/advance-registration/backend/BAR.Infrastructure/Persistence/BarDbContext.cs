using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence;

public sealed class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
}

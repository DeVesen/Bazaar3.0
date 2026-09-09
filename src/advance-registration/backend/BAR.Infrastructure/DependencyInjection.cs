using BAR.Application.Abstractions;
using BAR.Infrastructure.Persistence;
using BAR.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Infrastructure;

/// <summary>
/// Einziger Ort, an dem Adapter registriert werden. BAR.Host ruft nur
/// <see cref="AddInfrastructure"/> und kennt keine Adapter-Typen.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();

        // Persistenz (BarDbContext, Repositories, Query-Ports) kommt mit VPROJ-S04.
        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IClock, SystemClock>();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<BarDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddHealthChecks()
            .AddDbContextCheck<BarDbContext>("database", tags: ["ready"]);

        return services;
    }
}

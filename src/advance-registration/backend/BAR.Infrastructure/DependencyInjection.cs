using BAR.Application.Abstractions;
using BAR.Domain.Ports;
using BAR.Infrastructure.Persistence;
using BAR.Infrastructure.Persistence.Repositories;
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
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IClock, SystemClock>();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<BarDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddHealthChecks()
            .AddDbContextCheck<BarDbContext>("database", tags: ["ready"]);

        services.AddScoped<ISellerRepository, SellerRepository>();
        services.AddScoped<ISellerTypeRepository, SellerTypeRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<INumberBlockRepository, NumberBlockRepository>();

        return services;
    }
}

using BAR.Application.Abstractions;
using BAR.Infrastructure.Time;
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
}

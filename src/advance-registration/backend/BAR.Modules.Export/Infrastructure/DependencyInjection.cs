using BAR.Modules.Export.Application;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Export.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddExportModule(this IServiceCollection services)
    {
        services.AddScoped<GetExportQueryHandler>();
        return services;
    }
}

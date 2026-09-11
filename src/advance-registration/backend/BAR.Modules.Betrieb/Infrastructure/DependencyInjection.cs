using BAR.Modules.Betrieb.Application;
using BAR.Modules.Betrieb.Application.PublicInfo;
using BAR.Modules.Betrieb.Application.Settings.GetSettings;
using BAR.Modules.Betrieb.Application.Settings.Update;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;
using BAR.Modules.Betrieb.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Betrieb.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddBetriebModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<BetriebDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default"), npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<ISettingsRepository, SettingsRepository>();

        services.AddScoped<GetSettingsQueryHandler>();
        services.AddScoped<UpdateSettingsCommandHandler>();
        services.AddScoped<GetPublicInfoQueryHandler>();

        services.AddScoped<IValidator<UpdateSettingsCommand>, UpdateSettingsCommandValidator>();

        services.AddScoped<IBetriebModuleApi, BetriebModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<BetriebDbContext>("betrieb-db", tags: ["ready"]);

        return services;
    }
}

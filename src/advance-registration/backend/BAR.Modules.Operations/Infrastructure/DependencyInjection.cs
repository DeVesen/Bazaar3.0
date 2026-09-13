using BAR.Modules.Operations.Application;
using BAR.Modules.Operations.Application.PublicInfo;
using BAR.Modules.Operations.Application.Settings.GetSettings;
using BAR.Modules.Operations.Application.Settings.Update;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.Operations.Domain.Ports;
using BAR.Modules.Operations.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Operations.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddOperationsModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<OperationsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"), npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<ISettingsRepository, SettingsRepository>();

        services.AddScoped<GetSettingsQueryHandler>();
        services.AddScoped<UpdateSettingsCommandHandler>();
        services.AddScoped<GetPublicInfoQueryHandler>();

        services.AddScoped<IValidator<UpdateSettingsCommand>, UpdateSettingsCommandValidator>();

        services.AddScoped<IOperationsModuleApi, OperationsModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<OperationsDbContext>("operations-db", tags: ["ready"]);

        return services;
    }
}

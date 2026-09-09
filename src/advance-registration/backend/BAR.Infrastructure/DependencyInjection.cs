using BAR.Application.Abstractions;
using BAR.Application.Auth.Login;
using BAR.Application.Auth.Refresh;
using BAR.Application.Articles.Create;
using BAR.Application.Articles.GetMine;
using BAR.Application.Articles.GetNextNumber;
using BAR.Application.Auth.Register;
using BAR.Application.Blocks.GetMine;
using BAR.Application.Profile.GetProfile;
using BAR.Application.Profile.UpdateProfile;
using BAR.Application.Public.GetInfo;
using BAR.Domain.Ports;
using BAR.Domain.Ports.Queries;
using BAR.Infrastructure.Persistence;
using BAR.Infrastructure.Persistence.Queries;
using BAR.Infrastructure.Persistence.Repositories;
using BAR.Infrastructure.Time;
using FluentValidation;
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

        services.AddScoped<IUnitOfWork, EfUnitOfWork>();
        services.AddScoped<ISellerRepository, SellerRepository>();
        services.AddScoped<ISellerTypeRepository, SellerTypeRepository>();
        services.AddScoped<ISettingsRepository, SettingsRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<INumberBlockRepository, NumberBlockRepository>();
        services.AddScoped<IArticleRepository, ArticleRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IArticleQueries, ArticleQueries>();

        services.Configure<Security.JwtOptions>(configuration.GetSection(Security.JwtOptions.SectionName));
        services.AddSingleton<IPasswordHasher, Security.BCryptPasswordHasher>();
        services.AddSingleton<ITokenIssuer, Security.JwtTokenIssuer>();

        services.AddScoped<RegisterCommandHandler>();
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshCommandHandler>();
        services.AddScoped<GetPublicInfoQueryHandler>();
        services.AddScoped<GetMyBlocksQueryHandler>();
        services.AddScoped<GetProfileQueryHandler>();
        services.AddScoped<UpdateProfileCommandHandler>();
        services.AddScoped<CreateArticleCommandHandler>();
        services.AddScoped<GetNextNumberQueryHandler>();
        services.AddScoped<GetMyArticlesQueryHandler>();
        services.AddScoped<IValidator<RegisterCommand>, RegisterCommandValidator>();
        services.AddScoped<IValidator<LoginCommand>, LoginCommandValidator>();
        services.AddScoped<IValidator<RefreshCommand>, RefreshCommandValidator>();
        services.AddScoped<IValidator<UpdateProfileCommand>, UpdateProfileCommandValidator>();
        services.AddScoped<IValidator<CreateArticleCommand>, CreateArticleCommandValidator>();

        return services;
    }
}

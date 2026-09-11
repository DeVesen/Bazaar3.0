using BAR.Modules.Verkaeuferverwaltung.Application;
using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Login;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Refresh;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Register;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.SetPassword;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangeEmail;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangePassword;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.DeleteProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.GetProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.UpdateProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Create;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Delete;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Invite;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.List;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Update;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Security;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence;
using BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence.Repositories;
using BAR.Modules.Verkaeuferverwaltung.Infrastructure.Security;
using BAR.SharedKernel;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddVerkaeuferverwaltungModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddSingleton<IClock, SystemClock>();

        services.AddDbContext<VerkaeuferverwaltungDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default"), npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<ISellerRepository, SellerRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>();

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<ITokenIssuer, JwtTokenIssuer>();

        services.AddScoped<ISellerCascadeDeleter, SellerCascadeDeleter>();
        services.AddScoped<SellerBlockAllocationCoordinator>();

        services.AddScoped<RegisterCommandHandler>();
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshCommandHandler>();
        services.AddScoped<SetPasswordCommandHandler>();
        services.AddScoped<GetSellersQueryHandler>();
        services.AddScoped<CreateSellerCommandHandler>();
        services.AddScoped<UpdateSellerCommandHandler>();
        services.AddScoped<DeleteSellerCommandHandler>();
        services.AddScoped<InviteSellerCommandHandler>();
        services.AddScoped<GetProfileQueryHandler>();
        services.AddScoped<UpdateProfileCommandHandler>();
        services.AddScoped<ChangeEmailCommandHandler>();
        services.AddScoped<ChangePasswordCommandHandler>();
        services.AddScoped<DeleteProfileCommandHandler>();

        services.AddScoped<IValidator<Contracts.Auth.RegisterCommand>, RegisterCommandValidator>();
        services.AddScoped<IValidator<Contracts.Auth.LoginCommand>, LoginCommandValidator>();
        services.AddScoped<IValidator<Contracts.Auth.RefreshCommand>, RefreshCommandValidator>();
        services.AddScoped<IValidator<Contracts.Auth.SetPasswordCommand>, SetPasswordCommandValidator>();
        services.AddScoped<IValidator<Contracts.Sellers.CreateSellerCommand>, CreateSellerCommandValidator>();
        services.AddScoped<IValidator<Contracts.Sellers.UpdateSellerCommand>, UpdateSellerCommandValidator>();
        services.AddScoped<IValidator<Contracts.Profile.UpdateProfileCommand>, UpdateProfileCommandValidator>();
        services.AddScoped<IValidator<Contracts.Profile.ChangeEmailCommand>, ChangeEmailCommandValidator>();
        services.AddScoped<IValidator<Contracts.Profile.ChangePasswordCommand>, ChangePasswordCommandValidator>();

        services.AddScoped<IVerkaeuferverwaltungModuleApi, VerkaeuferverwaltungModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<VerkaeuferverwaltungDbContext>("verkaeuferverwaltung-db", tags: ["ready"]);

        return services;
    }
}

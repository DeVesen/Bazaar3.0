using BAR.Modules.SellerManagement.Application;
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Auth.Login;
using BAR.Modules.SellerManagement.Application.Auth.Refresh;
using BAR.Modules.SellerManagement.Application.Auth.Register;
using BAR.Modules.SellerManagement.Application.Auth.SetPassword;
using BAR.Modules.SellerManagement.Application.Profile.ChangeEmail;
using BAR.Modules.SellerManagement.Application.Profile.ChangePassword;
using BAR.Modules.SellerManagement.Application.Profile.DeleteProfile;
using BAR.Modules.SellerManagement.Application.Profile.GetProfile;
using BAR.Modules.SellerManagement.Application.Profile.UpdateProfile;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Application.Sellers.Create;
using BAR.Modules.SellerManagement.Application.Sellers.Delete;
using BAR.Modules.SellerManagement.Application.Sellers.Invite;
using BAR.Modules.SellerManagement.Application.Sellers.List;
using BAR.Modules.SellerManagement.Application.Sellers.Update;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Security;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Infrastructure.Persistence;
using BAR.Modules.SellerManagement.Infrastructure.Persistence.Repositories;
using BAR.Modules.SellerManagement.Infrastructure.Security;
using BAR.SharedKernel;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.SellerManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSellerManagementModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddSingleton<IClock, SystemClock>();

        services.AddDbContext<SellerManagementDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"), npgsql => npgsql.EnableRetryOnFailure(3)));

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

        services.AddScoped<ISellerManagementModuleApi, SellerManagementModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<SellerManagementDbContext>("sellerManagement-db", tags: ["ready"]);

        return services;
    }
}

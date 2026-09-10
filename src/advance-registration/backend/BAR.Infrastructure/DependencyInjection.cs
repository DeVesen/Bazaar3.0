using BAR.Application.Abstractions;
using BAR.Application.Auth.Login;
using BAR.Application.Auth.Refresh;
using BAR.Application.Articles.Create;
using BAR.Application.Articles.Delete;
using BAR.Application.Articles.GetAll;
using BAR.Application.Articles.GetById;
using BAR.Application.Articles.GetMine;
using BAR.Application.Articles.GetNextNumber;
using BAR.Application.Articles.Update;
using BAR.Application.Auth.Register;
using BAR.Application.Blocks.Delete;
using BAR.Application.Blocks.GetMine;
using BAR.Application.Blocks.NextFree;
using BAR.Application.Blocks.Reserve;
using BAR.Application.MasterData.Brands.Create;
using BAR.Application.MasterData.Brands.Delete;
using BAR.Application.MasterData.Brands.GetAll;
using BAR.Application.MasterData.Brands.Update;
using BAR.Application.MasterData.Categories.Create;
using BAR.Application.MasterData.Categories.Delete;
using BAR.Application.MasterData.Categories.GetAll;
using BAR.Application.MasterData.Categories.Update;
using BAR.Application.Profile.ChangeEmail;
using BAR.Application.Profile.ChangePassword;
using BAR.Application.Profile.DeleteProfile;
using BAR.Application.Profile.GetProfile;
using BAR.Application.Profile.UpdateProfile;
using BAR.Application.Public.GetInfo;
using BAR.Application.Sellers.Invite;
using BAR.Application.Sellers.List;
using BAR.Application.SellerTypes.Create;
using BAR.Application.SellerTypes.Delete;
using BAR.Application.SellerTypes.GetAll;
using BAR.Application.SellerTypes.Update;
using BAR.Application.Settings.GetSettings;
using BAR.Application.Settings.Update;
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
        services.AddScoped<ISellerListQuery, SellerListQuery>();
        services.AddScoped<IHomeQueries, HomeQueries>();

        services.Configure<Security.JwtOptions>(configuration.GetSection(Security.JwtOptions.SectionName));
        services.AddSingleton<IPasswordHasher, Security.BCryptPasswordHasher>();
        services.AddSingleton<ITokenIssuer, Security.JwtTokenIssuer>();

        services.AddScoped<RegisterCommandHandler>();
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshCommandHandler>();
        services.AddScoped<GetPublicInfoQueryHandler>();
        services.AddScoped<GetMyBlocksQueryHandler>();
        services.AddScoped<GetNextFreeQueryHandler>();
        services.AddScoped<ReserveBlocksCommandHandler>();
        services.AddScoped<IValidator<ReserveBlocksCommand>, ReserveBlocksCommandValidator>();
        services.AddScoped<DeleteBlockCommandHandler>();
        services.AddScoped<GetProfileQueryHandler>();
        services.AddScoped<UpdateProfileCommandHandler>();
        services.AddScoped<CreateArticleCommandHandler>();
        services.AddScoped<GetNextNumberQueryHandler>();
        services.AddScoped<GetMyArticlesQueryHandler>();
        services.AddScoped<UpdateArticleCommandHandler>();
        services.AddScoped<IValidator<UpdateArticleCommand>, UpdateArticleCommandValidator>();
        services.AddScoped<DeleteArticleCommandHandler>();
        services.AddScoped<GetAllArticlesQueryHandler>();
        services.AddScoped<GetArticleByIdQueryHandler>();
        services.AddScoped<IValidator<RegisterCommand>, RegisterCommandValidator>();
        services.AddScoped<IValidator<LoginCommand>, LoginCommandValidator>();
        services.AddScoped<IValidator<RefreshCommand>, RefreshCommandValidator>();
        services.AddScoped<IValidator<UpdateProfileCommand>, UpdateProfileCommandValidator>();
        services.AddScoped<ChangeEmailCommandHandler>();
        services.AddScoped<IValidator<ChangeEmailCommand>, ChangeEmailCommandValidator>();
        services.AddScoped<ChangePasswordCommandHandler>();
        services.AddScoped<IValidator<ChangePasswordCommand>, ChangePasswordCommandValidator>();
        services.AddScoped<DeleteProfileCommandHandler>();
        services.AddScoped<IValidator<CreateArticleCommand>, CreateArticleCommandValidator>();
        services.AddScoped<GetAllBrandsQueryHandler>();
        services.AddScoped<CreateBrandCommandHandler>();
        services.AddScoped<IValidator<CreateBrandCommand>, CreateBrandCommandValidator>();
        services.AddScoped<UpdateBrandCommandHandler>();
        services.AddScoped<IValidator<UpdateBrandCommand>, UpdateBrandCommandValidator>();
        services.AddScoped<DeleteBrandCommandHandler>();
        services.AddScoped<GetAllCategoriesQueryHandler>();
        services.AddScoped<CreateCategoryCommandHandler>();
        services.AddScoped<IValidator<CreateCategoryCommand>, CreateCategoryCommandValidator>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<IValidator<UpdateCategoryCommand>, UpdateCategoryCommandValidator>();
        services.AddScoped<DeleteCategoryCommandHandler>();
        services.AddScoped<GetAllSellerTypesQueryHandler>();
        services.AddScoped<GetSettingsQueryHandler>();
        services.AddScoped<UpdateSettingsCommandHandler>();
        services.AddScoped<IValidator<UpdateSettingsCommand>, UpdateSettingsCommandValidator>();
        services.AddScoped<CreateSellerTypeCommandHandler>();
        services.AddScoped<IValidator<CreateSellerTypeCommand>, CreateSellerTypeCommandValidator>();
        services.AddScoped<UpdateSellerTypeCommandHandler>();
        services.AddScoped<IValidator<UpdateSellerTypeCommand>, UpdateSellerTypeCommandValidator>();
        services.AddScoped<DeleteSellerTypeCommandHandler>();
        services.AddScoped<GetSellersQueryHandler>();
        services.AddScoped<BAR.Application.Sellers.Create.CreateSellerCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Sellers.Create.CreateSellerCommand>, BAR.Application.Sellers.Create.CreateSellerCommandValidator>();
        services.AddScoped<BAR.Application.Sellers.Update.UpdateSellerCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Sellers.Update.UpdateSellerCommand>, BAR.Application.Sellers.Update.UpdateSellerCommandValidator>();
        services.AddScoped<BAR.Application.Sellers.ISellerCascadeDeleter, BAR.Application.Sellers.SellerCascadeDeleter>();
        services.AddScoped<BAR.Application.Sellers.Delete.DeleteSellerCommandHandler>();
        services.AddScoped<BAR.Application.Sellers.Invite.InviteSellerCommandHandler>();
        services.AddScoped<BAR.Application.Auth.SetPassword.SetPasswordCommandHandler>();
        services.AddScoped<IValidator<BAR.Application.Auth.SetPassword.SetPasswordCommand>, BAR.Application.Auth.SetPassword.SetPasswordCommandValidator>();

        return services;
    }
}

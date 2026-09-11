using BAR.Modules.Stammdaten.Application;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Create;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Delete;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.GetAll;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Update;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Create;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Delete;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.GetAll;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Update;
using BAR.Modules.Stammdaten.Application.SellerTypes.Create;
using BAR.Modules.Stammdaten.Application.SellerTypes.Delete;
using BAR.Modules.Stammdaten.Application.SellerTypes.GetAll;
using BAR.Modules.Stammdaten.Application.SellerTypes.Update;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Stammdaten.Infrastructure.Persistence;
using BAR.Modules.Stammdaten.Infrastructure.Persistence.Repositories;
using BAR.SharedKernel.Events;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.Stammdaten.Infrastructure;

/// <summary>
/// Verdrahtet das Modul Stammdaten selbst - der Host ruft nur diese eine
/// Erweiterung auf (dotnet-modulith-bridge).
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddStammdatenModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

        services.AddDbContext<StammdatenDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default"), npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ISellerTypeRepository, SellerTypeRepository>();

        services.AddScoped<CreateBrandCommandHandler>();
        services.AddScoped<UpdateBrandCommandHandler>();
        services.AddScoped<DeleteBrandCommandHandler>();
        services.AddScoped<GetAllBrandsQueryHandler>();
        services.AddScoped<CreateCategoryCommandHandler>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<DeleteCategoryCommandHandler>();
        services.AddScoped<GetAllCategoriesQueryHandler>();
        services.AddScoped<CreateSellerTypeCommandHandler>();
        services.AddScoped<UpdateSellerTypeCommandHandler>();
        services.AddScoped<DeleteSellerTypeCommandHandler>();
        services.AddScoped<GetAllSellerTypesQueryHandler>();

        services.AddScoped<IValidator<Contracts.MasterData.CreateBrandCommand>, CreateBrandCommandValidator>();
        services.AddScoped<IValidator<Contracts.MasterData.UpdateBrandCommand>, UpdateBrandCommandValidator>();
        services.AddScoped<IValidator<Contracts.MasterData.CreateCategoryCommand>, CreateCategoryCommandValidator>();
        services.AddScoped<IValidator<Contracts.MasterData.UpdateCategoryCommand>, UpdateCategoryCommandValidator>();
        services.AddScoped<IValidator<Contracts.SellerTypes.CreateSellerTypeCommand>, CreateSellerTypeCommandValidator>();
        services.AddScoped<IValidator<Contracts.SellerTypes.UpdateSellerTypeCommand>, UpdateSellerTypeCommandValidator>();

        services.AddScoped<IStammdatenModuleApi, StammdatenModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<StammdatenDbContext>("stammdaten-db", tags: ["ready"]);

        return services;
    }
}

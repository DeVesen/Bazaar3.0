using BAR.Modules.MasterData.Application;
using BAR.Modules.MasterData.Application.Catalog.Brands.Create;
using BAR.Modules.MasterData.Application.Catalog.Brands.Delete;
using BAR.Modules.MasterData.Application.Catalog.Brands.GetAll;
using BAR.Modules.MasterData.Application.Catalog.Brands.Update;
using BAR.Modules.MasterData.Application.Catalog.Categories.Create;
using BAR.Modules.MasterData.Application.Catalog.Categories.Delete;
using BAR.Modules.MasterData.Application.Catalog.Categories.GetAll;
using BAR.Modules.MasterData.Application.Catalog.Categories.Update;
using BAR.Modules.MasterData.Application.SellerTypes.Create;
using BAR.Modules.MasterData.Application.SellerTypes.Delete;
using BAR.Modules.MasterData.Application.SellerTypes.GetAll;
using BAR.Modules.MasterData.Application.SellerTypes.Update;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Infrastructure.Persistence;
using BAR.Modules.MasterData.Infrastructure.Persistence.Repositories;
using BAR.SharedKernel.Events;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.MasterData.Infrastructure;

/// <summary>
/// Wires up the MasterData module itself - the host only calls this one
/// extension (dotnet-modulith-bridge).
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddMasterDataModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddScoped<IDomainEventDispatcher, DomainEventDispatcher>();

        services.AddDbContext<MasterDataDbContext>(options =>
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

        services.AddScoped<IMasterDataModuleApi, MasterDataModuleApi>();

        services.AddHealthChecks().AddDbContextCheck<MasterDataDbContext>("masterData-db", tags: ["ready"]);

        return services;
    }
}

using BAR.Modules.Registration.Application;
using BAR.Modules.Registration.Application.Articles.Create;
using BAR.Modules.Registration.Application.Articles.Delete;
using BAR.Modules.Registration.Application.Articles.GetAll;
using BAR.Modules.Registration.Application.Articles.GetById;
using BAR.Modules.Registration.Application.Articles.GetMine;
using BAR.Modules.Registration.Application.Articles.GetNextNumber;
using BAR.Modules.Registration.Application.Articles.Update;
using BAR.Modules.Registration.Application.Blocks;
using BAR.Modules.Registration.Application.Blocks.Delete;
using BAR.Modules.Registration.Application.Blocks.GetForSeller;
using BAR.Modules.Registration.Application.Blocks.GetMine;
using BAR.Modules.Registration.Application.Blocks.NextFree;
using BAR.Modules.Registration.Application.Blocks.Reserve;
using BAR.Modules.Registration.Application.EventHandlers;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Registration.Domain.Ports.Queries;
using BAR.Modules.Registration.Infrastructure.Persistence;
using BAR.Modules.Registration.Infrastructure.Persistence.Queries;
using BAR.Modules.Registration.Infrastructure.Persistence.Repositories;
using BAR.Modules.MasterData.Contracts.Events;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.Registration.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddRegistrationModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddSingleton<IClock, SystemClock>();

        services.AddDbContext<RegistrationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"), npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<IArticleRepository, ArticleRepository>();
        services.AddScoped<INumberBlockRepository, NumberBlockRepository>();
        services.AddScoped<IArticleQueries, ArticleQueries>();

        services.AddScoped<CreateArticleCommandHandler>();
        services.AddScoped<UpdateArticleCommandHandler>();
        services.AddScoped<DeleteArticleCommandHandler>();
        services.AddScoped<GetMyArticlesQueryHandler>();
        services.AddScoped<GetNextNumberQueryHandler>();
        services.AddScoped<GetAllArticlesQueryHandler>();
        services.AddScoped<GetArticleByIdQueryHandler>();
        services.AddScoped<GetMyBlocksQueryHandler>();
        services.AddScoped<GetBlocksForSellerQueryHandler>();
        services.AddScoped<GetNextFreeQueryHandler>();
        services.AddScoped<ReserveBlocksCommandHandler>();
        services.AddScoped<DeleteBlockCommandHandler>();
        services.AddScoped<AllocateInitialBlocksService>();

        services.AddScoped<IValidator<CreateArticleCommand>, CreateArticleCommandValidator>();
        services.AddScoped<IValidator<UpdateArticleCommand>, UpdateArticleCommandValidator>();
        services.AddScoped<IValidator<ReserveBlocksCommand>, ReserveBlocksCommandValidator>();

        services.AddScoped<IRegistrationModuleApi, RegistrationModuleApi>();

        services.AddScoped<IIntegrationEventHandler<BrandRenamed>, BrandRenamedHandler>();
        services.AddScoped<IIntegrationEventHandler<CategoryRenamed>, CategoryRenamedHandler>();

        services.AddHealthChecks().AddDbContextCheck<RegistrationDbContext>("registration-db", tags: ["ready"]);

        return services;
    }
}

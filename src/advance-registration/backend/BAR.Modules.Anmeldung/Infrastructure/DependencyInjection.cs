using BAR.Modules.Anmeldung.Application;
using BAR.Modules.Anmeldung.Application.Articles.Create;
using BAR.Modules.Anmeldung.Application.Articles.Delete;
using BAR.Modules.Anmeldung.Application.Articles.GetAll;
using BAR.Modules.Anmeldung.Application.Articles.GetById;
using BAR.Modules.Anmeldung.Application.Articles.GetMine;
using BAR.Modules.Anmeldung.Application.Articles.GetNextNumber;
using BAR.Modules.Anmeldung.Application.Articles.Update;
using BAR.Modules.Anmeldung.Application.Blocks;
using BAR.Modules.Anmeldung.Application.Blocks.Delete;
using BAR.Modules.Anmeldung.Application.Blocks.GetForSeller;
using BAR.Modules.Anmeldung.Application.Blocks.GetMine;
using BAR.Modules.Anmeldung.Application.Blocks.NextFree;
using BAR.Modules.Anmeldung.Application.Blocks.Reserve;
using BAR.Modules.Anmeldung.Application.EventHandlers;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Anmeldung.Domain.Ports.Queries;
using BAR.Modules.Anmeldung.Infrastructure.Persistence;
using BAR.Modules.Anmeldung.Infrastructure.Persistence.Queries;
using BAR.Modules.Anmeldung.Infrastructure.Persistence.Repositories;
using BAR.Modules.Stammdaten.Contracts.Events;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BAR.Modules.Anmeldung.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAnmeldungModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.TryAddSingleton<IClock, SystemClock>();

        services.AddDbContext<AnmeldungDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default"), npgsql => npgsql.EnableRetryOnFailure(3)));

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

        services.AddScoped<IAnmeldungModuleApi, AnmeldungModuleApi>();

        services.AddScoped<IIntegrationEventHandler<BrandRenamed>, BrandRenamedHandler>();
        services.AddScoped<IIntegrationEventHandler<CategoryRenamed>, CategoryRenamedHandler>();

        services.AddHealthChecks().AddDbContextCheck<AnmeldungDbContext>("anmeldung-db", tags: ["ready"]);

        return services;
    }
}

using Bazaar.Application.Brands;
using Bazaar.Application.Categories;
using Bazaar.Application.SellerTypes;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Auth;

/// <summary>
/// Setup wizard's single "Setup abschließen" call — creates the admin, seller types, brands and
/// categories the wizard collected across its steps, atomically. Reuses the same Create*Handlers
/// the regular admin-authenticated endpoints use (single source of truth for the name-conflict
/// rules), just run back-to-back inside one transaction instead of one call per wizard step —
/// the old per-step design left "Zurück" broken (the admin/seller-type was already persisted)
/// and a mid-wizard failure half set up.
/// </summary>
public sealed class CompleteSetupHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IIdGenerator idGenerator,
    AdminBootstrapState bootstrapState,
    CreateSellerTypeHandler createSellerTypeHandler,
    CreateBrandHandler createBrandHandler,
    CreateCategoryHandler createCategoryHandler,
    IUnitOfWork unitOfWork)
{
    public async Task Handle(CompleteSetupCommand command)
    {
        using var _ = await bootstrapState.AcquireBootstrapLockAsync();

        if (bootstrapState.HasAdmin || await userRepository.AnyAsync())
        {
            throw new ConflictException("Setup wurde bereits abgeschlossen", "bootstrap.already_done");
        }

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            var passwordHash = passwordHasher.Hash(command.Password);
            var admin = User.Create(idGenerator.Generate(), command.Username.Trim(), passwordHash, Role.Admin, mustChangePassword: false);
            await userRepository.Add(admin);

            foreach (var sellerType in command.SellerTypes)
            {
                await createSellerTypeHandler.Handle(new CreateSellerTypeCommand
                {
                    Name = sellerType.Name,
                    CommissionRate = sellerType.CommissionRate,
                    ItemFee = sellerType.ItemFee,
                });
            }

            foreach (var brandName in command.BrandNames)
            {
                await createBrandHandler.Handle(new CreateBrandCommand { Name = brandName, Original = true });
            }

            foreach (var categoryName in command.CategoryNames)
            {
                await createCategoryHandler.Handle(new CreateCategoryCommand { Name = categoryName, Original = true });
            }
        });

        bootstrapState.MarkAdminCreated();
    }
}

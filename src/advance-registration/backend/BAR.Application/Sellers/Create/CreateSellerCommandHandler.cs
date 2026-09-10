using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Sellers.Create;

public sealed class CreateSellerCommandHandler(
    ISellerRepository sellers, ISettingsRepository settingsRepository, INumberBlockRepository blocks)
{
    public async Task<SellerResponse> HandleAsync(CreateSellerCommand command, CancellationToken cancellationToken)
    {
        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new BAR.Domain.Exceptions.ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

        var seller = Seller.CreateByAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.AddAsync(seller, cancellationToken);

        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, seller.Id, command.BlockCount ?? settings.DefaultBlockCount,
            command.StartNumber ?? settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        return new SellerResponse(
            seller.Id, newBlocks.Count > 0 ? newBlocks[0].FromNumber : null, seller.FirstName, seller.LastName,
            seller.Address, seller.PostalCode, seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummary(seller.SellerTypeId, "", 0, 0), seller.IsAdmin, 0, false);
    }
}

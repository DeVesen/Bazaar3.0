using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Sellers.Create;

public sealed class CreateSellerCommandHandler(
    ISellerRepository sellers, IMasterDataModuleApi masterData, SellerBlockAllocationCoordinator blockCoordinator)
{
    public async Task<SellerDto> HandleAsync(CreateSellerCommand command, CancellationToken cancellationToken)
    {
        var conditions = await masterData.GetSellerTypeConditionsAsync(command.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var seller = Seller.CreateByAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.AddAsync(seller, cancellationToken);

        // Outside seller creation: number blocks live in the Registration
        // module (own schema) - see SellerBlockAllocationCoordinator. The
        // start number given by the admin is checked there against the
        // configured bazaar start number (check cascade stage 1,
        // api/blocks.md section 6).
        var newBlocks = await blockCoordinator.AllocateOrCompensateAsync(
            seller.Id, command.BlockCount, command.StartNumber, cancellationToken);

        return new SellerDto(
            seller.Id, newBlocks.Count > 0 ? newBlocks[0].FromNumber : null, seller.FirstName, seller.LastName,
            seller.Address, seller.PostalCode, seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummaryDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee),
            seller.IsAdmin, 0, false);
    }
}

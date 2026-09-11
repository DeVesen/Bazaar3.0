using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangeEmail;

public sealed class ChangeEmailCommandHandler(ISellerRepository sellers, IPasswordHasher passwordHasher)
{
    public async Task HandleAsync(string sellerId, ChangeEmailCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        if (seller.PasswordHash is null || !passwordHasher.Verify(command.CurrentPassword, seller.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalid_credentials", "Ungültiges Passwort");
        }

        var existingWithEmail = await sellers.GetByEmailAsync(command.NewEmail, cancellationToken);
        if (existingWithEmail is not null && existingWithEmail.Id != seller.Id)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        seller.ChangeEmail(command.NewEmail);
        await sellers.UpdateAsync(seller, cancellationToken);
    }
}

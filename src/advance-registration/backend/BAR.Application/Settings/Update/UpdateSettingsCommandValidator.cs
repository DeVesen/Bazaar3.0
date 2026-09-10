using BAR.Domain.Ports;
using FluentValidation;

namespace BAR.Application.Settings.Update;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator(ISellerTypeRepository sellerTypes)
    {
        RuleFor(c => c.StartNumber).GreaterThan(0);
        RuleFor(c => c.BlockSize).GreaterThan(0);
        RuleFor(c => c.DefaultBlockCount).GreaterThan(0);

        RuleFor(c => c.InfoText)
            .MaximumLength(4000)
            .WithMessage("Info-Text darf maximal 4000 Zeichen lang sein");

        RuleFor(c => c.DefaultTypeId)
            .MustAsync(async (id, ct) => id is null || await sellerTypes.GetByIdAsync(id, ct) is not null)
            .WithMessage("Unbekannter Verkäufer-Typ");

        RuleFor(c => c).Custom((command, context) =>
        {
            var phases = new (string Name, DateTime? Value)[]
            {
                (nameof(command.RegistrationDeadline), command.RegistrationDeadline),
                (nameof(command.DropOffFrom), command.DropOffFrom),
                (nameof(command.DropOffUntil), command.DropOffUntil),
                (nameof(command.BazaarFrom), command.BazaarFrom),
                (nameof(command.BazaarUntil), command.BazaarUntil)
            };

            DateTime? previousValue = null;
            string? previousName = null;
            foreach (var (name, value) in phases)
            {
                if (value is null) continue;
                if (previousValue is not null && value < previousValue)
                {
                    context.AddFailure(previousName!, "Termine müssen aufsteigend sein.");
                    context.AddFailure(name, "Termine müssen aufsteigend sein.");
                }
                previousValue = value;
                previousName = name;
            }
        });
    }
}

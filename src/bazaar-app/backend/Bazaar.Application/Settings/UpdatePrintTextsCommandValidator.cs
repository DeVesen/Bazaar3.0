using Bazaar.Domain.Settings;
using FluentValidation;

namespace Bazaar.Application.Settings;

public sealed class UpdatePrintTextsCommandValidator : AbstractValidator<UpdatePrintTextsCommand>
{
    public UpdatePrintTextsCommandValidator()
    {
        RuleFor(x => x.AbgabeBeleg).NotNull().SetValidator(new PrintTextsDtoValidator());
        RuleFor(x => x.VerkaeuferUebersicht).NotNull().SetValidator(new PrintTextsDtoValidator());
    }

    private sealed class PrintTextsDtoValidator : AbstractValidator<PrintTextsDto>
    {
        public PrintTextsDtoValidator()
        {
            RuleFor(x => x.Text1).NotNull().MaximumLength(PrintTexts.MaxLength);
            RuleFor(x => x.Text2).NotNull().MaximumLength(PrintTexts.MaxLength);
            RuleFor(x => x.Text3).NotNull().MaximumLength(PrintTexts.MaxLength);
            RuleFor(x => x.Text4).NotNull().MaximumLength(PrintTexts.MaxLength);
            RuleFor(x => x.Text5).NotNull().MaximumLength(PrintTexts.MaxLength);
        }
    }
}

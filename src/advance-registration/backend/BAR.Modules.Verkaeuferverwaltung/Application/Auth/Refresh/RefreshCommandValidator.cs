using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using FluentValidation;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Auth.Refresh;

/// <summary>
/// Der Token-Wert selbst hat kein pruefbares Format - "vorhanden" ist die
/// einzige Regel, und sie ist noetig: System.Text.Json erzwingt bei einem
/// positional record keine non-nullable Properties, ein Body wie <c>{}</c>
/// bindet also <c>RefreshToken = null</c> und liefe im Handler in eine
/// ArgumentNullException (500 statt 400).
/// </summary>
public sealed class RefreshCommandValidator : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator()
    {
        RuleFor(c => c.RefreshToken).NotEmpty();
    }
}

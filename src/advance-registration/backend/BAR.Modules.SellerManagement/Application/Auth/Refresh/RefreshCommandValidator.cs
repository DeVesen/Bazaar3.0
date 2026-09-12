using BAR.Modules.SellerManagement.Contracts.Auth;
using FluentValidation;

namespace BAR.Modules.SellerManagement.Application.Auth.Refresh;

/// <summary>
/// The token value itself has no checkable format - "present" is the only
/// rule, and it is needed: System.Text.Json does not enforce non-nullable
/// properties on a positional record, so a body like <c>{}</c> binds
/// <c>RefreshToken = null</c> and would hit an ArgumentNullException in the
/// handler (500 instead of 400).
/// </summary>
public sealed class RefreshCommandValidator : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator()
    {
        RuleFor(c => c.RefreshToken).NotEmpty();
    }
}

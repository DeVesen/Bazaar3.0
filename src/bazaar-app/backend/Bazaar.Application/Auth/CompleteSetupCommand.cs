namespace Bazaar.Application.Auth;

/// <summary>
/// Wire shape for the setup wizard's single "Setup abschließen" call — everything collected
/// across the wizard's three steps, submitted and created atomically in one go
/// (<see cref="CompleteSetupHandler"/>).
/// </summary>
public sealed class CompleteSetupCommand
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<SetupSellerType> SellerTypes { get; set; } = [];
    public List<string> BrandNames { get; set; } = [];
    public List<string> CategoryNames { get; set; } = [];
}

public sealed class SetupSellerType
{
    public string Name { get; set; } = string.Empty;
    public decimal CommissionRate { get; set; }
    public decimal ItemFee { get; set; }
}

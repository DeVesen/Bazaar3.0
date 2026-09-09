namespace BAR.Application.SellerTypes.Create;

public sealed record CreateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);

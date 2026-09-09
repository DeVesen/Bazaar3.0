namespace BAR.Application.SellerTypes.Update;

public sealed record UpdateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);

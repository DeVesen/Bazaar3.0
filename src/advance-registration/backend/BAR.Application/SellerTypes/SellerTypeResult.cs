namespace BAR.Application.SellerTypes;

public sealed record SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount);

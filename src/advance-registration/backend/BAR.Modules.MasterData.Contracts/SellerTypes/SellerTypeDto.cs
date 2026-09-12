namespace BAR.Modules.MasterData.Contracts.SellerTypes;

public sealed record SellerTypeDto(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount);

public sealed record SellerTypeConditionsDto(string SellerTypeId, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record CreateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);

public sealed record UpdateSellerTypeCommand(string Name, decimal CommissionRate, decimal ItemFee);

namespace Bazaar.Api.Features.SellerTypes;

public sealed record SellerTypeDto(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount);

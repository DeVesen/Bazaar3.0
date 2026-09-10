namespace BAR.Application.Sellers.Delete;

public sealed record DeleteSellerCommand(string SellerId, string RequestingSellerId);

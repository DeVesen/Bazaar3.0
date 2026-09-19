namespace Bazaar.Application.Sales;

public sealed record RecordSaleResult(int SoldCount, decimal Total, DateTimeOffset SoldAt);

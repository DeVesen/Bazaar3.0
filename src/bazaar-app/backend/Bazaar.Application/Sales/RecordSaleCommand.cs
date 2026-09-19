namespace Bazaar.Application.Sales;

/// <summary>
/// Backs POST /api/sales (api/sales.md) — books a checkout batch of a
/// buyer's cart as sold, as a single atomic transaction.
/// </summary>
public sealed class RecordSaleCommand
{
    public IReadOnlyList<string> ArticleIds { get; set; } = [];
}

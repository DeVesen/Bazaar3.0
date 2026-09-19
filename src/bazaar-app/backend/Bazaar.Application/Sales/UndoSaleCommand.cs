namespace Bazaar.Application.Sales;

/// <summary>
/// Backs POST /api/sales/undo (api/sales.md §2) — "Storno des letzten
/// Vorgangs", session-bound on the frontend. Reverts a checkout booking as
/// long as the seller has not been settled yet.
/// </summary>
public sealed class UndoSaleCommand
{
    public IReadOnlyList<string> ArticleIds { get; set; } = [];
}

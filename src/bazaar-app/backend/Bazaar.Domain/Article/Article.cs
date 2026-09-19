using Bazaar.Domain.Exceptions;

namespace Bazaar.Domain.Articles;

public sealed class Article
{
    public string Id { get; private init; } = null!;
    public int Number { get; private init; }
    public string SellerId { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public string Brand { get; private set; } = null!;
    public string Category { get; private set; } = null!;
    public decimal Price { get; private set; }
    public string? Description { get; private set; }
    public string? Size { get; private set; }
    public string? Color { get; private set; }
    public DateTimeOffset CreatedAt { get; private init; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public DateTimeOffset? AcceptedAt { get; private set; }
    public DateTimeOffset? ReleasedAt { get; private set; }
    public DateTimeOffset? SoldAt { get; private set; }
    public DateTimeOffset? ReturnedAt { get; private set; }
    public bool SoldManually { get; private set; }

    /// <summary>
    /// Abgeleiteter Status — wird nicht persistiert, sondern aus den
    /// Zeitstempeln berechnet. SoldAt/ReturnedAt können laut
    /// <see cref="SetTimestamps"/>-Invariante nie gleichzeitig gesetzt sein,
    /// daher ist die Reihenfolge Sold-vor-Returned hier nur zur
    /// Determinismus-Absicherung relevant.
    /// </summary>
    public ArticleStatus Status =>
        ReleasedAt is null ? ArticleStatus.Registered
        : SoldAt is not null ? ArticleStatus.Sold
        : ReturnedAt is not null ? ArticleStatus.Returned
        : ArticleStatus.Selling;

    public static Article Create(
        string id,
        int number,
        string sellerId,
        string name,
        string brand,
        string category,
        decimal price,
        string? size,
        string? color,
        string? description,
        DateTimeOffset createdAt,
        DateTimeOffset updatedAt)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.");
        if (string.IsNullOrWhiteSpace(sellerId)) throw new ArgumentException("SellerId required.");
        EnsureRequiredFields(name, brand, category);

        return new Article
        {
            Id = id,
            Number = number,
            SellerId = sellerId,
            Name = name.Trim(),
            Brand = brand.Trim(),
            Category = category.Trim(),
            Price = price,
            Size = size,
            Color = color,
            Description = description,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt,
            SoldManually = false
        };
    }

    /// <summary>
    /// Aktualisiert die Stammdaten. Name/Brand/Category/Size/Color/Description
    /// bleiben auch nach Verkauf frei änderbar — lediglich eine Preisänderung
    /// an einem bereits verkauften Artikel ist gesperrt.
    /// </summary>
    public void UpdateDetails(
        string name,
        string brand,
        string category,
        decimal price,
        string? size,
        string? color,
        string? description,
        DateTimeOffset now)
    {
        EnsureRequiredFields(name, brand, category);

        if (SoldAt != null && price != Price)
        {
            throw new ConflictException("Artikel ist verkauft — Preisänderung nicht möglich", "article.sold");
        }

        Name = name.Trim();
        Brand = brand.Trim();
        Category = category.Trim();
        Price = price;
        Size = size;
        Color = color;
        Description = description;
        UpdatedAt = now;
    }

    /// <summary>
    /// Vollersetzung der drei setzbaren Zeitstempel (ReleasedAt/SoldAt/
    /// ReturnedAt) — kein Partial-Patch. "manually" wird vom Aufrufer
    /// (UpdateArticleTimestampsHandler, spätere Task) vorgegeben; diese
    /// Methode entscheidet nicht selbst, wann SoldManually gesetzt wird.
    /// </summary>
    public void SetTimestamps(
        DateTimeOffset? releasedAt,
        DateTimeOffset? soldAt,
        DateTimeOffset? returnedAt,
        bool manually,
        DateTimeOffset now)
    {
        if (soldAt != null && returnedAt != null)
        {
            throw new ConflictException("Verkauft und zurückgegeben schließen sich aus", "article.sold_and_returned");
        }

        if ((soldAt != null || returnedAt != null) && releasedAt == null)
        {
            throw new ConflictException(
                "Zeitstempel-Kaskade inkonsistent — vorheriger Zeitstempel fehlt",
                "article.timestamp_cascade_invalid");
        }

        ReleasedAt = releasedAt;
        SoldAt = soldAt;
        ReturnedAt = returnedAt;
        SoldManually = manually;
        UpdatedAt = now;
    }

    /// <summary>
    /// Sets AcceptedAt and ReleasedAt together to the same instant — the
    /// intake-only write (api/intake.md: "An jedem Artikel werden
    /// acceptedAt und releasedAt auf den Vorgangszeitpunkt gesetzt").
    /// Deliberately separate from <see cref="SetTimestamps"/> (Round-15,
    /// admin-only timestamps-popup with cascade-invariant checks) — intake
    /// booking is a simpler, unconditional write with no such invariants.
    /// </summary>
    public void MarkAcceptedAndReleased(DateTimeOffset now)
    {
        AcceptedAt = now;
        ReleasedAt = now;
        UpdatedAt = now;
    }

    /// <summary>
    /// Sets ReleasedAt for an article booked via the Haupt-App's "Artikel
    /// freigeben" flow (api/release.md, Round-18 ReleaseHandler). The
    /// caller's own re-check guarantees ReleasedAt is still null before
    /// calling this — deliberately not reusing <see cref="SetTimestamps"/>
    /// (admin-only cascade invariants) or <see cref="MarkAcceptedAndReleased"/>
    /// (also sets AcceptedAt, which a pre-registered article already has via
    /// the advance-registration flow).
    /// </summary>
    public void MarkReleased(DateTimeOffset now)
    {
        ReleasedAt = now;
        UpdatedAt = now;
    }

    /// <summary>
    /// Sets SoldAt for an article booked via the Haupt-App's checkout flow
    /// (api/sales.md, Round-19 RecordSaleHandler). SoldManually stays
    /// untouched — it marks ONLY sales recorded without a Kassenvorgang
    /// (api/articles.md §5). The caller's own re-check guarantees the article
    /// is still Selling before calling this.
    /// </summary>
    public void RecordSale(DateTimeOffset now)
    {
        SoldAt = now;
        UpdatedAt = now;
    }

    /// <summary>
    /// Reverts a checkout booking (api/sales.md §2, Round-19 UndoSaleHandler,
    /// "Storno des letzten Vorgangs") — sets SoldAt back to null. Session-bound
    /// on the frontend; the caller's own re-check guarantees the seller is not
    /// settled before calling this.
    /// </summary>
    public void UndoSale(DateTimeOffset now)
    {
        SoldAt = null;
        UpdatedAt = now;
    }

    private static void EnsureRequiredFields(string name, string brand, string category)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.");
        if (string.IsNullOrWhiteSpace(brand)) throw new ArgumentException("Brand required.");
        if (string.IsNullOrWhiteSpace(category)) throw new ArgumentException("Category required.");
    }
}

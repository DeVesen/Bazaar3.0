namespace BAR.Application.Home.GetSellerHome;

public sealed record TypeConditionsResult(decimal CommissionRate, decimal ItemFee);

public sealed record SellerHomeResult(int ArticleCount, TypeConditionsResult TypeConditions);

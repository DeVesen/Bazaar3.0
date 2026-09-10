namespace BAR.Application.Sellers.Invite;

public sealed record InviteSellerCommand(string SellerId);

public sealed record InviteResult(string Token, DateTime ExpiresAt);

using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;

namespace BAR.Application.Profile;

public sealed record SellerTypeResult(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record ProfileResult(
    string Id, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, SellerTypeResult SellerType)
{
    public static ProfileResult From(Seller seller, SellerType sellerType) => new(
        seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
        seller.City, seller.Phone, seller.Email,
        new SellerTypeResult(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee));
}

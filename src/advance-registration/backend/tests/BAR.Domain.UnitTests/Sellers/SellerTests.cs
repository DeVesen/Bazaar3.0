using BAR.Domain.Sellers;

namespace BAR.Domain.UnitTests.Sellers;

public class SellerTests
{
    [Fact]
    public void Register_ValidData_CreatesSellerWithEightCharId()
    {
        var seller = Seller.Register(
            firstName: "Anna", lastName: "Beispiel", address: null,
            postalCode: "76133", city: "Karlsruhe", phone: "0721 12345",
            email: "anna@example.com", sellerTypeId: "t1b2c3d4",
            passwordHash: "hashed", isAdmin: false);

        Assert.Equal(8, seller.Id.Length);
        Assert.Equal("anna@example.com", seller.Email);
        Assert.False(seller.IsAdmin);
        Assert.Equal("hashed", seller.PasswordHash);
        Assert.Null(seller.InviteToken);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void Register_MissingRequiredField_Throws(string firstName, string lastName)
    {
        Assert.Throws<ArgumentException>(() => Seller.Register(
            firstName, lastName, null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed"));
    }

    [Fact]
    public void UpdateProfile_ValidData_UpdatesAllFields()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        seller.UpdateProfile("Anna-Maria", "Muster", "Hauptstr. 1", "76135", "Ettlingen", "0721 99999");

        Assert.Equal("Anna-Maria", seller.FirstName);
        Assert.Equal("Muster", seller.LastName);
        Assert.Equal("Hauptstr. 1", seller.Address);
        Assert.Equal("76135", seller.PostalCode);
        Assert.Equal("Ettlingen", seller.City);
        Assert.Equal("0721 99999", seller.Phone);
        Assert.Equal("anna@example.com", seller.Email);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void UpdateProfile_MissingRequiredField_Throws(string firstName, string lastName)
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateProfile(firstName, lastName, null, "76133", "Karlsruhe", "0721 12345"));
    }
}

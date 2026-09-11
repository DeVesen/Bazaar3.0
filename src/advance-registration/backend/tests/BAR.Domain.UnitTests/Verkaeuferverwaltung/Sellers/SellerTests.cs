using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel.Exceptions;

namespace BAR.Domain.UnitTests.Verkaeuferverwaltung.Sellers;

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

    private static Seller CreateAdminSeller() =>
        Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: false);

    [Fact]
    public void CreateByAdmin_HasNoPasswordAndNoInviteYet()
    {
        var seller = CreateAdminSeller();

        Assert.Null(seller.PasswordHash);
        Assert.Null(seller.InviteToken);
        Assert.Null(seller.InviteTokenExpiresAt);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void CreateByAdmin_MissingRequiredField_Throws(string firstName, string lastName)
    {
        Assert.Throws<ArgumentException>(() => Seller.CreateByAdmin(
            firstName, lastName, null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: false));
    }

    [Fact]
    public void UpdateAsAdmin_ChangesFieldsIncludingIsAdmin()
    {
        var seller = CreateAdminSeller();

        seller.UpdateAsAdmin("Anna", "Neu", "Adresse 1", "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: true);

        Assert.Equal("Neu", seller.LastName);
        Assert.Equal("Adresse 1", seller.Address);
        Assert.True(seller.IsAdmin);
    }

    [Theory]
    [InlineData("", "Beispiel")]
    [InlineData("Anna", "")]
    public void UpdateAsAdmin_MissingRequiredField_Throws(string firstName, string lastName)
    {
        var seller = CreateAdminSeller();

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateAsAdmin(firstName, lastName, null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", isAdmin: false));
    }

    [Fact]
    public void GenerateInviteToken_SetsTokenValidForSevenDays()
    {
        var seller = CreateAdminSeller();
        var now = new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc);

        var token = seller.GenerateInviteToken(now);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(token, seller.InviteToken);
        Assert.Equal(now.AddDays(7), seller.InviteTokenExpiresAt);
    }

    [Fact]
    public void GenerateInviteToken_CalledTwice_InvalidatesThePreviousToken()
    {
        var seller = CreateAdminSeller();
        var first = seller.GenerateInviteToken(DateTime.UtcNow);
        var second = seller.GenerateInviteToken(DateTime.UtcNow);

        Assert.NotEqual(first, second);
        Assert.Equal(second, seller.InviteToken);
    }

    [Fact]
    public void ConsumePassword_ValidToken_SetsPasswordAndClearsInvite()
    {
        var seller = CreateAdminSeller();
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now);

        seller.ConsumePassword("hashed", now);

        Assert.Equal("hashed", seller.PasswordHash);
        Assert.Null(seller.InviteToken);
        Assert.Null(seller.InviteTokenExpiresAt);
    }

    [Fact]
    public void ConsumePassword_ExpiredToken_ThrowsUnauthorized()
    {
        var seller = CreateAdminSeller();
        var issuedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        seller.GenerateInviteToken(issuedAt);

        var ex = Assert.Throws<UnauthorizedException>(() => seller.ConsumePassword("hashed", issuedAt.AddDays(8)));

        Assert.Equal("auth.invalid_invite_token", ex.ErrorCode);
    }

    [Fact]
    public void ConsumePassword_NoInvitePending_ThrowsUnauthorized()
    {
        var seller = CreateAdminSeller();

        Assert.Throws<UnauthorizedException>(() => seller.ConsumePassword("hashed", DateTime.UtcNow));
    }

    [Fact]
    public void ChangeEmail_ValidEmail_UpdatesEmail()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        seller.ChangeEmail("anna.neu@example.com");

        Assert.Equal("anna.neu@example.com", seller.Email);
    }

    [Fact]
    public void ChangeEmail_EmptyEmail_Throws()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        Assert.Throws<ArgumentException>(() => seller.ChangeEmail(""));
    }

    [Fact]
    public void ChangePassword_ValidHash_UpdatesPasswordHash()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        seller.ChangePassword("neuer-hash");

        Assert.Equal("neuer-hash", seller.PasswordHash);
    }

    [Fact]
    public void ChangePassword_EmptyHash_Throws()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");

        Assert.Throws<ArgumentException>(() => seller.ChangePassword(""));
    }
}

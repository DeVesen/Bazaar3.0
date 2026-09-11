namespace BAR.Modules.Verkaeuferverwaltung.Contracts;

public sealed record TokenPairDto(string AccessToken, string RefreshToken);

public sealed record PagedResultDto<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

/// <summary>Fuer Home (Seller-Ansicht, Host-Komposition).</summary>
public sealed record SellerConditionsDto(decimal CommissionRate, decimal ItemFee);

/// <summary>Fuer Export.</summary>
public sealed record ExportSellerDto(
    string Id, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, string SellerTypeName);

/// <summary>Fuer Anmeldung: Verkaeufer-Anzeigename in admin. Artikel-Uebersicht/Suche.</summary>
public sealed record SellerNameDto(string Id, string FirstName, string LastName);

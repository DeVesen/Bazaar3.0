namespace BAR.Application.Auth;

/// <summary>Gemeinsames Result fuer Register/Login/Refresh (api/auth.md Abschnitt 2).</summary>
public sealed record TokenPairResult(string AccessToken, string RefreshToken);

# Pflichtfelder Verkäufer (Haupt-App) — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-13-seller-required-fields/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Beim Anlegen und Ändern eines Verkäufers in der Haupt-App sind Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr und Provision Pflicht und die E-Mail optional.
**Architektur:** Die Domain (`Seller`) verlangt Ort statt E-Mail, die E-Mail wird nullable (EF-Migration). Validatoren, Import-Parser und DTOs ziehen nach. Im Frontend zeigen Dialog und Wizard-Schritt 1 den Button gesperrt und unter jedem leeren Pflichtfeld nach dem Verlassen eine Inline-Meldung; die gemeinsame Regel liegt in einem kleinen Shared-Helper. Create leitet Gebühr und Provision weiter aus dem Verkäufer-Typ ab.
**Tech-Stack:** .NET 10 / C# (xUnit v3, FluentValidation, EF Core + Npgsql), Angular (Signals, OnPush, PrimeNG, Vitest).
**Spec:** docs/forge/2026-10-13-seller-required-fields/spec.md
**Basis:** 936e0045

## Global Constraints
- Pfade relativ zur Checkout-Wurzel `<R>` (`git rev-parse --show-toplevel`, aktuell `C:/wt/bazaar-srf`, Branch `docs/feature/seller-required-fields`). Alle Befehle laufen im Bash-Tool.
- Pflichtfelder: Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision. Optional: Anschrift, PLZ, Telefon, E-Mail (Spec, Abschnitt Ziel).
- E-Mail wird `string?` in Domain und DB; leere oder nur aus Leerzeichen bestehende Eingabe wird als `null` gespeichert (Spec, Entscheidungen).
- Gebühr und Provision: `0` ist gültig, ein geleertes Zahlenfeld (`null`) ist ungültig; serverseitig keine Pflichtprüfung, Create leitet sie aus dem Typ ab (Spec AC-5, AC-6).
- Das E-Mail-Format prüft nur Wizard Schritt 1 und nur bei eingegebener E-Mail; Dialog und Schnittstelle prüfen es nicht (Spec AC-12).
- Import: Der Parser verlangt `city`, nicht mehr `email`; ein Verkäufer ohne Ort macht die ganze Datei ungültig (`import.invalid_format`) (Spec AC-10, bestätigt).
- Bestehende Verkäufer ohne Ort in der DB bleiben unverändert; die Spalte `City` bleibt nullable.
- Sprache: Code, Routen, JSON-Contract und Code-Kommentare englisch; Doku und Commit-Text deutsch; Conventional Commits `type(scope): Beschreibung`.
- Zeilenenden: Dateien immer mit LF schreiben (`.gitattributes`).
- Commits: Branch und `git status` prüfen, dann immer in einem Schritt mit Pfadangabe `git commit -m "<text>" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- <pfade>`; nie getrennt stagen. Neue Dateien vorher mit `git add -N <neue dateien>` anmelden, sonst kennt `git commit -- <pfad>` sie nicht.
- Backend: `Directory.Build.props` setzt `TreatWarningsAsErrors=true` und `Nullable=enable`; jede Nullable-Warnung bricht den Build.
- Bauen und Testen nur über `dv-dotnet-build`, `dv-dotnet-test`, `dv-angular-build`, `dv-angular-test`, `dv-angular-lint`; nie `dotnet test`, `ng test` oder `npm test` (Skills `dv-dotnet:toolchain`, `dv-angular:toolchain`). Ein einzelnes Test-Projekt wird mit `--path <R>/src/bazaar-app/backend/tests/<Projekt>` angesprochen; Argumente nach `--` gehen an dotnet bzw. `ng` weiter.
- Meldet der .NET-Build `MSB3027` (DLL gesperrt, meist läuft `Bazaar.Api` im Debugger), Prozess beenden oder mit `-c Release` bauen.
- EF-Migrationen nur per `dotnet ef migrations add` (Triplet `.cs`, `.Designer.cs`, Snapshot), nie von Hand; kein `database update` gegen die Dev-DB (Skill `dv-dotnet:dotnet-ef-migrations`).
- Tests (`dv-craft:craft-unit-testing`, `dv-dotnet:dotnet-xunit-conventions`): Arrange-Act-Assert, Benennung `<Methode>_<Situation>_<Erwartung>`, Testprojekt spiegelt die Produktion, bestehende Testdateien erweitern statt neue anlegen, wo die Datei schon existiert.
- Design (`dv-craft:craft-design-principles`): kleine Dateien mit einer Verantwortung, vorhandene Muster beibehalten (z. B. FluentValidation-Validatoren, Signal-Stores), nichts umbauen, was die Spec nicht verlangt.
- .NET (`dv-dotnet:dotnet`): Domain-Regeln bleiben im Aggregat `Seller`, Validatoren im Application-Projekt, EF-Konfiguration im Infrastructure-Projekt.
- Angular (`dv-angular:angular`): standalone Komponenten, Signals, `ChangeDetectionStrategy.OnPush`, neue Template-Syntax (`@if`), Specs mit Vitest (`describe`/`it`, `vi`), Tests liegen neben der Quelldatei.
- PrimeNG (`primeng:primeng-component-implementation`): nur PrimeNG-Komponenten oder vorhandene `app-input`; belegt über den PrimeNG-MCP: `p-select` und `p-inputnumber` haben den Output `onBlur`, `app-input` den Output `blurred`.
- `npm ci` im Worktree ist erledigt (`src/bazaar-app/frontend/node_modules` vorhanden).
- Doku-Nachführung: Ändert die Umsetzung Fähigkeit, Begriff oder Beschriftung, führt der Plan Anforderungs-Doku, Profile und Glossar mit; dafür gibt es Task 8.
- Nicht betroffen: Voranmelde-App (`src/advance-registration`).

---

### Task 1: Domain `Seller` — Ort Pflicht, E-Mail optional

**ACs:** AC-7, AC-8

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Seller/Seller.cs:12-153` · `Seller` (`Email`, `Create`, `CreateFromImport`, `UpdateDetails`, `EnsureRequiredFields`)
- Modify: `src/bazaar-app/backend/Bazaar.Application/Sellers/CreateSellerCommand.cs` · `CreateSellerCommand`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Sellers/UpdateSellerCommand.cs` · `UpdateSellerCommand`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Import/RunImportHandler.cs:95-106` · `RunImportHandler.Handle` (Aufruf `Seller.CreateFromImport(`)
- Modify: `src/bazaar-app/backend/Bazaar.Api/Features/Sellers/Dtos.cs` · `SellerDetailDto`, `SellerDto`
- Test: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SellerTests.cs` · `SellerTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticleListQueryTests.cs` · `ArticleListQueryTests.CreateSeller`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/UpdateSellerHandlerTests.cs` · `UpdateSellerHandlerTests.CreateSeller`, `UpdateSellerHandlerTests.CreateCommand`
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Queries/StatisticsQueryTests.cs` · `StatisticsQueryTests` (mehrzeilige `Seller.Create(`-Aufrufe)
- Test (mechanisch, nur Ort ergänzen): alle weiteren `*.cs` unter `src/bazaar-app/backend/tests/`, die `Seller.Create(…)`, `Seller.CreateFromImport(…)` oder `.UpdateDetails(…)` mit vier aufeinanderfolgenden `null` vor der E-Mail-Adresse aufrufen (Befehl in Schritt 4)

**Interfaces:**
- Consumes: —
- Produces:
  - `Seller.Email` ist `string?`; `Seller.City` bleibt `string?` (Altbestand ohne Ort).
  - `Seller.Create(string id, string firstName, string lastName, string? address, string? postalCode, string city, string? phone, string? email, string sellerTypeId, decimal salesCommission, decimal feePerItem)` und `Seller.CreateFromImport(…)` mit derselben Parameterliste; beide werfen `ArgumentException` bei leerem oder nur aus Leerzeichen bestehendem `city`, `firstName`, `lastName`, `sellerTypeId`.
  - `Seller.UpdateDetails(string firstName, string lastName, string? address, string? postalCode, string city, string? phone, string? email, string sellerTypeId)` mit denselben Pflichtprüfungen.
  - `CreateSellerCommand.City` und `UpdateSellerCommand.City` sind `string` (Default `string.Empty`); `CreateSellerCommand.Email` und `UpdateSellerCommand.Email` sind `string?`.
  - `SellerDetailDto.Email` und `SellerDto.Email` sind `string?`.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SellerTests.cs` fünf Edits, jeweils mit dem genannten alten Text:

  (a) Test `Create_WithEmptyOrWhitespaceEmail_Throws` ersetzen. Alt:
  ```csharp
      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void Create_WithEmptyOrWhitespaceEmail_Throws(string email)
      {
          Assert.Throws<ArgumentException>(() =>
              Seller.Create("seller-1", "Anna", "Meier", null, null, null, null, email, "sellertype-1", 10m, 0.5m));
      }
  ```
  Neu:
  ```csharp
      [Theory]
      [InlineData(null)]
      [InlineData("")]
      [InlineData("   ")]
      public void Create_WithMissingEmail_StoresNull(string? email)
      {
          var seller = Seller.Create(
              "seller-1", "Anna", "Meier", null, null, "Karlsruhe", null, email, "sellertype-1", 10m, 0.5m);

          Assert.Null(seller.Email);
      }

      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void Create_WithEmptyOrWhitespaceCity_Throws(string city)
      {
          Assert.Throws<ArgumentException>(() =>
              Seller.Create("seller-1", "Anna", "Meier", null, null, city, null, "anna@example.org", "sellertype-1", 10m, 0.5m));
      }
  ```

  (b) Test `Create_WithOptionalFieldsNull_Succeeds` ersetzen. Alt:
  ```csharp
      public void Create_WithOptionalFieldsNull_Succeeds()
      {
          var seller = Seller.Create(
              "seller-1", "Anna", "Meier", null, null, null, null, "anna@example.org", "sellertype-1", 10m, 0.5m);

          Assert.Null(seller.Address);
          Assert.Null(seller.PostalCode);
          Assert.Null(seller.City);
          Assert.Null(seller.Phone);
      }
  ```
  Neu:
  ```csharp
      public void Create_WithOptionalFieldsNull_Succeeds()
      {
          var seller = Seller.Create(
              "seller-1", "Anna", "Meier", null, null, "Karlsruhe", null, null, "sellertype-1", 10m, 0.5m);

          Assert.Null(seller.Address);
          Assert.Null(seller.PostalCode);
          Assert.Equal("Karlsruhe", seller.City);
          Assert.Null(seller.Phone);
          Assert.Null(seller.Email);
      }
  ```

  (c) In `Create_WithValidData_SetsAllPropertiesAndTrimsRequiredFields` die Ort-Eingabe mit Leerzeichen versehen. Alt:
  ```csharp
              "seller-1", "  Anna  ", "  Meier  ", "Hauptstr. 1", "76133", "Karlsruhe", "0721 123456",
  ```
  Neu:
  ```csharp
              "seller-1", "  Anna  ", "  Meier  ", "Hauptstr. 1", "76133", "  Karlsruhe  ", "0721 123456",
  ```

  (d) Test `UpdateDetails_WithEmptyOrWhitespaceEmail_Throws` ersetzen. Alt:
  ```csharp
      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void UpdateDetails_WithEmptyOrWhitespaceEmail_Throws(string email)
      {
          var seller = CreateValidSeller();

          Assert.Throws<ArgumentException>(() =>
              seller.UpdateDetails("Anna", "Meier", null, null, null, null, email, "sellertype-1"));
      }
  ```
  Neu:
  ```csharp
      [Theory]
      [InlineData(null)]
      [InlineData("")]
      [InlineData("   ")]
      public void UpdateDetails_WithMissingEmail_ClearsEmail(string? email)
      {
          var seller = CreateValidSeller();

          seller.UpdateDetails("Anna", "Meier", null, null, "Karlsruhe", null, email, "sellertype-1");

          Assert.Null(seller.Email);
      }

      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void UpdateDetails_WithEmptyOrWhitespaceCity_Throws(string city)
      {
          var seller = CreateValidSeller();

          Assert.Throws<ArgumentException>(() =>
              seller.UpdateDetails("Anna", "Meier", null, null, city, null, "anna@example.org", "sellertype-1"));
      }
  ```

  (e) Test `CreateFromImport_WithEmptyOrWhitespaceEmail_Throws` ersetzen. Alt:
  ```csharp
      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void CreateFromImport_WithEmptyOrWhitespaceEmail_Throws(string email)
      {
          Assert.Throws<ArgumentException>(() =>
              Seller.CreateFromImport("seller-1", "Anna", "Meier", null, null, null, null, email, "sellertype-1", 10m, 0.5m));
      }
  ```
  Neu:
  ```csharp
      [Theory]
      [InlineData(null)]
      [InlineData("")]
      [InlineData("   ")]
      public void CreateFromImport_WithMissingEmail_StoresNull(string? email)
      {
          var seller = Seller.CreateFromImport(
              "seller-1", "Anna", "Meier", null, null, "Karlsruhe", null, email, "sellertype-1", 10m, 0.5m);

          Assert.Null(seller.Email);
      }

      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void CreateFromImport_WithEmptyOrWhitespaceCity_Throws(string city)
      {
          Assert.Throws<ArgumentException>(() =>
              Seller.CreateFromImport("seller-1", "Anna", "Meier", null, null, city, null, "anna@example.org", "sellertype-1", 10m, 0.5m));
      }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests` — erwartet: FEHLGESCHLAGEN (Build-Fehler CS8604 in `SellerTests.cs`, weil `string? email` an den noch nicht-nullbaren Parameter geht; nach dem Mini-Umbau wäre `Create_WithEmptyOrWhitespaceCity_Throws` der erste Laufzeit-Fehlschlag)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Domain/Seller/Seller.cs` komplett ersetzen durch:
  ```csharp
  namespace Bazaar.Domain.Sellers;

  public sealed class Seller
  {
      public string Id { get; private init; } = null!;
      public string FirstName { get; private set; } = null!;
      public string LastName { get; private set; } = null!;
      public string? Address { get; private set; }
      public string? PostalCode { get; private set; }
      public string? City { get; private set; }
      public string? Phone { get; private set; }
      public string? Email { get; private set; }
      public string SellerTypeId { get; private set; } = null!;
      public decimal SalesCommission { get; private set; }
      public decimal FeePerItem { get; private set; }
      public decimal IntakeFeePaid { get; private set; }
      public DateTimeOffset? SettledAt { get; private set; }
      public decimal? PayoutAmount { get; private set; }

      public static Seller Create(
          string id,
          string firstName,
          string lastName,
          string? address,
          string? postalCode,
          string city,
          string? phone,
          string? email,
          string sellerTypeId,
          decimal salesCommission,
          decimal feePerItem)
      {
          if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.");
          EnsureRequiredFields(firstName, lastName, city, sellerTypeId);

          return new Seller
          {
              Id = id,
              FirstName = firstName.Trim(),
              LastName = lastName.Trim(),
              Address = address,
              PostalCode = postalCode,
              City = city.Trim(),
              Phone = phone,
              Email = NormalizeOptional(email),
              SellerTypeId = sellerTypeId,
              SalesCommission = salesCommission,
              FeePerItem = feePerItem,
              IntakeFeePaid = 0m
          };
      }

      /// <summary>
      /// Deliberate exception to the project's usual IIdGenerator-only creation
      /// rule (Round-26 JSON-Import): the id is taken 1:1 from a
      /// Voranmelde-App export file rather than generated here — the import
      /// handler (Application layer, later task) decides whether that id is a
      /// fresh one or reused from a prior import cycle. The import file
      /// (entities/import-format.md) carries no Konditionszahlen beyond what
      /// <see cref="Create"/> already covers, so IntakeFeePaid still defaults
      /// to 0m and this simply delegates.
      /// </summary>
      public static Seller CreateFromImport(
          string id,
          string firstName,
          string lastName,
          string? address,
          string? postalCode,
          string city,
          string? phone,
          string? email,
          string sellerTypeId,
          decimal salesCommission,
          decimal feePerItem) =>
          Create(id, firstName, lastName, address, postalCode, city, phone, email, sellerTypeId, salesCommission, feePerItem);

      /// <summary>
      /// Updates the basic Stammdaten fields. Deliberately excludes
      /// SalesCommission/FeePerItem — those are updated only via
      /// <see cref="UpdateConditions"/>, since UpdateSellerHandler's
      /// admin-only gate depends on being able to call both independently.
      /// </summary>
      public void UpdateDetails(
          string firstName,
          string lastName,
          string? address,
          string? postalCode,
          string city,
          string? phone,
          string? email,
          string sellerTypeId)
      {
          EnsureRequiredFields(firstName, lastName, city, sellerTypeId);

          FirstName = firstName.Trim();
          LastName = lastName.Trim();
          Address = address;
          PostalCode = postalCode;
          City = city.Trim();
          Phone = phone;
          Email = NormalizeOptional(email);
          SellerTypeId = sellerTypeId;
      }

      public void UpdateConditions(decimal salesCommission, decimal feePerItem)
      {
          SalesCommission = salesCommission;
          FeePerItem = feePerItem;
      }

      /// <summary>
      /// Resets a settlement, e.g. when a settlement is cancelled/storniert.
      /// Called by <c>ResetSellerSettlementHandler</c> (DELETE
      /// /api/sellers/{id}/settlement, Round-14) — Seller is the aggregate
      /// that must encapsulate this, so it is provided here.
      /// </summary>
      public void ResetSettlement()
      {
          SettledAt = null;
          PayoutAmount = null;
      }

      /// <summary>
      /// Settles the seller with the given payout amount. Takes the
      /// settlement timestamp as a parameter (rather than reading
      /// DateTimeOffset.UtcNow directly), mirroring the pattern used by
      /// ITokenIssuer.IssueAccessToken(User, DateTime nowUtc) elsewhere in
      /// this codebase. Not called by any handler until Round-20/21.
      /// </summary>
      public void Settle(decimal payoutAmount, DateTimeOffset settledAt)
      {
          PayoutAmount = payoutAmount;
          SettledAt = settledAt;
      }

      /// <summary>
      /// Adds to <see cref="IntakeFeePaid"/> — called once per intake
      /// transaction (api/intake.md: "feeAmount wird auf intakeFeePaid des
      /// Verkäufers addiert"). Additive, never a replace, since a seller can
      /// go through intake more than once (e.g. bringing a second box later).
      /// </summary>
      public void AddIntakeFeePaid(decimal amount)
      {
          if (amount < 0) throw new ArgumentException("Amount must not be negative.");
          IntakeFeePaid += amount;
      }

      private static void EnsureRequiredFields(string firstName, string lastName, string city, string sellerTypeId)
      {
          if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("FirstName required.");
          if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("LastName required.");
          if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("City required.");
          if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("SellerTypeId required.");
      }

      private static string? NormalizeOptional(string? value) =>
          string.IsNullOrWhiteSpace(value) ? null : value.Trim();
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/Sellers/CreateSellerCommand.cs` — die Zeilen `Email` und `City` ersetzen. Alt:
  ```csharp
      public string Email { get; set; } = string.Empty;
      public string SellerTypeId { get; set; } = string.Empty;
      public string? Address { get; set; }
      public string? PostalCode { get; set; }
      public string? City { get; set; }
  ```
  Neu:
  ```csharp
      public string? Email { get; set; }
      public string SellerTypeId { get; set; } = string.Empty;
      public string? Address { get; set; }
      public string? PostalCode { get; set; }
      public string City { get; set; } = string.Empty;
  ```
  `src/bazaar-app/backend/Bazaar.Application/Sellers/UpdateSellerCommand.cs` — Alt:
  ```csharp
      public string Email { get; set; } = string.Empty;
      public string? Address { get; set; }
      public string? PostalCode { get; set; }
      public string? City { get; set; }
  ```
  Neu:
  ```csharp
      public string? Email { get; set; }
      public string? Address { get; set; }
      public string? PostalCode { get; set; }
      public string City { get; set; } = string.Empty;
  ```
  `src/bazaar-app/backend/Bazaar.Application/Import/RunImportHandler.cs` — Alt:
  ```csharp
                      fileSeller.City,
                      fileSeller.Phone,
                      fileSeller.Email!,
  ```
  Neu (der Parser garantiert `City`, siehe Task 4):
  ```csharp
                      fileSeller.City!,
                      fileSeller.Phone,
                      fileSeller.Email,
  ```
  `src/bazaar-app/backend/Bazaar.Api/Features/Sellers/Dtos.cs` — zwei Edits. In `SellerDetailDto` Alt:
  ```csharp
      string? Phone,
      string Email,
      string SellerTypeId,
      decimal SalesCommission,
      decimal FeePerItem,
      string Status,
  ```
  Neu:
  ```csharp
      string? Phone,
      string? Email,
      string SellerTypeId,
      decimal SalesCommission,
      decimal FeePerItem,
      string Status,
  ```
  In `SellerDto` Alt:
  ```csharp
      string? Phone,
      string Email,
      string SellerTypeId,
      decimal SalesCommission,
      decimal FeePerItem,
      decimal IntakeFeePaid,
  ```
  Neu:
  ```csharp
      string? Phone,
      string? Email,
      string SellerTypeId,
      decimal SalesCommission,
      decimal FeePerItem,
      decimal IntakeFeePaid,
  ```
- [ ] **Schritt 4: Bestehende Test-Fixtures auf die neue Signatur bringen**
  Alle Fixtures, die einen Verkäufer ohne Ort anlegen, bekommen `"Karlsruhe"`. Im Bash-Tool, Arbeitsverzeichnis `<R>/src/bazaar-app/backend/tests`:
  ```bash
  grep -rl --include=*.cs 'null, null, null, null, "[^"]*@' . | xargs sed -i 's/null, null, null, null, \("[^"]*@\)/null, null, "Karlsruhe", null, \1/'
  sed -i 's/null, null, null, null,$/null, null, "Karlsruhe", null,/' Bazaar.Infrastructure.UnitTests/Persistence/Queries/StatisticsQueryTests.cs Bazaar.Application.UnitTests/Sellers/UpdateSellerHandlerTests.cs
  git diff --stat | cat
  ```
  Danach drei gezielte Edits:
  - `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticleListQueryTests.cs`: Alt `private static Seller CreateSeller(string id, string firstName, string lastName, string? city = "Karlsruhe") =>`, neu `private static Seller CreateSeller(string id, string firstName, string lastName, string city = "Karlsruhe") =>`.
  - `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/UpdateSellerHandlerTests.cs`, in `CreateCommand`: Alt
    ```csharp
        Email = "anna@example.org",
        SellerTypeId = "SELLERTYPE001",
        SalesCommission = salesCommission,
    ```
    Neu
    ```csharp
        Email = "anna@example.org",
        City = "Karlsruhe",
        SellerTypeId = "SELLERTYPE001",
        SalesCommission = salesCommission,
    ```
  - Der `grep -rn 'null, null, null, null, "[^"]*@'` über `tests/` darf danach keinen Treffer mehr liefern (Prüfung, erwartet: leere Ausgabe).
- [ ] **Schritt 5: Test grün laufen lassen**
  Befehl: `dv-dotnet-build --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK (alle Projekte grün, insbesondere `SellerTests`)
- [ ] **Schritt 6: Commit**
  `git status --short` und `git branch --show-current` prüfen (Branch `docs/feature/seller-required-fields`), dann
  `git commit -m "feat(sellers): Ort als Pflicht und E-Mail optional in der Domain" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/backend`

---

### Task 2: Persistenz — `Seller.Email` nullable, EF-Migration

**ACs:** AC-8, AC-9

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SellerConfiguration.cs:14-20` · `SellerConfiguration.Configure`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<Zeitstempel>_MakeSellerEmailOptional.cs` (per CLI erzeugt)
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<Zeitstempel>_MakeSellerEmailOptional.Designer.cs` (per CLI erzeugt)
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/BazaarDbContextModelSnapshot.cs` · `Email`-Eigenschaft von `Bazaar.Domain.Sellers.Seller` (per CLI geändert)
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SellerRepositoryTests.cs` · `SellerRepositoryTests`

**Interfaces:**
- Consumes: `Seller.Email` als `string?`, `Seller.Create(…, string city, string? phone, string? email, …)` aus Task 1
- Produces: Spalte `Sellers.Email` ist nullable; Migration `MakeSellerEmailOptional`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SellerRepositoryTests.cs` direkt vor der Zeile `    [Fact]\n    public async Task Add_PersistsSeller_FindableByGetById()` einfügen:
  ```csharp
      [Fact]
      public void Model_SellerEmail_IsNullable()
      {
          using var dbContext = CreateContext();

          var property = dbContext.Model.FindEntityType(typeof(Seller))!.FindProperty(nameof(Seller.Email))!;

          Assert.True(property.IsNullable);
      }

      [Fact]
      public async Task Add_SellerWithoutEmail_IsPersistedWithNullEmail()
      {
          await using var dbContext = CreateContext();
          var sut = new SellerRepository(dbContext);
          var seller = Seller.Create(
              "SEL00001", "Anna", "Meier", null, "76133", "Karlsruhe", null, null, "SLT00001", 10m, 0.5m);

          await sut.Add(seller);

          var found = await sut.GetById("SEL00001");
          Assert.NotNull(found);
          Assert.Null(found!.Email);
      }

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests` — erwartet: FAIL `Model_SellerEmail_IsNullable`
- [ ] **Schritt 3: Minimal implementieren**
  In `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SellerConfiguration.cs` Alt:
  ```csharp
          // Deliberate deviation from SellerTypeConfiguration/BrandConfiguration:
          // Email is required (NOT NULL) but spec.md does not document it as
          // unique, so no HasIndex(...).IsUnique() here and no citext column
          // type (citext is only used where case-insensitive uniqueness/lookup
          // is needed).
          builder.Property(s => s.Email).IsRequired();
  ```
  Neu:
  ```csharp
          // Email is optional (nullable column, inferred from Seller.Email being
          // string?): the Haupt-App only requires FirstName, LastName, City,
          // SellerTypeId and the conditions. Deliberately not unique and no citext
          // column type (citext is only used where case-insensitive
          // uniqueness/lookup is needed).
  ```
  Danach im Bash-Tool die Migration per CLI erzeugen (Dummy-Connection-String, die Migration verbindet sich nicht; so bleibt die Dev-DB unberührt):
  ```bash
  cd <R>/src/bazaar-app/backend
  ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time" dotnet ef migrations add MakeSellerEmailOptional --project Bazaar.Infrastructure --startup-project Bazaar.Api
  ```
  Ergebnis prüfen: neue Dateien `Bazaar.Infrastructure/Migrations/*_MakeSellerEmailOptional.cs` und `*_MakeSellerEmailOptional.Designer.cs`, geänderter `BazaarDbContextModelSnapshot.cs`; `grep -n "nullable: true" Bazaar.Infrastructure/Migrations/*_MakeSellerEmailOptional.cs` zeigt die `AlterColumn<string>` für `Email` in `Sellers` (erwartet: ein Treffer in `Up`).
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests` — erwartet: PASS `Model_SellerEmail_IsNullable`, `Add_SellerWithoutEmail_IsPersistedWithNullEmail`
  Befehl: `cd <R>/src/bazaar-app/backend && ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time" dotnet ef migrations has-pending-model-changes --project Bazaar.Infrastructure --startup-project Bazaar.Api` — erwartet: Exit 0, Meldung „No changes have been made to the model since the last migration."
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/*_MakeSellerEmailOptional.cs src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/*_MakeSellerEmailOptional.Designer.cs`, dann
  `git commit -m "feat(sellers): E-Mail des Verkäufers in der Datenbank optional" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/backend/Bazaar.Infrastructure src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests`

---

### Task 3: Application — Validatoren (Ort Pflicht, E-Mail nicht)

**ACs:** AC-5, AC-6

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Application/Sellers/CreateSellerCommandValidator.cs` · `CreateSellerCommandValidator`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Sellers/UpdateSellerCommandValidator.cs` · `UpdateSellerCommandValidator`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/CreateSellerCommandValidatorTests.cs` · `CreateSellerCommandValidatorTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/UpdateSellerCommandValidatorTests.cs` · `UpdateSellerCommandValidatorTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/CreateSellerHandlerTests.cs` · `CreateSellerHandlerTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/UpdateSellerHandlerTests.cs` · `UpdateSellerHandlerTests`

**Interfaces:**
- Consumes: `CreateSellerCommand.City: string`, `CreateSellerCommand.Email: string?`, `UpdateSellerCommand.City: string`, `UpdateSellerCommand.Email: string?` (Task 1)
- Produces: Validatoren verlangen `FirstName`, `LastName`, `City`, `SellerTypeId` (`NotEmpty`), keine Regel auf `Email`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `CreateSellerCommandValidatorTests.cs`: In `ValidCommand()` nach `Email = "anna@example.org",` die Zeile `City = "Karlsruhe",` ergänzen. Den Test `Validate_EmptyEmail_HasValidationError` ersetzen. Alt:
  ```csharp
      [Fact]
      public void Validate_EmptyEmail_HasValidationError()
      {
          var command = ValidCommand();
          command.Email = "";

          var result = _sut.Validate(command);

          Assert.False(result.IsValid);
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSellerCommand.Email));
      }
  ```
  Neu:
  ```csharp
      [Theory]
      [InlineData(null)]
      [InlineData("")]
      public void Validate_MissingEmail_IsValid(string? email)
      {
          var command = ValidCommand();
          command.Email = email;

          var result = _sut.Validate(command);

          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_EmptyCity_HasValidationError()
      {
          var command = ValidCommand();
          command.City = "";

          var result = _sut.Validate(command);

          Assert.False(result.IsValid);
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateSellerCommand.City));
      }
  ```
  `UpdateSellerCommandValidatorTests.cs`: In `ValidCommand()` nach `Email = "anna@example.org",` die Zeile `City = "Karlsruhe",` ergänzen. Den Test `Validate_EmptyEmail_HasValidationError` ersetzen. Alt:
  ```csharp
      [Fact]
      public void Validate_EmptyEmail_HasValidationError()
      {
          var command = ValidCommand();
          command.Email = "";

          var result = _sut.Validate(command);

          Assert.False(result.IsValid);
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.Email));
      }
  ```
  Neu:
  ```csharp
      [Theory]
      [InlineData(null)]
      [InlineData("")]
      public void Validate_MissingEmail_IsValid(string? email)
      {
          var command = ValidCommand();
          command.Email = email;

          var result = _sut.Validate(command);

          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_EmptyCity_HasValidationError()
      {
          var command = ValidCommand();
          command.City = "";

          var result = _sut.Validate(command);

          Assert.False(result.IsValid);
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.City));
      }
  ```
  `CreateSellerHandlerTests.cs`: Absicherungstest vor `    [Fact]\n    public async Task Handle_UnknownSellerType_ThrowsNotFoundWithSellerTypeNotFoundCode()` einfügen:
  ```csharp
      [Fact]
      public async Task Handle_CommandWithoutEmail_AddsSellerWithoutEmailAndWithConditionsFromSellerType()
      {
          var sellerType = SellerType.Create("SELLERTYPE001", "Standard", 10m, 0.5m);
          _sellerTypeRepository.Setup(r => r.GetById("SELLERTYPE001")).ReturnsAsync(sellerType);
          _idGenerator.Setup(g => g.Generate()).Returns("SELLER001");
          var sut = CreateSut();

          var seller = await sut.Handle(new CreateSellerCommand
          {
              FirstName = "Anna",
              LastName = "Meier",
              City = "Karlsruhe",
              SellerTypeId = "SELLERTYPE001"
          });

          Assert.Null(seller.Email);
          Assert.Equal(10m, seller.SalesCommission);
          Assert.Equal(0.5m, seller.FeePerItem);
          _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001")), Times.Once);
      }

  ```
  `UpdateSellerHandlerTests.cs`: Absicherungstest vor `    [Fact]\n    public async Task Handle_AdminChangesConditions_AppliesNewConditionsAndDetails()` einfügen:
  ```csharp
      [Fact]
      public async Task Handle_CommandWithoutEmail_ClearsEmailOfSeller()
      {
          var seller = CreateSeller();
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
          var sut = CreateSut();

          var command = CreateCommand();
          command.Email = null;
          await sut.Handle(command);

          Assert.Null(seller.Email);
          _sellerRepository.Verify(r => r.Update(seller), Times.Once);
      }

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests` — erwartet: FAIL `CreateSellerCommandValidatorTests.Validate_MissingEmail_IsValid`, `CreateSellerCommandValidatorTests.Validate_EmptyCity_HasValidationError`, `UpdateSellerCommandValidatorTests.Validate_MissingEmail_IsValid`, `UpdateSellerCommandValidatorTests.Validate_EmptyCity_HasValidationError`; die beiden Handler-Absicherungstests laufen schon grün
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Application/Sellers/CreateSellerCommandValidator.cs` komplett:
  ```csharp
  using FluentValidation;

  namespace Bazaar.Application.Sellers;

  public sealed class CreateSellerCommandValidator : AbstractValidator<CreateSellerCommand>
  {
      public CreateSellerCommandValidator()
      {
          RuleFor(x => x.FirstName).NotEmpty();
          RuleFor(x => x.LastName).NotEmpty();
          RuleFor(x => x.City).NotEmpty();
          RuleFor(x => x.SellerTypeId).NotEmpty();
      }
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/Sellers/UpdateSellerCommandValidator.cs` komplett:
  ```csharp
  using FluentValidation;

  namespace Bazaar.Application.Sellers;

  public sealed class UpdateSellerCommandValidator : AbstractValidator<UpdateSellerCommand>
  {
      public UpdateSellerCommandValidator()
      {
          RuleFor(x => x.FirstName).NotEmpty();
          RuleFor(x => x.LastName).NotEmpty();
          RuleFor(x => x.City).NotEmpty();
          RuleFor(x => x.SellerTypeId).NotEmpty();
      }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests` — erwartet: PASS (alle, insbesondere die vier neuen Validator-Tests und `Handle_CommandWithoutEmail_AddsSellerWithoutEmailAndWithConditionsFromSellerType`, `Handle_CommandWithoutEmail_ClearsEmailOfSeller`)
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(sellers): Validatoren verlangen Ort statt E-Mail" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/backend/Bazaar.Application/Sellers src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers`

---

### Task 4: Import — Ort Pflicht, E-Mail optional

**ACs:** AC-10

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Application/Import/ImportFileParser.cs:70-79` · `ImportFileParser.ValidateSeller`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Import/ImportFileParserTests.cs` · `ImportFileParserTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Import/RunImportHandlerTests.cs` · `RunImportHandlerTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Import/PreviewImportHandlerTests.cs` · `PreviewImportHandlerTests.SellerJson`

**Interfaces:**
- Consumes: `Seller.CreateFromImport(…, string city, …, string? email, …)` und `ImportSellerDto.City`/`Email` (`string?`) aus Task 1
- Produces: `ImportFileParser.Parse` wirft `BadRequestException` mit Code `import.invalid_format`, wenn `id`, `firstName`, `lastName`, `city` oder `sellerType` eines Verkäufers leer ist; fehlende E-Mail ist gültig

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  Zuerst die beiden Parser-Tests per Edit anpassen (vor dem Befehl in Schritt 2, damit die Zeilenmuster eindeutig bleiben).

  In `ImportFileParserTests.cs` Test `Parse_SellerMissingRequiredField_ThrowsBadRequestWithInvalidFormatErrorCode`: Alt
  ```csharp
                    "lastName": "Mustermann",
                    "email": "",
                    "sellerType": "Privat",
  ```
  Neu
  ```csharp
                    "lastName": "Mustermann",
                    "city": "",
                    "sellerType": "Privat",
  ```
  In `Parse_SellerWithOptionalFieldsAbsent_ParsesSuccessfully` das JSON ohne E-Mail, aber mit Ort schreiben. Alt
  ```csharp
      public async Task Parse_SellerWithOptionalFieldsAbsent_ParsesSuccessfully()
      {
          const string json = """
              {
                "exportedAt": "2026-06-14T08:00:00Z",
                "sellers": [
                  {
                    "id": "Ab3dEf7G",
                    "firstName": "Max",
                    "lastName": "Mustermann",
                    "email": "max@example.com",
  ```
  Neu
  ```csharp
      public async Task Parse_SellerWithOptionalFieldsAbsent_ParsesSuccessfully()
      {
          const string json = """
              {
                "exportedAt": "2026-06-14T08:00:00Z",
                "sellers": [
                  {
                    "id": "Ab3dEf7G",
                    "firstName": "Max",
                    "lastName": "Mustermann",
                    "city": "Musterstadt",
  ```
  und die Assertions desselben Tests. Alt
  ```csharp
          Assert.Null(seller.PostalCode);
          Assert.Null(seller.City);
          Assert.Null(seller.Phone);
          Assert.Empty(seller.Articles!);
  ```
  Neu
  ```csharp
          Assert.Null(seller.PostalCode);
          Assert.Equal("Musterstadt", seller.City);
          Assert.Null(seller.Phone);
          Assert.Null(seller.Email);
          Assert.Empty(seller.Articles!);
  ```
  Dann in allen übrigen Test-JSONs, die für einen anderen Fehlergrund gedacht sind, den Ort ergänzen (jeweils eine Zeile `"city"` vor der E-Mail-Zeile; im Bash-Tool, Arbeitsverzeichnis `<R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Import`):
  ```bash
  sed -i -E '100,$ s/^( *)"email": "max@example\.com",$/\1"city": "Musterstadt",\n\1"email": "max@example.com",/' ImportFileParserTests.cs
  sed -i -E 's/^( *)"email": "anna@example\.org",$/\1"city": "Karlsruhe",\n\1"email": "anna@example.org",/' RunImportHandlerTests.cs PreviewImportHandlerTests.cs
  git diff --stat | cat
  ```
  Neue Tests. In `ImportFileParserTests.cs` vor `    [Fact]\n    public async Task Parse_EmptySellersArray_ParsesSuccessfully()` einfügen:
  ```csharp
      [Fact]
      public async Task Parse_SellerWithoutCityProperty_ThrowsBadRequestWithInvalidFormatErrorCode()
      {
          const string json = """
              {
                "exportedAt": "2026-06-14T08:00:00Z",
                "sellers": [
                  {
                    "id": "Ab3dEf7G",
                    "firstName": "Max",
                    "lastName": "Mustermann",
                    "email": "max@example.com",
                    "sellerType": "Privat",
                    "articles": []
                  }
                ],
                "brands": [],
                "categories": []
              }
              """;

          var exception = await Assert.ThrowsAsync<BadRequestException>(() => ImportFileParser.Parse(ToStream(json), TestContext.Current.CancellationToken));

          Assert.Equal("import.invalid_format", exception.ErrorCode);
      }

  ```
  In `RunImportHandlerTests.cs` vor `    [Fact]\n    public async Task Handle_SellerExistsNotSoldNotSettled_RemovesOldSellerAndArticlesAndAddsNewOnes()` einfügen:
  ```csharp
      [Fact]
      public async Task Handle_SellerWithoutEmail_CreatesSellerWithNullEmail()
      {
          var json = JsonWithSellers(SellerJson(id: "SELLER001").Replace("\"email\": \"anna@example.org\",", string.Empty));
          var sut = CreateSut();

          var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

          Assert.Equal(1, result.ImportedSellers);
          _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001" && s.Email == null)), Times.Once);
      }

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests` — erwartet: FAIL `ImportFileParserTests.Parse_SellerWithoutCityProperty_ThrowsBadRequestWithInvalidFormatErrorCode`, `ImportFileParserTests.Parse_SellerWithOptionalFieldsAbsent_ParsesSuccessfully`, `RunImportHandlerTests.Handle_SellerWithoutEmail_CreatesSellerWithNullEmail`
- [ ] **Schritt 3: Minimal implementieren**
  In `src/bazaar-app/backend/Bazaar.Application/Import/ImportFileParser.cs` Alt:
  ```csharp
              string.IsNullOrWhiteSpace(seller.Email) ||
  ```
  Neu:
  ```csharp
              string.IsNullOrWhiteSpace(seller.City) ||
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK (Import-Tests grün, übrige Projekte unverändert grün)
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(import): Import verlangt Ort und akzeptiert Verkäufer ohne E-Mail" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/backend/Bazaar.Application/Import src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Import`

---

### Task 5: Frontend — gemeinsame Pflichtfeld-Regel und API-Typen

**ACs:** AC-3, AC-8

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.spec.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/data/sellers-api.ts:50-130` · `CreateSellerRequest`, `UpdateSellerRequest`, `Seller`, `SellerDetail`

**Interfaces:**
- Consumes: —
- Produces (aus `seller-required-fields.ts`):
  - `type SellerRequiredField = 'firstName' | 'lastName' | 'city' | 'sellerTypeId' | 'feePerItem' | 'salesCommission'`
  - `interface SellerRequiredValues { firstName: string; lastName: string; city: string; sellerTypeId: string; feePerItem: number | null; salesCommission: number | null }`
  - `const SELLER_REQUIRED_MESSAGES: Record<SellerRequiredField, string>`
  - `function missingSellerFields(values: SellerRequiredValues): SellerRequiredField[]`
  - `type SellerRequiredErrors = Partial<Record<SellerRequiredField, string>>`
  - `function sellerRequiredErrors(values: SellerRequiredValues, touched: ReadonlySet<SellerRequiredField>): SellerRequiredErrors`
  - `sellers-api.ts`: `CreateSellerRequest.email?: string | null`, `UpdateSellerRequest.email?: string | null`, `Seller.email: string | null`, `SellerDetail.email: string | null`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.spec.ts`:
  ```ts
  import {
    missingSellerFields,
    SELLER_REQUIRED_MESSAGES,
    sellerRequiredErrors,
    SellerRequiredField,
    SellerRequiredValues,
  } from './seller-required-fields';

  const VALID: SellerRequiredValues = {
    firstName: 'Max',
    lastName: 'Mustermann',
    city: 'Karlsruhe',
    sellerTypeId: 'type-privat',
    feePerItem: 0.5,
    salesCommission: 10,
  };

  describe('missingSellerFields', () => {
    it('returns nothing when all six required fields are set', () => {
      expect(missingSellerFields(VALID)).toEqual([]);
    });

    it.each([
      ['firstName', { firstName: '' }],
      ['lastName', { lastName: '   ' }],
      ['city', { city: ' ' }],
      ['sellerTypeId', { sellerTypeId: '' }],
      ['feePerItem', { feePerItem: null }],
      ['salesCommission', { salesCommission: null }],
    ] as [SellerRequiredField, Partial<SellerRequiredValues>][])('reports %s when it is empty', (field, override) => {
      expect(missingSellerFields({ ...VALID, ...override })).toEqual([field]);
    });

    it('treats a fee and a commission of 0 as set', () => {
      expect(missingSellerFields({ ...VALID, feePerItem: 0, salesCommission: 0 })).toEqual([]);
    });
  });

  describe('sellerRequiredErrors', () => {
    it('reports a message only for fields that are missing and were touched', () => {
      const values = { ...VALID, firstName: '', city: '' };

      const errors = sellerRequiredErrors(values, new Set<SellerRequiredField>(['firstName']));

      expect(errors).toEqual({ firstName: SELLER_REQUIRED_MESSAGES.firstName });
    });

    it('reports nothing for a touched field that is filled', () => {
      const errors = sellerRequiredErrors(VALID, new Set<SellerRequiredField>(['firstName', 'city']));

      expect(errors).toEqual({});
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/seller-form/seller-required-fields.spec.ts` — erwartet: FAIL (Modul `./seller-required-fields` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.ts`:
  ```ts
  /** The six fields the Haupt-App requires for a seller (Verkäufer dialog and intake wizard step 1). */
  export type SellerRequiredField =
    | 'firstName'
    | 'lastName'
    | 'city'
    | 'sellerTypeId'
    | 'feePerItem'
    | 'salesCommission';

  export interface SellerRequiredValues {
    firstName: string;
    lastName: string;
    city: string;
    sellerTypeId: string;
    /** `null` means the number input was cleared; `0` is a valid value. */
    feePerItem: number | null;
    salesCommission: number | null;
  }

  export const SELLER_REQUIRED_MESSAGES: Record<SellerRequiredField, string> = {
    firstName: 'Vorname ist erforderlich.',
    lastName: 'Nachname ist erforderlich.',
    city: 'Ort ist erforderlich.',
    sellerTypeId: 'Verkäufer-Typ ist erforderlich.',
    feePerItem: 'Gebühr ist erforderlich.',
    salesCommission: 'Provision ist erforderlich.',
  };

  export function missingSellerFields(values: SellerRequiredValues): SellerRequiredField[] {
    const missing: SellerRequiredField[] = [];
    if (values.firstName.trim().length === 0) missing.push('firstName');
    if (values.lastName.trim().length === 0) missing.push('lastName');
    if (values.city.trim().length === 0) missing.push('city');
    if (values.sellerTypeId.length === 0) missing.push('sellerTypeId');
    if (values.feePerItem === null) missing.push('feePerItem');
    if (values.salesCommission === null) missing.push('salesCommission');
    return missing;
  }

  export type SellerRequiredErrors = Partial<Record<SellerRequiredField, string>>;

  /** Messages for fields that are missing AND were already touched (left by the user). */
  export function sellerRequiredErrors(
    values: SellerRequiredValues,
    touched: ReadonlySet<SellerRequiredField>,
  ): SellerRequiredErrors {
    const errors: SellerRequiredErrors = {};
    for (const field of missingSellerFields(values)) {
      if (touched.has(field)) {
        errors[field] = SELLER_REQUIRED_MESSAGES[field];
      }
    }
    return errors;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/sellers/data/sellers-api.ts` — vier Edits. `CreateSellerRequest`, Alt:
  ```ts
    lastName: string;
    email: string;
    sellerTypeId: string;
    address?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
  }
  ```
  Neu:
  ```ts
    lastName: string;
    email?: string | null;
    sellerTypeId: string;
    address?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
  }
  ```
  `UpdateSellerRequest`, Alt:
  ```ts
    lastName: string;
    email: string;
    sellerTypeId: string;
    address?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
    salesCommission: number;
  ```
  Neu:
  ```ts
    lastName: string;
    email?: string | null;
    sellerTypeId: string;
    address?: string | null;
    postalCode?: string | null;
    city?: string | null;
    phone?: string | null;
    salesCommission: number;
  ```
  `Seller`, Alt:
  ```ts
    email: string;
    sellerTypeId: string;
    salesCommission: number;
    feePerItem: number;
    status: string;
  ```
  Neu:
  ```ts
    email: string | null;
    sellerTypeId: string;
    salesCommission: number;
    feePerItem: number;
    status: string;
  ```
  `SellerDetail`, Alt:
  ```ts
    email: string;
    sellerTypeId: string;
    salesCommission: number;
    feePerItem: number;
    intakeFeePaid: number;
  ```
  Neu:
  ```ts
    email: string | null;
    sellerTypeId: string;
    salesCommission: number;
    feePerItem: number;
    intakeFeePaid: number;
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/seller-form/seller-required-fields.spec.ts` — erwartet: PASS (alle Tests von `missingSellerFields` und `sellerRequiredErrors`)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.ts src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.spec.ts`, dann
  `git commit -m "feat(sellers): gemeinsame Pflichtfeld-Regel und optionale E-Mail in den API-Typen" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/frontend/src/app/shared/seller-form src/bazaar-app/frontend/src/app/features/sellers/data/sellers-api.ts`

---

### Task 6: Frontend — Verkäufer-Dialog (Anlegen/Bearbeiten)

**ACs:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-12

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.ts:25-50,97-129,241-263` · `SellerFormValue`, `SellerDialogServerErrors`, `VerkaeuferDialog` (`feePerItem`, `salesCommission`, `canSave`, `markTouched`, `requiredErrors`, `onSave`, Konstruktor-`effect`)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.html` · Felder Vorname, Nachname, Ort, E-Mail, Verkäufer-Typ, Gebühr, Provision
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts:557-565` · `SellersPage.fieldErrorsOf`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.spec.ts` · `VerkaeuferDialog`

**Interfaces:**
- Consumes: `missingSellerFields`, `sellerRequiredErrors`, `SellerRequiredField` aus `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.ts` (Task 5); `CreateSellerRequest.email?: string | null` und `UpdateSellerRequest.email?: string | null` (Task 5)
- Produces:
  - `SellerFormValue.email: string | null` (leer = `null`), `SellerFormValue.city: string | null` (Dialog sendet ein nicht leeres, getrimmtes `string`)
  - `SellerDialogServerErrors { firstName?; lastName?; city?; sellerTypeId? }` (kein `email` mehr)
  - `VerkaeuferDialog.feePerItem` und `.salesCommission`: `WritableSignal<number | null>`
  - `VerkaeuferDialog.requiredErrors: Signal<SellerRequiredErrors>`, `VerkaeuferDialog.markTouched(field: SellerRequiredField): void`, `VerkaeuferDialog.canSave: Signal<boolean>`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `verkaeufer-dialog.spec.ts`:

  (a) `EDIT_SELLER`: Alt `  city: null,` → Neu `  city: 'Karlsruhe',`.

  (b) Ersten Test ersetzen und neue Tests direkt dahinter einfügen. Alt:
  ```ts
    it('is invalid while firstName/lastName/email are empty and valid once required fields are filled', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      expect(component.canSave()).toBe(false);

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.email.set('max@example.com');
      expect(component.canSave()).toBe(true);
    });
  ```
  Neu:
  ```ts
    it('is invalid while a required field is empty and valid once all six are filled — the email is optional', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      expect(component.canSave()).toBe(false);

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      expect(component.canSave()).toBe(false);

      component.city.set('Karlsruhe');
      // seller type, fee and commission are prefilled in create mode; no email was entered
      expect(component.canSave()).toBe(true);
    });

    it('treats a cleared fee or commission as missing but accepts 0', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.city.set('Karlsruhe');
      component.feePerItem.set(0);
      component.salesCommission.set(0);
      expect(component.canSave()).toBe(true);

      component.feePerItem.set(null);
      expect(component.canSave()).toBe(false);

      component.feePerItem.set(0);
      component.salesCommission.set(null);
      expect(component.canSave()).toBe(false);
    });

    it('emits email null and the trimmed city when the email field is empty', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      const saveSpy = vi.fn();
      component.save.subscribe(saveSpy);
      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.city.set(' Karlsruhe ');
      component.email.set('  ');

      component.onSave();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ email: null, city: 'Karlsruhe', firstName: 'Max', lastName: 'Mustermann' }),
      );
    });

    it('shows an inline message under each empty required field only after the field was touched', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      await fixture.whenStable();

      const component = fixture.componentInstance;
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.verkaeufer-dialog__error').length).toBe(0);

      component.markTouched('firstName');
      component.markTouched('city');
      fixture.detectChanges();

      const messages = Array.from(el.querySelectorAll('.verkaeufer-dialog__error')).map((m) => m.textContent?.trim());
      expect(messages).toEqual(['Vorname ist erforderlich.', 'Ort ist erforderlich.']);

      component.firstName.set('Max');
      fixture.detectChanges();

      const remaining = Array.from(el.querySelectorAll('.verkaeufer-dialog__error')).map((m) => m.textContent?.trim());
      expect(remaining).toEqual(['Ort ist erforderlich.']);
    });
  ```

  (c) Zweiten Test (`does not allow save without a selected seller type`) anpassen. Alt:
  ```ts
      component.lastName.set('Mustermann');
      component.email.set('max@example.com');
      component.sellerTypeId.set('');
  ```
  Neu:
  ```ts
      component.lastName.set('Mustermann');
      component.city.set('Karlsruhe');
      component.sellerTypeId.set('');
  ```

  (d) Server-Fehler-Test von E-Mail auf Ort umstellen. Alt:
  ```ts
    it('displays a server-side field error for email when provided', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('serverErrors', { email: 'E-Mail bereits vergeben.' });
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'E-Mail bereits vergeben.',
      );
    });
  ```
  Neu:
  ```ts
    it('displays a server-side field error for city when provided', async () => {
      const { fixture } = await setup({ isAdmin: true });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'create');
      fixture.componentRef.setInput('serverErrors', { city: 'Ort fehlt auf dem Server.' });
      await fixture.whenStable();

      expect((fixture.nativeElement as HTMLElement).textContent).toContain(
        'Ort fehlt auf dem Server.',
      );
    });
  ```

  (e) Stern-Test ersetzen. Alt:
  ```ts
      it('shows a red star exactly on Vorname, Nachname, E-Mail and Verkäufer-Typ', async () => {
        const el = await open('create');
        const starred = SPANS.map(([id]) => id).filter((id) =>
          fieldOf(el, id)?.querySelector('.app-input__required, .verkaeufer-dialog__required'),
        );
        expect(starred).toEqual([
          'verkaeufer-dialog-first-name',
          'verkaeufer-dialog-last-name',
          'verkaeufer-dialog-email',
          'verkaeufer-dialog-seller-type',
        ]);
      });
  ```
  Neu:
  ```ts
      it('shows a red star exactly on Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr and Provision', async () => {
        const el = await open('create');
        const starred = SPANS.map(([id]) => id).filter((id) =>
          fieldOf(el, id)?.querySelector('.app-input__required, .verkaeufer-dialog__required'),
        );
        expect(starred).toEqual([
          'verkaeufer-dialog-first-name',
          'verkaeufer-dialog-last-name',
          'verkaeufer-dialog-city',
          'verkaeufer-dialog-seller-type',
          'verkaeufer-dialog-fee-per-item',
          'verkaeufer-dialog-sales-commission',
        ]);
      });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.spec.ts` — erwartet: FAIL (Typfehler/Laufzeitfehler: `markTouched` und `feePerItem.set(null)` existieren noch nicht; Stern-Test und `canSave`-Tests schlagen fehl)
- [ ] **Schritt 3: Minimal implementieren**
  `verkaeufer-dialog.ts`, Edits in dieser Reihenfolge:

  (1) Import nach der `Input`-Zeile. Alt:
  ```ts
  import { Input } from '../../../../shared/components/input/input';
  ```
  Neu:
  ```ts
  import { Input } from '../../../../shared/components/input/input';
  import {
    missingSellerFields,
    SellerRequiredField,
    sellerRequiredErrors,
  } from '../../../../shared/seller-form/seller-required-fields';
  ```
  (2) `SellerFormValue`. Alt:
  ```ts
    lastName: string;
    email: string;
    sellerTypeId: string;
    address: string | null;
  ```
  Neu:
  ```ts
    lastName: string;
    email: string | null;
    sellerTypeId: string;
    address: string | null;
  ```
  (3) `SellerDialogServerErrors`. Alt:
  ```ts
    lastName?: string;
    email?: string;
    sellerTypeId?: string;
  ```
  Neu:
  ```ts
    lastName?: string;
    city?: string;
    sellerTypeId?: string;
  ```
  (4) Fee/Commission nullable. Alt:
  ```ts
    readonly feePerItem = signal(0);
    readonly salesCommission = signal(0);
  ```
  Neu:
  ```ts
    /** `null` while the number input is cleared; `0` is valid. */
    readonly feePerItem = signal<number | null>(0);
    readonly salesCommission = signal<number | null>(0);
  ```
  (5) `canSave` ersetzen und `touched`/`requiredErrors`/`markTouched` ergänzen. Alt:
  ```ts
    readonly canSave = computed(
      () =>
        this.firstName().trim().length > 0 &&
        this.lastName().trim().length > 0 &&
        this.email().trim().length > 0 &&
        this.sellerTypeId().length > 0 &&
        !this.saving(),
    );
  ```
  Neu:
  ```ts
    private readonly touched = signal<ReadonlySet<SellerRequiredField>>(new Set());

    private readonly requiredValues = computed(() => ({
      firstName: this.firstName(),
      lastName: this.lastName(),
      city: this.city(),
      sellerTypeId: this.sellerTypeId(),
      feePerItem: this.feePerItem(),
      salesCommission: this.salesCommission(),
    }));

    /** Inline messages for empty required fields the user already left. */
    readonly requiredErrors = computed(() => sellerRequiredErrors(this.requiredValues(), this.touched()));

    readonly canSave = computed(
      () => missingSellerFields(this.requiredValues()).length === 0 && !this.saving(),
    );

    markTouched(field: SellerRequiredField): void {
      this.touched.update((current) => new Set(current).add(field));
    }
  ```
  (6) Touched beim Öffnen zurücksetzen. Alt:
  ```ts
      if (!this.visible()) return;

      const initial = this.initialValue();
  ```
  Neu:
  ```ts
      if (!this.visible()) return;

      this.touched.set(new Set());
      const initial = this.initialValue();
  ```
  (7) `onSave`, Kopf. Alt:
  ```ts
    onSave(): void {
      if (!this.canSave()) return;
      this.save.emit({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        email: this.email().trim(),
        sellerTypeId: this.sellerTypeId(),
        address: this.address().trim() || null,
        postalCode: this.postalCode().trim() || null,
        city: this.city().trim() || null,
        phone: this.phone().trim() || null,
  ```
  Neu:
  ```ts
    onSave(): void {
      const feePerItem = this.feePerItem();
      const salesCommission = this.salesCommission();
      if (!this.canSave() || feePerItem === null || salesCommission === null) return;
      this.save.emit({
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        email: this.email().trim() || null,
        sellerTypeId: this.sellerTypeId(),
        address: this.address().trim() || null,
        postalCode: this.postalCode().trim() || null,
        city: this.city().trim(),
        phone: this.phone().trim() || null,
  ```
  (8) `onSave`, Schluss. Alt:
  ```ts
        feePerItem: this.feePerItem(),
        salesCommission: this.salesCommission(),
      });
  ```
  Neu:
  ```ts
        feePerItem,
        salesCommission,
      });
  ```
  `verkaeufer-dialog.html`, Edits:

  (H1) Vorname. Alt:
  ```html
              (valueChange)="firstName.set($event)"
            />
            @if (serverErrors()?.firstName) {
              <small class="verkaeufer-dialog__error">{{ serverErrors()?.firstName }}</small>
            }
  ```
  Neu:
  ```html
              (valueChange)="firstName.set($event)"
              (blurred)="markTouched('firstName')"
            />
            @if (requiredErrors().firstName ?? serverErrors()?.firstName; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  (H2) Nachname. Alt:
  ```html
              (valueChange)="lastName.set($event)"
            />
            @if (serverErrors()?.lastName) {
              <small class="verkaeufer-dialog__error">{{ serverErrors()?.lastName }}</small>
            }
  ```
  Neu:
  ```html
              (valueChange)="lastName.set($event)"
              (blurred)="markTouched('lastName')"
            />
            @if (requiredErrors().lastName ?? serverErrors()?.lastName; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  (H3) Ort. Alt:
  ```html
              name="city"
              [debounceMs]="0"
              [value]="city()"
              (valueChange)="city.set($event)"
            />
  ```
  Neu:
  ```html
              name="city"
              [required]="true"
              [debounceMs]="0"
              [value]="city()"
              (valueChange)="city.set($event)"
              (blurred)="markTouched('city')"
            />
            @if (requiredErrors().city ?? serverErrors()?.city; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  (H4) E-Mail (kein Stern, keine Fehlermeldung). Alt:
  ```html
              type="email"
              [required]="true"
              [debounceMs]="0"
              [value]="email()"
              (valueChange)="email.set($event)"
            />
            @if (serverErrors()?.email) {
              <small class="verkaeufer-dialog__error">{{ serverErrors()?.email }}</small>
            }
  ```
  Neu:
  ```html
              type="email"
              [debounceMs]="0"
              [value]="email()"
              (valueChange)="email.set($event)"
            />
  ```
  (H5) Verkäufer-Typ, Auswahl. Alt:
  ```html
                (ngModelChange)="onTypeChange($event)"
                name="sellerTypeId"
              />
  ```
  Neu:
  ```html
                (ngModelChange)="onTypeChange($event)"
                (onBlur)="markTouched('sellerTypeId')"
                name="sellerTypeId"
              />
  ```
  (H6) Verkäufer-Typ, Fehlermeldung. Alt:
  ```html
            @if (serverErrors()?.sellerTypeId) {
              <small class="verkaeufer-dialog__error">{{ serverErrors()?.sellerTypeId }}</small>
            }
  ```
  Neu:
  ```html
            @if (requiredErrors().sellerTypeId ?? serverErrors()?.sellerTypeId; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  (H7) Gebühr. Alt:
  ```html
                name="feePerItem"
                mode="currency"
                currency="EUR"
                locale="de-DE"
                [min]="0"
                [disabled]="!conditionsEditable()"
              />
              <label for="verkaeufer-dialog-fee-per-item">Gebühr/Stück (€)</label>
            </p-iftalabel>
  ```
  Neu:
  ```html
                name="feePerItem"
                mode="currency"
                currency="EUR"
                locale="de-DE"
                [min]="0"
                [disabled]="!conditionsEditable()"
                (onBlur)="markTouched('feePerItem')"
              />
              <label for="verkaeufer-dialog-fee-per-item">
                Gebühr/Stück (€) <span class="verkaeufer-dialog__required">*</span>
              </label>
            </p-iftalabel>
            @if (requiredErrors().feePerItem; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  (H8) Provision. Alt:
  ```html
                [max]="100"
                [disabled]="!conditionsEditable()"
              />
              <label for="verkaeufer-dialog-sales-commission">Provision (%)</label>
            </p-iftalabel>
  ```
  Neu:
  ```html
                [max]="100"
                [disabled]="!conditionsEditable()"
                (onBlur)="markTouched('salesCommission')"
              />
              <label for="verkaeufer-dialog-sales-commission">
                Provision (%) <span class="verkaeufer-dialog__required">*</span>
              </label>
            </p-iftalabel>
            @if (requiredErrors().salesCommission; as message) {
              <small class="verkaeufer-dialog__error">{{ message }}</small>
            }
  ```
  `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts`, `fieldErrorsOf`. Alt:
  ```ts
        lastName: firstMessage('lastName'),
        email: firstMessage('email'),
        sellerTypeId: firstMessage('sellerTypeId'),
  ```
  Neu:
  ```ts
        lastName: firstMessage('lastName'),
        city: firstMessage('city'),
        sellerTypeId: firstMessage('sellerTypeId'),
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers` — erwartet: PASS (Dialog-Spec, Sellers-Page-Spec, Sellers-Store-Spec und die übrigen Specs unter `features/sellers`)
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(sellers): Pflichtfelder im Verkäufer-Dialog mit Inline-Meldung, E-Mail optional" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/frontend/src/app/features/sellers`

---

### Task 7: Frontend — Wizard Schritt 1 (Artikelannahme)

**ACs:** AC-1, AC-2, AC-3, AC-4, AC-12

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard/intake-wizard.ts:27-33,90-126,200-232` · `IntakeWizard` (`feePerItem`, `salesCommission`, `emailFormatError`, `canSave`, `markTouched`, `requiredErrors`, `onNext`)
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard/intake-wizard.html` · Felder Vorname, Nachname, Ort, E-Mail, Verkäufer-Typ, Gebühr, Provision
- Test: `src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard/intake-wizard.spec.ts` · `IntakeWizard`

**Interfaces:**
- Consumes: `missingSellerFields`, `sellerRequiredErrors`, `SellerRequiredField` aus `src/bazaar-app/frontend/src/app/shared/seller-form/seller-required-fields.ts` (Task 5); `CreateSellerRequest.email?: string | null` (Task 5)
- Produces:
  - `IntakeWizard.feePerItem`, `.salesCommission`: `WritableSignal<number | null>`
  - `IntakeWizard.emailFormatError: Signal<string | null>` (berechnet: gefüllte E-Mail mit ungültigem Format → `'Ungültiges E-Mail-Format.'`, sonst `null`)
  - `IntakeWizard.requiredErrors`, `IntakeWizard.markTouched(field)`, `IntakeWizard.canSave` (wie im Dialog, zusätzlich `emailFormatError() === null`)
  - `onNext()` sendet `CreateSellerRequest` mit `email: string | null` (leer → `null`) und `city: string` (getrimmt)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  (a) Zuerst die bestehenden Tests, die `onNext()` bis zum Anlegen durchlaufen, um den Ort ergänzen. Im Bash-Tool, Arbeitsverzeichnis `<R>/src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard` (absteigend, damit sich die Zeilennummern nicht verschieben):
  ```bash
  for n in 356 322 307 288 272; do sed -i -E "${n}s/^( *)(.*)\.email\.set\('max@example\.com'\);\$/&\n\1\2.city.set('Karlsruhe');/" intake-wizard.spec.ts; done
  git diff --stat -- intake-wizard.spec.ts | cat
  ```
  (b) Gate-Test ersetzen. Alt:
  ```ts
    it('gates "Weiter" on all four required fields', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      // sellerTypeId already defaulted by the SellerTypesApi.getAll() response — clear it to
      // exercise the "all four empty" starting point AC-5 describes.
      component.sellerTypeId.set('');
      expect(component.canSave()).toBe(false);

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      expect(component.canSave()).toBe(false);

      component.email.set('max@example.com');
      expect(component.canSave()).toBe(false);

      component.sellerTypeId.set('type-privat');
      expect(component.canSave()).toBe(true);
    });
  ```
  Neu:
  ```ts
    it('gates "Weiter" on all six required fields — the email is optional', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;

      // sellerTypeId, fee and commission are prefilled from the default type — empty them first.
      component.sellerTypeId.set('');
      component.feePerItem.set(null);
      component.salesCommission.set(null);
      expect(component.canSave()).toBe(false);

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      expect(component.canSave()).toBe(false);

      component.city.set('Karlsruhe');
      expect(component.canSave()).toBe(false);

      component.sellerTypeId.set('type-privat');
      expect(component.canSave()).toBe(false);

      component.feePerItem.set(0);
      expect(component.canSave()).toBe(false);

      component.salesCommission.set(0);
      expect(component.canSave()).toBe(true);
    });
  ```
  (c) Erfolgs-Test: Ort eingeben und erwarten. Alt:
  ```ts
      component.city.set('');
  ```
  Neu:
  ```ts
      component.city.set(' Karlsruhe ');
  ```
  und Alt:
  ```ts
        postalCode: null,
        city: null,
        phone: null,
      });
  ```
  Neu:
  ```ts
        postalCode: null,
        city: 'Karlsruhe',
        phone: null,
      });
  ```
  (d) Neue Tests direkt vor `  it('Cancel after a same-session creation calls SellersApi.remove(id) and then emits closed', async () => {` einfügen:
  ```ts
    it('creates the seller without an email and sends email null', async () => {
      const { fixture, create } = await setup({ createResult: createdSeller({ id: 'SEL00098' }) });
      const component = fixture.componentInstance;

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.city.set('Karlsruhe');

      component.onNext();

      expect(create).toHaveBeenCalledWith(expect.objectContaining({ email: null, city: 'Karlsruhe' }));
      expect(component.activeStep()).toBe('step2');
    });

    it('shows an inline message under each empty required field only after the field was touched', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelectorAll('.intake-wizard__error').length).toBe(0);

      component.markTouched('firstName');
      component.markTouched('city');
      fixture.detectChanges();

      const messages = Array.from(el.querySelectorAll('.intake-wizard__error')).map((m) => m.textContent?.trim());
      expect(messages).toEqual(['Vorname ist erforderlich.', 'Ort ist erforderlich.']);
    });

  ```
  (e) Format-Test (AC-12) ersetzen. Alt:
  ```ts
    it('blocks "Weiter" with an inline message when the email format is invalid', async () => {
      const { fixture, create } = await setup();
      const component = fixture.componentInstance;

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.email.set('not-an-email');

      component.onNext();

      expect(component.emailFormatError()).toBeTruthy();
      expect(create).not.toHaveBeenCalled();
      expect(component.activeStep()).toBe('step1');
    });
  ```
  Neu:
  ```ts
    it('disables "Weiter" and shows an inline message while a typed email has an invalid format', async () => {
      const { fixture, create } = await setup();
      const component = fixture.componentInstance;

      component.firstName.set('Max');
      component.lastName.set('Mustermann');
      component.city.set('Karlsruhe');
      component.email.set('not-an-email');
      fixture.detectChanges();

      expect(component.canSave()).toBe(false);
      expect(component.emailFormatError()).toBe('Ungültiges E-Mail-Format.');
      expect((fixture.nativeElement as HTMLElement).querySelector('.intake-wizard__error')?.textContent).toContain(
        'Ungültiges E-Mail-Format.',
      );

      component.onNext();
      expect(create).not.toHaveBeenCalled();
      expect(component.activeStep()).toBe('step1');

      component.email.set('');
      expect(component.emailFormatError()).toBeNull();
      expect(component.canSave()).toBe(true);
    });
  ```
  (f) Stern-Test ersetzen. Alt:
  ```ts
      it('stars exactly Vorname, Nachname, E-Mail and Verkäufer-Typ, labels in the frame', async () => {
        const el = (await setup()).fixture.nativeElement as HTMLElement;
        const starred = SPANS.map(([id]) => id).filter((id) =>
          fieldOf(el, id)?.querySelector('.app-input__required, .intake-wizard__required'),
        );
        expect(starred).toEqual([
          'intake-wizard-first-name',
          'intake-wizard-last-name',
          'intake-wizard-email',
          'intake-wizard-seller-type',
        ]);
  ```
  Neu:
  ```ts
      it('stars exactly Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr and Provision, labels in the frame', async () => {
        const el = (await setup()).fixture.nativeElement as HTMLElement;
        const starred = SPANS.map(([id]) => id).filter((id) =>
          fieldOf(el, id)?.querySelector('.app-input__required, .intake-wizard__required'),
        );
        expect(starred).toEqual([
          'intake-wizard-first-name',
          'intake-wizard-last-name',
          'intake-wizard-city',
          'intake-wizard-seller-type',
          'intake-wizard-fee-per-item',
          'intake-wizard-sales-commission',
        ]);
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/intake/components/intake-wizard/intake-wizard.spec.ts` — erwartet: FAIL (`markTouched` fehlt, `feePerItem.set(null)`, Stern-Test, `emailFormatError` ist noch kein Computed)
- [ ] **Schritt 3: Minimal implementieren**
  `intake-wizard.ts`, Edits in dieser Reihenfolge:

  (1) Import nach der `Input`-Zeile. Alt:
  ```ts
  import { Input } from '../../../../shared/components/input/input';
  ```
  Neu:
  ```ts
  import { Input } from '../../../../shared/components/input/input';
  import {
    missingSellerFields,
    SellerRequiredField,
    sellerRequiredErrors,
  } from '../../../../shared/seller-form/seller-required-fields';
  ```
  (2) Fee/Commission nullable. Alt:
  ```ts
    readonly feePerItem = signal(0);
    readonly salesCommission = signal(0);
  ```
  Neu:
  ```ts
    /** `null` while the number input is cleared; `0` is valid. */
    readonly feePerItem = signal<number | null>(0);
    readonly salesCommission = signal<number | null>(0);
  ```
  (3) Signal `emailFormatError` entfernen. Alt:
  ```ts
    readonly createError = signal<string | null>(null);
    readonly emailFormatError = signal<string | null>(null);
  ```
  Neu:
  ```ts
    readonly createError = signal<string | null>(null);
  ```
  (4) `canSave` ersetzen. Alt:
  ```ts
    readonly canSave = computed(
      () =>
        this.firstName().trim().length > 0 &&
        this.lastName().trim().length > 0 &&
        this.email().trim().length > 0 &&
        this.sellerTypeId().length > 0 &&
        !this.saving(),
    );
  ```
  Neu:
  ```ts
    private readonly touched = signal<ReadonlySet<SellerRequiredField>>(new Set());

    private readonly requiredValues = computed(() => ({
      firstName: this.firstName(),
      lastName: this.lastName(),
      city: this.city(),
      sellerTypeId: this.sellerTypeId(),
      feePerItem: this.feePerItem(),
      salesCommission: this.salesCommission(),
    }));

    /** Inline messages for empty required fields the user already left. */
    readonly requiredErrors = computed(() => sellerRequiredErrors(this.requiredValues(), this.touched()));

    /** The email is optional; only a typed email with an invalid format is reported (and blocks "Weiter"). */
    readonly emailFormatError = computed(() => {
      const email = this.email().trim();
      return email.length > 0 && !EMAIL_PATTERN.test(email) ? 'Ungültiges E-Mail-Format.' : null;
    });

    readonly canSave = computed(
      () =>
        missingSellerFields(this.requiredValues()).length === 0 &&
        this.emailFormatError() === null &&
        !this.saving(),
    );

    markTouched(field: SellerRequiredField): void {
      this.touched.update((current) => new Set(current).add(field));
    }
  ```
  (5) `onNext`, Format-Prüfung entfernen. Alt:
  ```ts
      const email = this.email().trim();
      if (!EMAIL_PATTERN.test(email)) {
        this.emailFormatError.set('Ungültiges E-Mail-Format.');
        return;
      }
      this.emailFormatError.set(null);
      this.createError.set(null);
  ```
  Neu:
  ```ts
      this.createError.set(null);
  ```
  (6) Request. Alt:
  ```ts
        email,
        sellerTypeId: this.sellerTypeId(),
  ```
  Neu:
  ```ts
        email: this.email().trim() || null,
        sellerTypeId: this.sellerTypeId(),
  ```
  (7) Alt:
  ```ts
        city: this.city().trim() || null,
  ```
  Neu:
  ```ts
        city: this.city().trim(),
  ```
  `intake-wizard.html`, Edits:

  (H1) Vorname. Alt:
  ```html
                  (valueChange)="firstName.set($event)"
                />
              </div>
  ```
  Neu:
  ```html
                  (valueChange)="firstName.set($event)"
                  (blurred)="markTouched('firstName')"
                />
                @if (requiredErrors().firstName; as message) {
                  <small class="intake-wizard__error">{{ message }}</small>
                }
              </div>
  ```
  (H2) Nachname. Alt:
  ```html
                  (valueChange)="lastName.set($event)"
                />
              </div>
  ```
  Neu:
  ```html
                  (valueChange)="lastName.set($event)"
                  (blurred)="markTouched('lastName')"
                />
                @if (requiredErrors().lastName; as message) {
                  <small class="intake-wizard__error">{{ message }}</small>
                }
              </div>
  ```
  (H3) Ort. Alt:
  ```html
                  name="city"
                  [debounceMs]="0"
                  [value]="city()"
                  (valueChange)="city.set($event)"
                />
  ```
  Neu:
  ```html
                  name="city"
                  [required]="true"
                  [debounceMs]="0"
                  [value]="city()"
                  (valueChange)="city.set($event)"
                  (blurred)="markTouched('city')"
                />
                @if (requiredErrors().city; as message) {
                  <small class="intake-wizard__error">{{ message }}</small>
                }
  ```
  (H4) E-Mail (kein Stern; Formatmeldung bleibt). Alt:
  ```html
                  type="email"
                  [required]="true"
                  [debounceMs]="0"
                  [value]="email()"
  ```
  Neu:
  ```html
                  type="email"
                  [debounceMs]="0"
                  [value]="email()"
  ```
  (H5) Verkäufer-Typ. Alt:
  ```html
                    (ngModelChange)="onTypeChange($event)"
                    name="sellerTypeId"
                  />
  ```
  Neu:
  ```html
                    (ngModelChange)="onTypeChange($event)"
                    (onBlur)="markTouched('sellerTypeId')"
                    name="sellerTypeId"
                  />
  ```
  (H6) Alt:
  ```html
                    Verkäufer-Typ <span class="intake-wizard__required">*</span>
                  </label>
                </p-iftalabel>
  ```
  Neu:
  ```html
                    Verkäufer-Typ <span class="intake-wizard__required">*</span>
                  </label>
                </p-iftalabel>
                @if (requiredErrors().sellerTypeId; as message) {
                  <small class="intake-wizard__error">{{ message }}</small>
                }
  ```
  (H7) Gebühr (immer gesperrt, daher nur Stern). Alt:
  ```html
                  <label for="intake-wizard-fee-per-item">Gebühr je Stück</label>
  ```
  Neu:
  ```html
                  <label for="intake-wizard-fee-per-item">
                    Gebühr je Stück <span class="intake-wizard__required">*</span>
                  </label>
  ```
  (H8) Provision (immer gesperrt, daher nur Stern). Alt:
  ```html
                  <label for="intake-wizard-sales-commission">Provision</label>
  ```
  Neu:
  ```html
                  <label for="intake-wizard-sales-commission">
                    Provision <span class="intake-wizard__required">*</span>
                  </label>
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/intake` — erwartet: PASS (Wizard-Spec und die übrigen Specs unter `features/intake`)
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: OK (gesamte Suite)
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(intake): Pflichtfelder im Wizard Schritt 1 mit Inline-Meldung, E-Mail optional" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- src/bazaar-app/frontend/src/app/features/intake`

---

### Task 8: Dokumentation nachführen

**ACs:** AC-11

**Dateien:**
- Modify: `docs/requirements/bazaar-app/components/verkaeufer-dialog.md` · Abschnitte Vergleichstabelle, Mockup, `## 2. Panels`, `## Akzeptanzkriterien`
- Modify: `docs/requirements/bazaar-app/entities/verkaeufer.md` · Felder-Tabelle (`city`, `email`), Absatz „Pflichtfelder sind hier schmaler"
- Modify: `docs/requirements/bazaar-app/api/sellers.md` · Abschnitt `## 3. POST /api/sellers`
- Modify: `docs/requirements/bazaar-app/entities/import-format.md` · Tabelle `## Regeln`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md` · Mockup, Feldtabelle, `**Pflichtfelder insgesamt:**`, AC-5, AC-10
- Modify: `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md` · Mockup, AC-7
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md` · AC-4
- Modify: `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md` · AC-2
- Modify: `docs/knowledge/feature-profile/bazaar-app-intake/feature.md` · Capabilities Wizard Schritt 1
- Modify: `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` · Capabilities Dialog

**Interfaces:**
- Consumes: Verhalten aus Task 1 bis 7
- Produces: Anforderungs-Doku, Profile und Glossar sind konsistent mit der Umsetzung (Glossar `docs/glossary/*.md` enthält keinen Begriff zu Pflichtfeldern; keine Änderung nötig)

- [ ] **Schritt 1: Anforderungen anpassen**
  Alle Edits mit `Edit` und dem genannten alten Text.

  `docs/requirements/bazaar-app/components/verkaeufer-dialog.md`:
  - Vergleichstabelle. Alt: `| Pflichtfelder | Adresse, PLZ, Ort, Telefon zusätzlich | nur Vorname, Nachname, E-Mail, Typ |` Neu: `| Pflichtfelder | Adresse, PLZ, Ort, Telefon zusätzlich | Vorname, Nachname, Ort, Typ, Gebühr, Provision (E-Mail optional) |`
  - Mockup Ort. Alt: `│  [PLZ            50%] [Ort             50%]     │` Neu: `│  [PLZ            50%] [Ort *           50%]     │`
  - Mockup E-Mail. Alt: `│  [Telefon        50%] [E-Mail *        50%]     │` Neu: `│  [Telefon        50%] [E-Mail          50%]     │`
  - Mockup Konditionen. Alt: `│  [Gebühr je Stück 50%] [Provision %    50%]     │` Neu: `│  [Gebühr je Stück * 50%] [Provision % * 50%]    │`
  - Panels. Alt: `| Personendaten | Vorname, Nachname, Anschrift, PLZ, Ort | Vorname, Nachname |` Neu: `| Personendaten | Vorname, Nachname, Anschrift, PLZ, Ort | Vorname, Nachname, Ort |`
  - Alt: `| Kontakt | Telefon, E-Mail | E-Mail |` Neu: `| Kontakt | Telefon, E-Mail | — |`
  - Alt: `| Konditionen | Verkäufer-Typ, Gebühr je Stück, Provision | Typ |` Neu: `| Konditionen | Verkäufer-Typ, Gebühr je Stück, Provision | Typ, Gebühr, Provision |`
  - Alt: `Die E-Mail ist Pflicht, aber **kein Login** — sie dient nur der Kontaktaufnahme, wenn nach dem Basar etwas offen ist.` Neu: `Die E-Mail ist optional und **kein Login** — sie dient nur der Kontaktaufnahme, wenn nach dem Basar etwas offen ist. Gebühr und Provision sind Pflicht, weil die Abrechnung sie braucht; sie sind immer aus dem Verkäufer-Typ vorbelegt, `0` gilt als gesetzt, ein geleertes Feld nicht.`
  - AC-1. Alt: `1. **AC-1** — THE SYSTEM SHALL als Pflichtfelder nur Vorname, Nachname, E-Mail und Verkäufer-Typ verlangen.` Neu: `1. **AC-1** — THE SYSTEM SHALL als Pflichtfelder nur Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr und Provision verlangen; die E-Mail ist optional.`
  - Nach AC-6 ergänzen. Alt: `6. **AC-6** — THE SYSTEM SHALL kein Panel für Admin-Rechte oder Einladungs-Links anzeigen.` Neu:
    ```
    6. **AC-6** — THE SYSTEM SHALL kein Panel für Admin-Rechte oder Einladungs-Links anzeigen.
    7. **AC-7** — WHILE eines der sechs Pflichtfelder leer ist, SHALL das System „Speichern" deaktiviert halten und nach dem Verlassen des Feldes eine Meldung unter dem leeren Feld anzeigen.
    ```

  `docs/requirements/bazaar-app/entities/verkaeufer.md`:
  - Alt: ``| `city` | string | ❌ | Ort — optional |`` Neu: ``| `city` | string | ✅ | Ort — am Annahmeplatz Pflicht; bei Altbestand ohne Ort bleibt der Wert leer |``
  - Alt: ``| `email` | string | ✅ | Kontakt. **Kein Login** — die Haupt-App hat keine Verkäufer-Anmeldung |`` Neu: ``| `email` | string | ❌ | Kontakt, optional. **Kein Login** — die Haupt-App hat keine Verkäufer-Anmeldung |``
  - Absatz. Alt:
    ```
    **Pflichtfelder sind hier schmaler als in der Voranmelde-App:** Pflicht sind nur
    `firstName`, `lastName`, `email` und `sellerTypeId`. Adresse, PLZ, Ort und Telefon
    bleiben optional, weil Laufkundschaft am Annahmeplatz erfasst wird, während eine Schlange
    wartet (siehe [ANNAHME-S02](../epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md)).
    Die Voranmelde-App verlangt sie, weil dort der Verkäufer selbst und ohne Zeitdruck tippt.
    ```
    Neu:
    ```
    **Pflichtfelder sind hier schmaler als in der Voranmelde-App:** Pflicht sind
    `firstName`, `lastName`, `city`, `sellerTypeId`, `salesCommission` und `feePerItem`.
    Adresse, PLZ, Telefon und E-Mail bleiben optional, weil Laufkundschaft am Annahmeplatz
    erfasst wird, während eine Schlange wartet (siehe [ANNAHME-S02](../epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md)).
    Die Voranmelde-App verlangt sie, weil dort der Verkäufer selbst und ohne Zeitdruck tippt.
    Gebühr und Provision leitet der Server beim Anlegen aus dem Verkäufer-Typ ab; die Pflicht
    gilt für die Formulare, in denen sie immer vorbelegt sind.
    ```

  `docs/requirements/bazaar-app/api/sellers.md`:
  - Request-Beispiel. Alt: `  "address": null, "postalCode": null, "city": null, "phone": null` Neu: `  "address": null, "postalCode": null, "city": "Karlsruhe", "phone": null` (nur der Treffer unter `## 3. POST /api/sellers`; der Text kommt dort einmal vor — vorher mit `grep -n '"city": null' docs/requirements/bazaar-app/api/sellers.md` prüfen und bei mehreren Treffern den mit `"sellerTypeId": "b7c1e4f2"` davor ändern).
  - Alt: ``**Pflicht:** `firstName`, `lastName`, `email`, `sellerTypeId`. Adresse, PLZ, Ort und Telefon bleiben optional, weil Laufkundschaft erfasst wird, während eine Schlange wartet.`` Neu: ``**Pflicht:** `firstName`, `lastName`, `city`, `sellerTypeId`. Adresse, PLZ, Telefon und E-Mail bleiben optional, weil Laufkundschaft erfasst wird, während eine Schlange wartet. Ein Request ohne Pflichtfeld antwortet mit `400` und dem Feldfehler. Gebühr und Provision werden serverseitig nicht als Pflicht geprüft (siehe unten).``
  - `PUT /api/sellers/{id}` gilt dieselbe Pflicht; im Abschnitt zu `PUT` (Beispiel mit `"salesCommission": 12.5`) einen Satz ergänzen. Zuerst `grep -n "204 No Content" docs/requirements/bazaar-app/api/sellers.md` ausführen, direkt unter dem `→ 204 No Content`-Block des `PUT`-Beispiels (nach dem schließenden ```` ``` ````) einfügen: `**Pflicht:** wie bei `POST` — `firstName`, `lastName`, `city`, `sellerTypeId`; `email` ist optional (leer wird als nicht vorhanden gespeichert).`

  `docs/requirements/bazaar-app/entities/import-format.md`, Tabelle `## Regeln`:
  - Alt: ``| Optionale Felder | `address` und `description` können fehlen oder `null` sein, werden aber übertragen — beide Felder existieren hier und am Basar-Tag neu zu erfassen wäre unnötig |`` Neu:
    ```
    | Pflichtfelder je Verkäufer | `id`, `firstName`, `lastName`, `city`, `sellerType` und `articles` müssen vorhanden sein. Fehlt eines (oder ist `city` leer), lehnt die Haupt-App die **ganze Datei** mit `import.invalid_format` ab |
    | Optionale Felder | `address`, `postalCode`, `phone`, `email` und `description` können fehlen oder `null` sein, werden aber übertragen — die Felder existieren hier und am Basar-Tag neu zu erfassen wäre unnötig |
    ```

  `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md`:
  - Mockup Ort. Alt: `│ [PLZ            33%] [Ort           67%] │` Neu: `│ [PLZ            33%] [Ort *         67%] │`
  - Mockup E-Mail. Alt: `│ [Telefon        50%] [E-Mail *      50%] │` Neu: `│ [Telefon        50%] [E-Mail        50%] │`
  - Mockup Konditionen. Alt: `│ [Typ * 33%] [Gebühr je St. 33%] [Prov. 33%] │  ← vorausgefüllt bei Typ-Wechsel (AC-6)` Neu: `│ [Typ * 33%] [Gebühr je St. * 33%] [Prov. * 33%] │  ← vorausgefüllt bei Typ-Wechsel (AC-6)`
  - Tabelle. Alt: ``| 01 PERSONENDATEN | Ort | `city` | 67 % | ❌ | `app-input` |`` Neu: ``| 01 PERSONENDATEN | Ort | `city` | 67 % | ✅ | `app-input` |``
  - Alt: ``| 02 KONTAKT | E-Mail | `email` | 50 % | ✅ | `app-input` |`` Neu: ``| 02 KONTAKT | E-Mail | `email` | 50 % | ❌ | `app-input` |``
  - Alt: ``| 03 KONDITIONEN | Gebühr je Stück | `feePerItem` | 33 % | ❌ | `p-inputnumber` (€, 2 Dez.) |`` Neu: ``| 03 KONDITIONEN | Gebühr je Stück | `feePerItem` | 33 % | ✅ | `p-inputnumber` (€, 2 Dez.) |``
  - Alt: ``| 03 KONDITIONEN | Provision | `salesCommission` | 33 % | ❌ | `p-inputnumber` (%, 2 Dez.) |`` Neu: ``| 03 KONDITIONEN | Provision | `salesCommission` | 33 % | ✅ | `p-inputnumber` (%, 2 Dez.) |``
  - Alt: `**Pflichtfelder insgesamt:** Vorname, Nachname, E-Mail, Verkäufer-Typ.` Neu: `**Pflichtfelder insgesamt:** Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision. Die E-Mail ist optional; ist sie eingegeben, muss sie ein gültiges Format haben.`
  - AC-5. Alt: `- [ ] **AC-5** — WHILE mindestens eines der Pflichtfelder (Vorname, Nachname, E-Mail, Verkäufer-Typ) leer ist, SHALL das System den „Weiter"-Button deaktiviert halten.` Neu: `- [ ] **AC-5** — WHILE mindestens eines der Pflichtfelder (Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision) leer ist, SHALL das System den „Weiter"-Button deaktiviert halten und nach dem Verlassen des Feldes eine Meldung unter dem leeren Feld anzeigen.`
  - AC-10. Alt: `- [ ] **AC-10** — IF die E-Mail-Adresse kein gültiges Format hat, THEN SHALL das System die Meldung unter dem Feld anzeigen und nicht speichern.` Neu: `- [ ] **AC-10** — IF eine eingegebene E-Mail-Adresse kein gültiges Format hat, THEN SHALL das System die Meldung unter dem Feld anzeigen und den „Weiter"-Button deaktiviert halten; eine leere E-Mail ist nie ein Fehler.`

  `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md`:
  - Mockup Ort. Alt: `│ │ [PLZ      33%] [Ort                   67%] │   │` Neu: `│ │ [PLZ      33%] [Ort *                 67%] │   │`
  - Mockup E-Mail. Alt: `│ │ [Telefon      50%] [E-Mail *          50%] │   │` Neu: `│ │ [Telefon      50%] [E-Mail            50%] │   │`
  - Mockup Konditionen. Alt: `│ │ [Typ * 33%] [Gebühr j.St. 33%] [Prov. 33%] │   │  ← vorausgefüllt bei Typ-Wechsel (AC-5)` Neu: `│ │ [Typ * 33%] [Gebühr j.St.* 33%] [Prov.* 33%] │   │  ← vorausgefüllt bei Typ-Wechsel (AC-5)`
  - AC-7. Alt: `- [ ] **AC-7** — IF beim Speichern ein Pflichtfeld (Vorname, Nachname, E-Mail, Verkäufer-Typ) leer ist, THEN SHALL das System eine Inline-Fehlermeldung unter dem jeweiligen Feld anzeigen und nicht speichern.` Neu: `- [ ] **AC-7** — WHILE ein Pflichtfeld (Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision) leer ist, SHALL das System „Speichern" deaktiviert halten und nach dem Verlassen des Feldes eine Inline-Meldung unter dem leeren Feld anzeigen; die E-Mail ist optional.`

  `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md`, AC-4. Alt: `alle Pflichtfelder (Vorname, Nachname) ausgefüllt sind` Neu: `alle Pflichtfelder (Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision) ausgefüllt sind`

  `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md`, AC-2. Alt: `ein Popup mit leeren Pflichtfeldern (Vorname, Nachname) öffnen` Neu: `ein Popup mit leeren Pflichtfeldern (Vorname, Nachname, Ort) öffnen`
- [ ] **Schritt 2: Profile anpassen**
  `docs/knowledge/feature-profile/bazaar-app-intake/feature.md`:
  - Alt: `- User can fill in seller master data (Vorname*, Nachname*, Anschrift, PLZ, Ort, Telefon, E-Mail*, Verkäufer-Typ*) in Wizard-Schritt 1 — `components/intake-wizard/intake-wizard.html`` Neu: `- User can fill in seller master data (Vorname*, Nachname*, Anschrift, PLZ, Ort*, Telefon, E-Mail, Verkäufer-Typ*, Gebühr*, Provision*) in Wizard-Schritt 1; "Weiter" bleibt gesperrt, solange ein Pflichtfeld leer ist, und unter einem verlassenen leeren Pflichtfeld erscheint eine Meldung — `components/intake-wizard/intake-wizard.html`, `intake-wizard.ts` (`canSave`, `requiredErrors`)`
  - Alt: `- User sees E-Mail-Format-Validierung vor dem Anlegen — `intake-wizard.ts` (`EMAIL_PATTERN`, `onNext`)` Neu: `- User sees E-Mail-Format-Validierung nur bei eingegebener E-Mail; ein ungültiges Format sperrt "Weiter" und zeigt eine Meldung unter dem Feld, eine leere E-Mail ist erlaubt — `intake-wizard.ts` (`EMAIL_PATTERN`, `emailFormatError`)`
  - Alt: `**Last reviewed:** 2026-09-23` Neu: `**Last reviewed:** 2026-10-13`

  `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md`: nach der Zeile `- User can create a new seller via a dialog (Personendaten/Kontakt/Konditionen) — `components/verkaeufer-dialog/verkaeufer-dialog.ts`` einfügen:
  ```
  - User sees Vorname*, Nachname*, Ort*, Verkäufer-Typ*, Gebühr* und Provision* als Pflichtfelder im Dialog (E-Mail optional); "Speichern" bleibt gesperrt, solange eines leer ist, und unter einem verlassenen leeren Pflichtfeld erscheint eine Meldung — `verkaeufer-dialog.ts` (`canSave`, `requiredErrors`), `verkaeufer-dialog.html`
  ```
- [ ] **Schritt 3: Doku prüfen**
  Befehl: `grep -rn "Vorname, Nachname, E-Mail" <R>/docs/requirements/bazaar-app <R>/docs/knowledge/feature-profile/bazaar-app-intake <R>/docs/knowledge/feature-profile/bazaar-app-sellers` — erwartet: keine Treffer (leere Ausgabe)
  Befehl: `grep -rn "E-Mail \*" <R>/docs/requirements/bazaar-app` — erwartet: keine Treffer
- [ ] **Schritt 4: Commit**
  `git commit -m "docs(sellers): Pflichtfelder Ort, Gebühr und Provision, E-Mail optional" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" -- docs/requirements/bazaar-app docs/knowledge/feature-profile/bazaar-app-intake docs/knowledge/feature-profile/bazaar-app-sellers`

---

## Entscheidungen
- **W · Pflicht-Verhalten bei leerem Feld** · Aussage — Button gesperrt und Inline-Meldung unter jedem leeren Pflichtfeld, sobald das Feld verlassen wurde (Antwort des Menschen im Plan-Writing auf die Frage zu AC-2: „Button gesperrt + Meldung").
- **E · Gemeinsamer Helper statt doppelter Regel** · Planer — Die Pflichtfeld-Regel (`missingSellerFields`, `sellerRequiredErrors`) liegt einmal in `shared/seller-form/`, weil Dialog und Wizard dieselben sechs Felder und Meldungen brauchen; die Features importieren `shared` ohnehin.
- **E · Ort-Typ in den Frontend-Requests unverändert** · Planer — `CreateSellerRequest.city` und `UpdateSellerRequest.city` bleiben optional typisiert, der Server liefert bei leerem Ort `400`; die Pflicht erzwingen Dialog und Wizard über `canSave`. So brauchen die vorhandenen Specs, die Requests ohne `city` bauen, keine Änderung.
- **E · Wizard-Gebühr/-Provision nur mit Stern** · Planer — Die Felder sind im Wizard immer gesperrt (`conditionsEditable` fix `false`) und vorbelegt; sie tragen den Stern und zählen in `canSave`, bekommen aber weder `onBlur` noch Meldung, weil der Nutzer sie nicht leeren kann.
- **E · Format-Meldung der E-Mail als Computed** · Planer — `emailFormatError` im Wizard wird berechnet statt per `onNext` gesetzt, damit „Weiter" laut AC-12 gesperrt ist, sobald das Format ungültig ist.
- **E · Test-Fixtures per `sed`** · Planer — Rund 30 bestehende Backend-Testaufrufe übergeben `null` als Ort und würden an der neuen Domain-Regel scheitern; ein mechanischer Ersatz durch `"Karlsruhe"` hält den Diff klein und verändert keine Testabsicht.
- **E · Migration ohne `database update`** · Planer — Die Migration entsteht per `dotnet ef migrations add` mit Dummy-Connection-String und wird mit `has-pending-model-changes` geprüft; angewendet wird sie beim Start der Anwendung durch `Migrate()`.
- **E · Spec-Hinweise ohne Auswirkung auf den Plan** · Planer — Die sechs offenen Formulierungs-Hinweise des Spec-Reviews ändern kein Verhalten; der Plan folgt den Akzeptanzkriterien wie freigegeben.

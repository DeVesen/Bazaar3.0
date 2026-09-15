FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Erst nur die Projektdateien kopieren, damit der Restore-Layer gecacht bleibt.
COPY ["Directory.Build.props", "Directory.Packages.props", "./"]
COPY ["BAR.SharedKernel/BAR.SharedKernel.csproj", "BAR.SharedKernel/"]
COPY ["BAR.Modules.Registration/BAR.Modules.Registration.csproj", "BAR.Modules.Registration/"]
COPY ["BAR.Modules.Registration.Contracts/BAR.Modules.Registration.Contracts.csproj", "BAR.Modules.Registration.Contracts/"]
COPY ["BAR.Modules.SellerManagement/BAR.Modules.SellerManagement.csproj", "BAR.Modules.SellerManagement/"]
COPY ["BAR.Modules.SellerManagement.Contracts/BAR.Modules.SellerManagement.Contracts.csproj", "BAR.Modules.SellerManagement.Contracts/"]
COPY ["BAR.Modules.MasterData/BAR.Modules.MasterData.csproj", "BAR.Modules.MasterData/"]
COPY ["BAR.Modules.MasterData.Contracts/BAR.Modules.MasterData.Contracts.csproj", "BAR.Modules.MasterData.Contracts/"]
COPY ["BAR.Modules.Operations/BAR.Modules.Operations.csproj", "BAR.Modules.Operations/"]
COPY ["BAR.Modules.Operations.Contracts/BAR.Modules.Operations.Contracts.csproj", "BAR.Modules.Operations.Contracts/"]
COPY ["BAR.Modules.Export/BAR.Modules.Export.csproj", "BAR.Modules.Export/"]
COPY ["BAR.Host/BAR.Host.csproj", "BAR.Host/"]
RUN dotnet restore "BAR.Host/BAR.Host.csproj"

COPY . .
RUN dotnet publish "BAR.Host/BAR.Host.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BAR.Host.dll"]

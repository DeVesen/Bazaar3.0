FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Erst nur die Projektdateien kopieren, damit der Restore-Layer gecacht bleibt.
COPY ["Directory.Build.props", "Directory.Packages.props", "./"]
COPY ["BAR.Domain/BAR.Domain.csproj", "BAR.Domain/"]
COPY ["BAR.Application/BAR.Application.csproj", "BAR.Application/"]
COPY ["BAR.Infrastructure/BAR.Infrastructure.csproj", "BAR.Infrastructure/"]
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

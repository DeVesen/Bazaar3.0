<#
.SYNOPSIS
    Baut die Docker-Images der Haupt-App (Backend + Frontend) und pusht sie nach Docker Hub.

.DESCRIPTION
    Die Dockerfiles bauen mehrstufig: .NET-Publish bzw. ng build laufen im Image-Build.
    Jedes Image bekommt die Tags "latest" und die angegebene Version.
    Voraussetzung: Docker läuft, "docker login" ist für den Docker-Hub-Account erfolgt.

.EXAMPLE
    ./publish-images.ps1 -Version 1.2.0

.EXAMPLE
    ./publish-images.ps1 -Version 1.2.0 -SkipPush
#>
[CmdletBinding()]
param(
    # Versions-Tag, z. B. 1.2.0. Ohne Angabe: Datum und Uhrzeit, z. B. 2026.10.31-1430.
    [string] $Version = (Get-Date -Format 'yyyy.MM.dd-HHmm'),

    [string] $DockerHubUser = 'devesen',

    # Nur bauen und taggen, nicht pushen.
    [switch] $SkipPush
)

$ErrorActionPreference = 'Stop'

if ($Version -notmatch '^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$') {
    throw "Ungültiger Versions-Tag '$Version' (erlaubt: Buchstaben, Ziffern, '.', '-', '_')."
}

function Invoke-Docker {
    param([string[]] $Arguments)
    Write-Host "> docker $($Arguments -join ' ')" -ForegroundColor DarkGray
    & docker @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker $($Arguments[0]) ist mit Exit-Code $LASTEXITCODE fehlgeschlagen."
    }
}

$images = @(
    @{ Name = 'bazaar-app-backend';  Context = Join-Path $PSScriptRoot 'backend' }
    @{ Name = 'bazaar-app-frontend'; Context = Join-Path $PSScriptRoot 'frontend' }
)

foreach ($image in $images) {
    $repository = "$DockerHubUser/$($image.Name)"
    Write-Host "`n=== $repository ($Version) ===" -ForegroundColor Cyan

    Invoke-Docker @('build', '--platform', 'linux/amd64',
        '-t', "${repository}:latest", '-t', "${repository}:$Version", $image.Context)

    if (-not $SkipPush) {
        Invoke-Docker @('push', "${repository}:$Version")
        Invoke-Docker @('push', "${repository}:latest")
    }
}

$action = if ($SkipPush) { 'gebaut (nicht gepusht)' } else { 'gebaut und gepusht' }
Write-Host "`nFertig: Images mit Tags 'latest' und '$Version' $action." -ForegroundColor Green

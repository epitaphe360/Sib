# Configuration EAS UrbaEvent — à lancer après `eas login`
# Usage: cd apps/mobile; .\scripts\setup-eas.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot + "\.."

Write-Host "→ Vérification connexion Expo..." -ForegroundColor Cyan
$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Non connecté. Lancez: eas login" -ForegroundColor Yellow
  exit 1
}
Write-Host "Connecté: $whoami" -ForegroundColor Green

Write-Host "→ eas init (liaison projet)..." -ForegroundColor Cyan
eas init --non-interactive

Write-Host "→ Mise à jour app.json avec projectId..." -ForegroundColor Cyan
$projectId = (Get-Content app.json -Raw | ConvertFrom-Json).expo.extra.eas.projectId
if ($projectId -and $projectId -ne "REPLACE_AFTER_eas_init") {
  Write-Host "projectId: $projectId" -ForegroundColor Green
} else {
  Write-Warning "projectId non mis à jour — vérifiez app.json manuellement"
}

Write-Host "→ Build production iOS + Android (cloud EAS)..." -ForegroundColor Cyan
Write-Host "  Durée estimée: 15-30 min par plateforme" -ForegroundColor DarkGray
eas build --profile production --platform all --non-interactive

Write-Host "→ Terminé. Suivez la progression sur https://expo.dev" -ForegroundColor Green

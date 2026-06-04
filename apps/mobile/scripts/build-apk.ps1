# Build APK local (Windows) — évite la limite de 260 caractères de chemin
# Usage: cd apps/mobile; .\scripts\build-apk.ps1

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$mobile = Join-Path $root "apps\mobile"

if (-not (Get-PSDrive -Name S -ErrorAction SilentlyContinue)) {
  subst S: $root
  Write-Host "→ Lecteur S: mappé sur $root" -ForegroundColor DarkGray
}

$env:ANDROID_HOME = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }
$env:NODE_ENV = "production"

Set-Location (Join-Path $root "apps\mobile")

Write-Host "→ Téléchargement images..." -ForegroundColor Cyan
npm run download-images

if (-not (Test-Path "android")) {
  Write-Host "→ expo prebuild..." -ForegroundColor Cyan
  npx expo prebuild --platform android --no-install
}

Write-Host "→ Gradle assembleRelease..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleRelease --no-daemon

$apkSrc = "app\build\outputs\apk\release\app-release.apk"
$destDir = Join-Path $mobile "dist"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$dest = Join-Path $destDir "UrbaEvent-1.0.0-release.apk"
Copy-Item $apkSrc $dest -Force

Write-Host ""
Write-Host "✓ APK prêt:" -ForegroundColor Green
Write-Host "  $dest"
Write-Host "  $([math]::Round((Get-Item $dest).Length/1MB, 2)) MB"

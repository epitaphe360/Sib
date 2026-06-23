# Build APK local (Windows) -- evite la limite de 260 caracteres de chemin
# Usage: cd apps/mobile; .\scripts\build-apk.ps1

$ErrorActionPreference = "Stop"
$mobile = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$buildRoot = "C:\sib-mobile-build"
$appJson = Get-Content (Join-Path $mobile "app.json") -Raw | ConvertFrom-Json
$version = $appJson.expo.version

$env:ANDROID_HOME = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }
$env:NODE_ENV = "production"
$env:GRADLE_USER_HOME = "C:\gradle-cache"

$envFile = Join-Path $mobile ".env"
if (-not (Test-Path $envFile)) {
  throw ".env file missing at $envFile - EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY required"
}
Get-Content $envFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
    $idx = $line.IndexOf("=")
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    if ($key.StartsWith("EXPO_PUBLIC_")) {
      Set-Item -Path "env:$key" -Value $val
    }
  }
}
if (-not $env:EXPO_PUBLIC_SUPABASE_URL -or -not $env:EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw ".env incomplete: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY required"
}

# Production store — quick-login désactivé (activer preview: $env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN='true')
$env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN = if ($env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN) { $env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN } else { "false" }
$env:EXPO_PUBLIC_PAYMENT_ENABLED = if ($env:EXPO_PUBLIC_PAYMENT_ENABLED) { $env:EXPO_PUBLIC_PAYMENT_ENABLED } else { "true" }
$apkSuffix = if ($env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN -eq "true") { "-release-demo" } else { "-release" }
$apkName = "UrbaEvent-$version$apkSuffix.apk"
Write-Host "[build] Quick-login demo: $($env:EXPO_PUBLIC_ENABLE_QUICK_LOGIN)" -ForegroundColor Cyan

Write-Host "[build] Sync to $buildRoot (outside OneDrive)..." -ForegroundColor Cyan
if (Test-Path $buildRoot) { Remove-Item -Recurse -Force $buildRoot }
New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null
robocopy $mobile $buildRoot /E /XD node_modules android .expo dist /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with code $LASTEXITCODE" }

Set-Location $buildRoot
Write-Host "[build] npm install..." -ForegroundColor Cyan
npm install --include=dev --no-fund --no-audit

Write-Host "[build] generate-icons..." -ForegroundColor Cyan
npm run generate-icons
if ($LASTEXITCODE -ne 0) { throw "generate-icons failed with code $LASTEXITCODE" }

Write-Host "[build] download-images..." -ForegroundColor Cyan
npm run download-images
if ($LASTEXITCODE -ne 0) { throw "download-images failed with code $LASTEXITCODE" }

Write-Host "[build] optimize-assets..." -ForegroundColor Cyan
node scripts/optimize-assets.mjs
if ($LASTEXITCODE -ne 0) { throw "optimize-assets failed with code $LASTEXITCODE" }

if (Test-Path "android") { Remove-Item -Recurse -Force android }
Write-Host "[build] expo prebuild..." -ForegroundColor Cyan
npx expo prebuild --platform android --no-install

Write-Host "[build] Gradle assembleRelease..." -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleRelease --no-daemon
if ($LASTEXITCODE -ne 0) { throw "Gradle assembleRelease failed with code $LASTEXITCODE" }

$apkSrc = Join-Path $buildRoot "android\app\build\outputs\apk\release\app-release.apk"
$destDir = Join-Path $mobile "dist"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$dest = Join-Path $destDir $apkName
Copy-Item $apkSrc $dest -Force

$sizeMb = [math]::Round((Get-Item $dest).Length / 1MB, 2)
Write-Host ""
Write-Host "[build] APK ready:" -ForegroundColor Green
Write-Host "  $dest"
Write-Host "  $sizeMb MB"

# setup.ps1 — Bootstrap du projet Flutter SIB Zone Scanner
# Exécuter depuis : sib_zone_scanner\
# Prérequis : Flutter SDK installé et dans PATH

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "=== SIB Zone Scanner — Initialisation Flutter ===" -ForegroundColor Cyan

# ── 1. Créer le projet Flutter (si pas encore créé) ──────────────────────────
if (-not (Test-Path "android\app")) {
    Write-Host "> Création du projet Flutter..." -ForegroundColor Yellow
    flutter create . --org com.sib --project-name sib_zone_scanner
} else {
    Write-Host "> Projet Flutter déjà initialisé." -ForegroundColor Green
}

# ── 2. AndroidManifest.xml : permissions caméra ──────────────────────────────
$manifestPath = "android\app\src\main\AndroidManifest.xml"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw

    $cameraPermission = '<uses-permission android:name="android.permission.CAMERA"/>'
    $flashlightPermission = '<uses-permission android:name="android.permission.FLASHLIGHT"/>'
    $internetPermission = '<uses-permission android:name="android.permission.INTERNET"/>'

    if ($manifest -notmatch 'android.permission.CAMERA') {
        $manifest = $manifest -replace '<manifest ', "$cameraPermission`n$flashlightPermission`n$internetPermission`n<manifest "
        Set-Content $manifestPath $manifest -Encoding UTF8
        Write-Host "> Permissions ajoutées dans AndroidManifest.xml" -ForegroundColor Green
    } else {
        Write-Host "> Permissions déjà présentes." -ForegroundColor Green
    }
} else {
    Write-Host "ATTENTION : AndroidManifest.xml introuvable — vérifiez la création du projet." -ForegroundColor Red
}

# ── 3. Installer les dépendances ─────────────────────────────────────────────
Write-Host "> Installation des dépendances Flutter..." -ForegroundColor Yellow
flutter pub get

# ── 4. Instructions de build ─────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Instructions de build ===" -ForegroundColor Cyan
Write-Host "  APK debug   : flutter build apk --debug"
Write-Host "  APK release : flutter build apk --release"
Write-Host "  Installer   : flutter install"
Write-Host ""
Write-Host "=== Fichiers source créés ===" -ForegroundColor Cyan
Write-Host "  lib/main.dart"
Write-Host "  lib/config.dart"
Write-Host "  lib/models/control_zone.dart"
Write-Host "  lib/models/badge_info.dart"
Write-Host "  lib/models/scan_result.dart"
Write-Host "  lib/services/zone_service.dart"
Write-Host "  lib/services/scanner_service.dart"
Write-Host "  lib/screens/login_screen.dart"
Write-Host "  lib/screens/zone_select_screen.dart"
Write-Host "  lib/screens/scanner_screen.dart"
Write-Host "  lib/screens/result_screen.dart"
Write-Host ""
Write-Host "=== Migrations SQL à appliquer ===" -ForegroundColor Cyan
Write-Host "  migrations/20260511_create_control_zones.sql"
Write-Host "  migrations/20260511_extend_badge_scans.sql"
Write-Host ""
Write-Host "PRÊT !" -ForegroundColor Green

# ============================================================
# SCRIPT: Appliquer toutes les migrations Supabase automatiquement
# Usage: .\apply-all-migrations.ps1
# OU avec token direct: .\apply-all-migrations.ps1 -Token "sbp_xxx"
# ============================================================
param(
    [string]$Token = ""
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MIGRATIONS SUPABASE - SIB 2026              " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Obtenir le token
if (-not $Token) {
    $Token = $env:SUPABASE_ACCESS_TOKEN
}

if (-not $Token) {
    Write-Host "Token Supabase requis." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ouverture du navigateur pour générer un token..." -ForegroundColor White
    Start-Process "https://supabase.com/dashboard/account/tokens"
    Write-Host ""
    Write-Host "Dans le navigateur :" -ForegroundColor White
    Write-Host "  1. Cliquer 'Generate new token'" -ForegroundColor Gray
    Write-Host "  2. Donner un nom (ex: SIB migrations)" -ForegroundColor Gray
    Write-Host "  3. Copier le token qui commence par sbp_" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "Coller le token ici"
    if (-not $Token -or $Token.Length -lt 10) {
        Write-Host "Token invalide. Annulation." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Token reçu. Lancement des migrations..." -ForegroundColor Green
Write-Host ""

# 2. Exporter le token et lancer le script Node.js
$env:SUPABASE_ACCESS_TOKEN = $Token

$nodePath = "C:\Program Files\nodejs\node.exe"
if (-not (Test-Path $nodePath)) {
    $nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
}

if (-not $nodePath) {
    Write-Host "Node.js introuvable !" -ForegroundColor Red
    exit 1
}

$scriptPath = Join-Path $ScriptDir "migrate-management-api.mjs"
& $nodePath $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  MIGRATIONS TERMINÉES AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  DES ERREURS ONT ÉTÉ RENCONTRÉES." -ForegroundColor Red
    Write-Host "  Voir les détails ci-dessus." -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    exit 1
}

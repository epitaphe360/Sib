#!/usr/bin/env pwsh
# ========================================
# CRÉATION AUTOMATIQUE DES COMPTES E2E
# ========================================

Write-Host "`n" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRÉATION DES COMPTES DE TEST E2E" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier si un serveur tourne déjà
$frontendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -Method Head -TimeoutSec 2 -ErrorAction Stop
    $frontendRunning = $true
    Write-Host "✅ Frontend déjà actif sur http://localhost:5173`n" -ForegroundColor Green
} catch {
    Write-Host "⏳ Lancement du serveur frontend..." -ForegroundColor Yellow
    # Lancer npm run dev en arrière-plan
    $frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\samye\OneDrive\Desktop\siportversionfinal\siportv3'; npm run dev" -PassThru
    Write-Host "   PID: $($frontendProcess.Id)`n" -ForegroundColor Gray
    
    # Attendre que le serveur soit prêt
    Write-Host "⏳ Attente du serveur (max 30 sec)..." -ForegroundColor Yellow
    $timeout = 30
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -Method Head -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Serveur prêt!`n" -ForegroundColor Green
            $frontendRunning = $true
            break
        } catch {
            Start-Sleep -Seconds 1
            $elapsed++
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    
    if (-not $frontendRunning) {
        Write-Host "`n❌ Le serveur n'a pas démarré" -ForegroundColor Red
        exit 1
    }
}

# Lancer le script de création des comptes
Write-Host "🚀 Lancement de la création des comptes..`n" -ForegroundColor Cyan
cd c:\Users\samye\OneDrive\Desktop\siportversionfinal\siportv3
node scripts/create-test-accounts.mjs

Write-Host "`n✅ Processus terminé!`n" -ForegroundColor Green

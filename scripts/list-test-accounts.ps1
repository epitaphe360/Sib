# ========================================
# SCRIPT DE CRÉATION DES COMPTES DE TEST
# ========================================
# Ce script crée automatiquement les 10 comptes
# via l'interface d'inscription du frontend
# ========================================

Write-Host "🚀 CRÉATION DES COMPTES DE TEST E2E" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Vérifier que le serveur tourne
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend actif sur http://localhost:5173`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Le frontend n'est pas démarré!" -ForegroundColor Red
    Write-Host "   Lancez d'abord: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Les comptes suivants doivent être créés manuellement:" -ForegroundColor Yellow
Write-Host "   via http://localhost:5173/register`n"

$accounts = @(
    @{ Email = "visitor-free@test.siport.com"; Type = "Visiteur"; Level = "Gratuit"; Name = "Visiteur Free Test" },
    @{ Email = "visitor-vip@test.siport.com"; Type = "Visiteur"; Level = "VIP 700€"; Name = "Visiteur VIP Test" },
    @{ Email = "exhibitor-9m@test.siport.com"; Type = "Exposant"; Level = "9m²"; Name = "Exposant 9m Test" },
    @{ Email = "exhibitor-18m@test.siport.com"; Type = "Exposant"; Level = "18m²"; Name = "Exposant 18m Test" },
    @{ Email = "exhibitor-36m@test.siport.com"; Type = "Exposant"; Level = "36m²"; Name = "Exposant 36m Test" },
    @{ Email = "partner-museum@test.siport.com"; Type = "Partenaire"; Level = "Musée"; Name = "Partenaire Musée" },
    @{ Email = "partner-chamber@test.siport.com"; Type = "Partenaire"; Level = "Chambre"; Name = "Partenaire Chambre" },
    @{ Email = "partner-sponsor@test.siport.com"; Type = "Partenaire"; Level = "Sponsor"; Name = "Partenaire Sponsor" },
    @{ Email = "admin-test@test.siport.com"; Type = "Admin"; Level = "Admin"; Name = "Admin Test" }
)

$i = 1
foreach ($account in $accounts) {
    Write-Host "[$i/10] $($account.Email)" -ForegroundColor White
    Write-Host "      Type: $($account.Type) - $($account.Level)" -ForegroundColor Gray
    Write-Host "      Nom: $($account.Name)" -ForegroundColor Gray
    Write-Host "      Mot de passe: Test@1234567`n" -ForegroundColor Gray
    $i++
}

Write-Host "`n💡 ALTERNATIVE RAPIDE:" -ForegroundColor Cyan
Write-Host "   Si vous avez Supabase local, exécutez:" -ForegroundColor Yellow
Write-Host "   node scripts/create-test-accounts-via-api.mjs`n" -ForegroundColor White

Write-Host "📝 POUR LES TESTS E2E:" -ForegroundColor Cyan
Write-Host "   Une fois les comptes créés, lancez:" -ForegroundColor Yellow
Write-Host "   npx playwright test functional-tests-with-existing-accounts.spec.ts`n" -ForegroundColor White

# Script de déploiement de l'Edge Function scrape-and-create-minisite
# Ce script déploie la fonction avec gestion des erreurs CORS

Write-Host "🚀 Déploiement de la fonction Edge Supabase..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si Supabase CLI est installé
$supabaseVersion = supabase --version 2>$null
if (-not $supabaseVersion) {
    Write-Host "❌ Supabase CLI n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green

# Vérifier si le projet est lié
$linkedProject = supabase projects list 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Projet non lié. Connexion..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exécutez d'abord:" -ForegroundColor Cyan
    Write-Host "  supabase login" -ForegroundColor White
    Write-Host "  supabase link --project-ref eqjoqgpbxhsfgcovipgu" -ForegroundColor White
    exit 1
}

Write-Host "✅ Projet Supabase lié" -ForegroundColor Green
Write-Host ""

# Déployer la fonction
Write-Host "📤 Déploiement de scrape-and-create-minisite..." -ForegroundColor Cyan
supabase functions deploy scrape-and-create-minisite

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Déploiement réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Informations:" -ForegroundColor Cyan
    Write-Host "  URL: https://eqjoqgpbxhsfgcovipgu.supabase.co/functions/v1/scrape-and-create-minisite" -ForegroundColor White
    Write-Host "  Logs: Dashboard > Edge Functions > scrape-and-create-minisite" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Les headers CORS sont maintenant configurés correctement" -ForegroundColor Green
    Write-Host "✅ La création automatique de mini-site devrait fonctionner depuis Railway" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Échec du déploiement" -ForegroundColor Red
    Write-Host "Vérifiez les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
    exit 1
}

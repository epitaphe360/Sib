# Test simple de l'Edge Function send-visitor-welcome-email
# Usage: .\test-edge-function.ps1

Write-Host "Test Edge Function send-visitor-welcome-email..." -ForegroundColor Cyan
Write-Host ""

# Charger .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $Matches[1]
            $value = $Matches[2]
            Set-Item -Path "env:$name" -Value $value
        }
    }
    Write-Host "Fichier .env charge" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Fichier .env introuvable" -ForegroundColor Red
    exit 1
}

$SUPABASE_URL = $env:VITE_SUPABASE_URL
$ANON_KEY = $env:VITE_SUPABASE_ANON_KEY

Write-Host "URL: $SUPABASE_URL" -ForegroundColor Gray
Write-Host ""

# Payload de test
$body = @{
    email = "test@example.com"
    name = "Test User"
    level = "free"
    userId = "00000000-0000-0000-0000-000000000000"
} | ConvertTo-Json

Write-Host "Appel de l'Edge Function..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/functions/v1/send-visitor-welcome-email" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $ANON_KEY"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -ErrorAction Stop

    Write-Host ""
    Write-Host "SUCCESS - Edge Function DEPLOYEE et FONCTIONNELLE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Reponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    Write-Host ""
    Write-Host "Les emails seront envoyes lors des inscriptions!" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host ""
    if ($statusCode -eq 404) {
        Write-Host "ERREUR 404 - Edge Function NON DEPLOYEE" -ForegroundColor Red
        Write-Host ""
        Write-Host "La fonction send-visitor-welcome-email n existe pas sur Supabase." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Verifiez dans: https://app.supabase.com/project/eqjoqgpbxhsfgcovipgu/functions" -ForegroundColor Cyan
        
    } elseif ($statusCode -eq 500) {
        Write-Host "ERREUR 500 - Edge Function deployee mais ERREUR" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Causes possibles:" -ForegroundColor Cyan
        Write-Host "  - Variables SMTP manquantes dans Supabase" -ForegroundColor White
        Write-Host "  - Templates email absents dans table email_templates" -ForegroundColor White
        Write-Host "  - Erreur de connexion SMTP" -ForegroundColor White
        Write-Host ""
        if ($errorBody) {
            Write-Host "Details de l erreur:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Voir les logs: https://app.supabase.com/project/eqjoqgpbxhsfgcovipgu/functions" -ForegroundColor Cyan
        
    } else {
        Write-Host "ERREUR $statusCode - Erreur inattendue" -ForegroundColor Red
        Write-Host ""
        Write-Host $_.Exception.Message -ForegroundColor White
        if ($errorBody) {
            Write-Host ""
            Write-Host "Details:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan

$env:SUPABASE_ACCESS_TOKEN="sbp_efaf677c6e29b3626871762d913f63408ad9465c"

Write-Host "TEST Edge Function send-visitor-welcome-email" -ForegroundColor Cyan
Write-Host ""

$email = Read-Host "Entrez votre email pour le test"

Write-Host "Envoi de l'email de test..." -ForegroundColor Yellow

supabase functions invoke send-visitor-welcome-email --data @"
{
  \"email\": \"$email\",
  \"name\": \"Test User\",
  \"level\": \"free\",
  \"userId\": \"test-$(Get-Random -Maximum 9999)\"
}
"@

Write-Host "Test termine ! Verifiez votre boite email." -ForegroundColor Green
Write-Host ""
pause

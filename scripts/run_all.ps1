# scripts/run_all.ps1
param(
    [string]$DatabaseUrl = "postgres://postgres:SECRET@db.eqjoqgpbxhsfgcovipgu.supabase.co:5432/postgres"  # Remplacez par votre vraie URL
)

$env:DATABASE_URL = $DatabaseUrl

Write-Host "=== Appliquant les migrations ==="
node .\scripts\apply_sql.cjs --database-url $env:DATABASE_URL --continue-on-error | Tee-Object -FilePath migration.log

if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec des migrations. Vérifiez migration.log"
    exit 1
}

Write-Host "=== Créant les entités de test ==="
node .\scripts\create_test_entities.mjs --database-url $env:DATABASE_URL | Tee-Object -FilePath created.txt

if ($LASTEXITCODE -ne 0) {
    Write-Error "Échec de création des entités. Vérifiez created.txt"
    exit 1
}

# Extraire les IDs depuis created.txt
$visitorId = (Select-String -Path created.txt -Pattern "visitor_id: (.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
$timeSlotId = (Select-String -Path created.txt -Pattern "time_slot_id: (.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()

if (-not $visitorId -or -not $timeSlotId) {
    Write-Error "IDs non trouvés dans created.txt"
    exit 1
}

Write-Host "=== Lançant le test de concurrence (50 parallèles) ==="
node .\scripts\concurrent_book_test.mjs --database-url $env:DATABASE_URL --time-slot $timeSlotId --visitor $visitorId --parallel 50 | Tee-Object -FilePath concurrency.log

Write-Host "=== Terminé ==="
Write-Host "Logs : migration.log, created.txt, concurrency.log"
Write-Host "Vérifiez concurrency.log pour les résultats (succès/échec, atomicité)"

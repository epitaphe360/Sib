# Applique les migrations Supabase pending + enregistre l'historique
# Executer depuis la racine du repo : .\apps\mobile\scripts\supabase-apply-pending.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $Root

Write-Host "=== Repair migration history (si necessaire) ===" -ForegroundColor Cyan
npx supabase migration repair --status reverted 20251218 2>$null

$pending = @(
  "supabase/migrations/20260411000002_insert_official_partners.sql",
  "supabase/migrations/20260412000002_rename_siport_to_sib.sql",
  "supabase/migrations/20260601000002_create_site_banners.sql",
  "supabase/migrations/20260601000003_add_ministry_egide_banner.sql",
  "supabase/migrations/20260601000004_site_banner_storage.sql"
)

foreach ($file in $pending) {
  if (Test-Path $file) {
    Write-Host "Applying $file ..." -ForegroundColor Yellow
    npx supabase db query --linked --yes -f $file
  }
}

Write-Host "=== Register mobile migration ===" -ForegroundColor Cyan
npx supabase migration repair --status applied 20260602000001

Write-Host "=== Verify ===" -ForegroundColor Cyan
npx supabase db query --linked --yes "SELECT tablename FROM pg_tables WHERE tablename='exhibitor_leads';"

Write-Host "Done." -ForegroundColor Green

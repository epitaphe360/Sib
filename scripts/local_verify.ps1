# PowerShell script to verify site and plugin assets + Supabase API
# Usage: .\local_verify.ps1 -SiteUrl 'https://clone.siportevent.com' -PluginFolder 'siport-plugin'
param(
  [Parameter(Mandatory=$true)] [string] $SiteUrl,
  [Parameter(Mandatory=$true)] [string] $PluginFolder
)

Write-Host "Checking site root..."
try {
  $root = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 10
  Write-Host "Root status:" $root.StatusCode
} catch {
  Write-Host "Root request failed:" $_.Exception.Message
}

$indexUrl = "$SiteUrl/wp-content/plugins/$PluginFolder/dist/index.html"
Write-Host "Checking plugin index at $indexUrl"
try {
  $r = Invoke-WebRequest -Uri $indexUrl -UseBasicParsing -TimeoutSec 10
  Write-Host "Index status:" $r.StatusCode
} catch {
  Write-Host "Index request failed:" $_.Exception.Message
}

$assetUrl = "$SiteUrl/wp-content/plugins/$PluginFolder/dist/assets/index-B5srTJ5J.js"
Write-Host "Checking sample asset at $assetUrl"
try {
  $h = Invoke-WebRequest -Uri $assetUrl -Method Head -UseBasicParsing -TimeoutSec 10
  Write-Host "Asset status:" $h.StatusCode
} catch {
  Write-Host "Asset head request failed:" $_.Exception.Message
}

# Supabase API check (uses env VITE_SUPABASE_ANON_KEY)
$anon = $env:VITE_SUPABASE_ANON_KEY
if (-not $anon) {
  Write-Host "No VITE_SUPABASE_ANON_KEY in env; skipping Supabase API check"
  return
}

$api = "https://eqjoqgpbxhsfgcovipgu.supabase.co/rest/v1/exhibitors?select=*"
Write-Host "Checking Supabase exhibitors API"
try {
  $resp = Invoke-RestMethod -Uri $api -Headers @{ 'apikey'=$anon; 'Authorization'="Bearer $anon" } -Method Get -TimeoutSec 10
  Write-Host "Supabase returned" ($resp | Measure-Object).Count "rows"
} catch {
  Write-Host "Supabase request failed:" $_.Exception.Message
}

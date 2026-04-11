# Bridges VITE_* env vars to the server and starts the exhibitors fallback server in foreground.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-exhibitors-server.ps1

$ErrorActionPreference = 'Stop'

if (-not $env:SUPABASE_URL -and $env:VITE_SUPABASE_URL) { $env:SUPABASE_URL = $env:VITE_SUPABASE_URL }
if (-not $env:SUPABASE_SERVICE_ROLE_KEY -and $env:VITE_SUPABASE_SERVICE_ROLE_KEY) { $env:SUPABASE_SERVICE_ROLE_KEY = $env:VITE_SUPABASE_SERVICE_ROLE_KEY }
if (-not $env:EXHIBITORS_SECRET -and $env:VITE_EXHIBITORS_SECRET) { $env:EXHIBITORS_SECRET = $env:VITE_EXHIBITORS_SECRET }

# Default port fallback
if (-not $env:EXHIBITORS_PORT) { $env:EXHIBITORS_PORT = '4002' }

Write-Host "Starting exhibitors-server with:" -ForegroundColor Cyan
Write-Host "  SUPABASE_URL=$($env:SUPABASE_URL)"
Write-Host "  EXHIBITORS_PORT=$($env:EXHIBITORS_PORT)"

node server/exhibitors-server.cjs

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "[reinstall] Removing node_modules and lockfile..."
if (Test-Path -LiteralPath node_modules) {
  Remove-Item -Recurse -Force node_modules
  Write-Host "[reinstall] Removed node_modules"
} else {
  Write-Host "[reinstall] node_modules not found"
}

if (Test-Path -LiteralPath package-lock.json) {
  Remove-Item -Force package-lock.json
  Write-Host "[reinstall] Removed package-lock.json"
} else {
  Write-Host "[reinstall] package-lock.json not found"
}

Write-Host "[reinstall] Cleaning npm cache (optional)..."
try {
  npm cache clean --force | Out-Null
  Write-Host "[reinstall] npm cache cleaned"
} catch {
  Write-Warning "[reinstall] Failed to clean npm cache: $($_.Exception.Message)"
}

Write-Host "[reinstall] Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
  throw "npm install failed with exit code $LASTEXITCODE"
}

Write-Host "[reinstall] Done."

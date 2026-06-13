# Create local PostgreSQL user/database for Hazjak (Windows)
# Run: .\scripts\setup-local-postgres.ps1

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psql)) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $psql = $found.FullName }
    else {
        Write-Host "psql not found. Install PostgreSQL or update the path in this script." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Hazjak - local database setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enter the postgres superuser password (set at install time):"
$secure = Read-Host -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$postgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
$env:PGPASSWORD = $postgresPassword

$userSql = @'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hazjak') THEN
    CREATE USER hazjak WITH PASSWORD 'hazjak' CREATEDB LOGIN;
  ELSE
    ALTER USER hazjak WITH PASSWORD 'hazjak';
  END IF;
END
$$;
'@

try {
    & $psql -U postgres -h localhost -p 5432 -c $userSql 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Failed to create or update user hazjak" }

    $dbExists = & $psql -U postgres -h localhost -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname='hazjak'" 2>&1
    if ($dbExists -notmatch "1") {
        & $psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE hazjak OWNER hazjak;" 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Failed to create database hazjak" }
    } else {
        Write-Host "Database hazjak already exists" -ForegroundColor DarkYellow
    }
} catch {
    Write-Host ""
    Write-Host "Setup failed. Check:" -ForegroundColor Red
    Write-Host "  - postgres password is correct"
    Write-Host "  - PostgreSQL service is running (services.msc -> postgresql-x64-18)"
    exit 1
} finally {
    $env:PGPASSWORD = ""
}

$envContent = 'DATABASE_URL="postgresql://hazjak:hazjak@localhost:5432/hazjak"'
$root = Split-Path $PSScriptRoot -Parent
Set-Content -Path (Join-Path $root ".env") -Value @(
    $envContent
    'JWT_SECRET="change-me-in-production"'
    'REFRESH_SECRET="change-me-refresh"'
    'CORS_ORIGIN="http://localhost:3000"'
    'WEB_URL="http://localhost:3000"'
    'ADMIN_URL="http://localhost:3001"'
    'API_PORT=4000'
) -Encoding UTF8
Write-Host ""
Write-Host ".env updated for port 5432" -ForegroundColor Green
Write-Host "Next from repo root:"
Write-Host "  pnpm db:push"
Write-Host "  pnpm db:seed"
Write-Host "  pnpm db:test"
Write-Host ""

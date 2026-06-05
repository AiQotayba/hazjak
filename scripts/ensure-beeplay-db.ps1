# Idempotent BeePlay DB user/database setup (local PostgreSQL on 5432)
# Usage:
#   $env:PGPASSWORD = "your-postgres-password"
#   .\scripts\ensure-beeplay-db.ps1
# Or:
#   .\scripts\ensure-beeplay-db.ps1 -PostgresPassword "your-postgres-password"

param(
    [string]$PostgresPassword = $env:PGPASSWORD,
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psql)) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $psql = $found.FullName }
    else {
        Write-Host "psql not found. Install PostgreSQL or use Docker: docker compose up -d" -ForegroundColor Red
        exit 1
    }
}

if (-not $PostgresPassword) {
    Write-Host ""
    Write-Host "BeePlay — إعداد قاعدة البيانات المحلية" -ForegroundColor Cyan
    Write-Host "أدخل كلمة مرور مستخدم postgres:"
    $secure = Read-Host -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

$env:PGPASSWORD = $PostgresPassword
$root = Split-Path $PSScriptRoot -Parent

$userSql = @'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'beeplay') THEN
    CREATE USER beeplay WITH PASSWORD 'beeplay' CREATEDB LOGIN;
  ELSE
    ALTER USER beeplay WITH PASSWORD 'beeplay';
  END IF;
END
$$;
'@

try {
    & $psql -U postgres -h localhost -p $Port -c $userSql 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Failed to create or update user beeplay" }

    $dbExists = (& $psql -U postgres -h localhost -p $Port -tAc "SELECT 1 FROM pg_database WHERE datname='beeplay'" 2>&1).Trim()
    if ($dbExists -ne "1") {
        & $psql -U postgres -h localhost -p $Port -c "CREATE DATABASE beeplay OWNER beeplay;" 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) { throw "Failed to create database beeplay" }
    } else {
        Write-Host "Database beeplay already exists" -ForegroundColor DarkYellow
    }

    & $psql -U beeplay -h localhost -p $Port -d beeplay -tAc "SELECT 1" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "beeplay user cannot connect to beeplay database" }

    Write-Host ""
    Write-Host "Database ready." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Setup failed: $_" -ForegroundColor Red
    Write-Host "Check postgres password and that service postgresql-x64-* is running." -ForegroundColor Yellow
    exit 1
} finally {
    $env:PGPASSWORD = ""
}

$envPath = Join-Path $root ".env"
$url = "DATABASE_URL=`"postgresql://beeplay:beeplay@localhost:${Port}/beeplay`""
$lines = @(
    $url
    'JWT_SECRET="change-me-in-production"'
    'REFRESH_SECRET="change-me-refresh"'
    'CORS_ORIGIN="http://localhost:3000"'
    'WEB_URL="http://localhost:3000"'
    'ADMIN_URL="http://localhost:3001"'
    'API_PORT=4000'
)
Set-Content -Path $envPath -Value $lines -Encoding UTF8
Write-Host ".env updated ($url)" -ForegroundColor Green
Write-Host ""
Write-Host "Next:"
Write-Host "  pnpm db:push"
Write-Host "  pnpm db:seed"
Write-Host "  pnpm db:test"

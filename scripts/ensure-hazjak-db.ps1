# Idempotent Hazjak DB user/database setup (local PostgreSQL on 5432)
# Usage:
#   $env:PGPASSWORD = "your-postgres-password"
#   .\scripts\ensure-hazjak-db.ps1
# Or:
#   .\scripts\ensure-hazjak-db.ps1 -PostgresPassword "your-postgres-password"

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
    Write-Host "Hazjak — إعداد قاعدة البيانات المحلية" -ForegroundColor Cyan
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
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hazjak') THEN
    CREATE USER hazjak WITH PASSWORD 'hazjak' CREATEDB LOGIN;
  ELSE
    ALTER USER hazjak WITH PASSWORD 'hazjak';
  END IF;
END
$$;
'@

try {
    & $psql -U postgres -h localhost -p $Port -c $userSql 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Failed to create or update user hazjak" }

    $dbExists = (& $psql -U postgres -h localhost -p $Port -tAc "SELECT 1 FROM pg_database WHERE datname='hazjak'" 2>&1).Trim()
    if ($dbExists -ne "1") {
        & $psql -U postgres -h localhost -p $Port -c "CREATE DATABASE hazjak OWNER hazjak;" 2>&1 | Out-Host
        if ($LASTEXITCODE -ne 0) { throw "Failed to create database hazjak" }
    } else {
        Write-Host "Database hazjak already exists" -ForegroundColor DarkYellow
    }

    & $psql -U hazjak -h localhost -p $Port -d hazjak -tAc "SELECT 1" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "hazjak user cannot connect to hazjak database" }

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
$url = "DATABASE_URL=`"postgresql://hazjak:hazjak@localhost:${Port}/hazjak`""
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

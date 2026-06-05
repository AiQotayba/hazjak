-- نفّذ كمستخدم postgres (مدير):
--   psql -U postgres -h localhost -p 5432 -f scripts/create-beeplay-user.sql
-- أو الأفضل على Windows:
--   .\scripts\ensure-beeplay-db.ps1

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'beeplay') THEN
    CREATE USER beeplay WITH PASSWORD 'beeplay' CREATEDB LOGIN;
  ELSE
    ALTER USER beeplay WITH PASSWORD 'beeplay';
  END IF;
END
$$;

-- إن لم تكن قاعدة beeplay موجودة، نفّذ يدوياً:
-- CREATE DATABASE beeplay OWNER beeplay;
